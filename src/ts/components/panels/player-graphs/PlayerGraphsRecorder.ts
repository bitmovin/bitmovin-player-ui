import type { Bitmovin8Adapter, ErrorEvent, PlayerAPI, SourceConfig } from 'bitmovin-player';
import { PlayerGraphsRendition, SegmentHistory, SegmentMediaType, SegmentRecord } from '../../../utils/SegmentHistory';
import { version } from '../../../version';
import { DownloadWait, formatPlayheadTime, GraphFrame, PlayerGraphsPlayerState } from './GraphCanvas';
import { collectInsights, describeError, findTimingDrifts, PlayerGraphsInsight } from './playerGraphsInsights';

/**
 * Everything the graphs are drawn from, as plain JSON, so a session can be attached to a support
 * ticket and drawn again elsewhere with {@link PlayerGraphsPanel.loadSnapshot}.
 */
export interface PlayerGraphsSnapshot {
  format: 'bitmovin-player-graphs';
  version: 1;
  /** When it was exported, ISO 8601. */
  exportedAt: string;
  /** The UI version that exported it. */
  uiVersion: string;
  /** The findings at export, ahead of the bulk data so they are the first thing read in the file. */
  insights: PlayerGraphsInsight[];
  player: PlayerGraphsPlayerState;
  /** The lanes, in lane order. */
  renditions: PlayerGraphsRendition[];
  segments: SegmentRecord[];
}

export const SNAPSHOT_FORMAT = 'bitmovin-player-graphs';
export const SNAPSHOT_VERSION = 1;
export const EMPTY_STATE: PlayerGraphsPlayerState = {
  currentTime: 0,
  seekableStart: 0,
  seekableEnd: 0,
  isLive: false,
  activeRenditionIds: [],
  muxedAudio: false,
};
/** A media type without a download for this many segment durations, and at least this long, waits for one. */
const DOWNLOAD_WAIT_SEGMENTS = 2;
const MIN_DOWNLOAD_WAIT_SECONDS = 4;
const ANALYTICS_HINT =
  '[player-graphs] No Bitmovin Analytics session is linked to this player. With Analytics, each graphs ' +
  'snapshot names its impression ID, which opens the same session in the Bitmovin Dashboard. ' +
  'See https://developer.bitmovin.com/playback/docs/setup-analytics-web.';

/**
 * The recording behind the player graphs of one player: the segment history, the last player state, and a
 * snapshot that it writes to the console at each player error.
 */
export class PlayerGraphsRecorder {
  readonly history = new SegmentHistory();
  private player: PlayerAPI | null = null;
  /**
   * The last player state read while live. It stands in while an ad plays, and for a snapshot at a
   * player error, because the player has dropped the source by the time the error event fires.
   */
  private lastLiveState: PlayerGraphsPlayerState | null = null;
  private errorSnapshot: PlayerGraphsSnapshot | null = null;
  private analyticsHintLogged = false;

  initialize(player: PlayerAPI): void {
    const events = player.exports.PlayerEvent;
    this.player = player;
    this.history.initialize(player);
    player.on(events.SourceUnloaded, this.onSourceUnloaded);
    player.on(events.SegmentPlayback, this.onSegmentPlayback);
    player.on(events.Error, this.onError);
  }

  release(): void {
    this.history.release();
    const player = this.player;
    if (player) {
      const events = player.exports.PlayerEvent;
      player.off(events.SourceUnloaded, this.onSourceUnloaded);
      player.off(events.SegmentPlayback, this.onSegmentPlayback);
      player.off(events.Error, this.onError);
    }
    this.player = null;
  }

  /** The player state now, or the state from before the ad break while an ad plays. Null after release. */
  readLiveState(): PlayerGraphsPlayerState | null {
    if (!this.player) {
      return null;
    }
    if (this.history.isAdPlaying() && this.lastLiveState) {
      return this.lastLiveState;
    }

    this.lastLiveState = readPlayerState(this.player, this.history);

    return this.lastLiveState;
  }

  /** The snapshot taken at the most recent player error, or null. Shared: a caller that hands it out copies it. */
  getErrorSnapshot(): PlayerGraphsSnapshot | null {
    return this.errorSnapshot;
  }

  buildSnapshot(state: PlayerGraphsPlayerState): PlayerGraphsSnapshot {
    const frame: GraphFrame = {
      records: this.history.getRecords().map(record => ({ ...record })),
      renditions: this.history.getRenditions(),
      state,
      currentTime: state.currentTime,
      stillView: true,
      unsized: {},
    };

    return {
      format: SNAPSHOT_FORMAT,
      version: SNAPSHOT_VERSION,
      exportedAt: new Date().toISOString(),
      uiVersion: version,
      insights: collectInsights(frame, findTimingDrifts(frame), -Infinity),
      player: state,
      renditions: frame.renditions.slice(),
      segments: frame.records.slice(),
    };
  }

  private readonly onSourceUnloaded = (): void => {
    this.lastLiveState = null;
  };

  /** Keeps the live state current while no panel is shown, for a snapshot at a player error. */
  private readonly onSegmentPlayback = (): void => {
    const state = this.readLiveState();
    if (state && !state.impressionId && !this.analyticsHintLogged) {
      this.analyticsHintLogged = true;
      console.info(ANALYTICS_HINT);
    }
  };

  /** Takes a snapshot of the session at a player error and writes it to the console. */
  private readonly onError = (event: ErrorEvent): void => {
    const snapshot = this.buildSnapshot(this.lastLiveState ?? this.readLiveState() ?? EMPTY_STATE);
    const at = formatPlayheadTime(snapshot.player.currentTime, true);
    snapshot.insights.unshift(describeError(event.code, event.name, event.message, at));
    this.errorSnapshot = snapshot;
    console.warn(
      `[player-graphs] Snapshot at player error ${event.code}; load it with the graphs panel's Import:\n` +
        JSON.stringify(snapshot),
    );
  };
}

function readPlayerState(player: PlayerAPI, history: SegmentHistory): PlayerGraphsPlayerState {
  const isLive = player.isLive();
  const currentTime = player.getCurrentTime();
  const liveEdge = isLive ? currentTime - player.getTimeShift() : undefined;
  let { start: seekableStart, end: seekableEnd } = player.getSeekableRange();
  // Some live HLS sources report a seekable range of `{ -1, -1 }`, while the time shift window is known.
  if (liveEdge != null && !(seekableEnd > seekableStart)) {
    seekableEnd = liveEdge;
    seekableStart = liveEdge + Math.min(0, player.getMaxTimeShift());
  }
  // Before the first frame of a media type is decoded, the player reports a placeholder that is no known rendition.
  const knownIds = history.getRenditions().map(rendition => rendition.id);
  const bufferLevel = (mediaType: SegmentMediaType) =>
    player.buffer.getLevel(
      player.exports.BufferType.ForwardDuration,
      mediaType === 'video' ? player.exports.MediaType.Video : player.exports.MediaType.Audio,
    );
  const bufferTargets: PlayerGraphsPlayerState['bufferTargets'] = {};
  const downloadWaits: PlayerGraphsPlayerState['downloadWaits'] = {};
  (['video', 'audio'] as const).forEach(mediaType => {
    const { level, targetLevel } = bufferLevel(mediaType);
    bufferTargets[mediaType] = targetLevel;
    const wait = readDownloadWait(
      history,
      mediaType,
      level,
      targetLevel,
      isLive ? Infinity : player.getDuration() - currentTime,
    );
    if (wait) {
      downloadWaits[mediaType] = { ...wait, bufferEnd: currentTime + level };
    }
  });

  return {
    version: player.version,
    source: resolveSourceUrl(player.getSource()),
    streamType: player.getStreamType(),
    impressionId: readImpressionId(player),
    currentTime,
    seekableStart,
    seekableEnd,
    isLive,
    liveEdge,
    activeRenditionIds: [player.getPlaybackVideoData().id, player.getPlaybackAudioData().id].filter(id =>
      knownIds.includes(id),
    ),
    muxedAudio: player.getAudio()?.isMuxedIntoVideo === true,
    bufferTargets,
    downloadWaits,
  };
}

/**
 * How long a media type has gone without a downloaded segment, where that is longer than a download
 * should take while the buffer has room for another segment. The room reaches up to the buffer
 * target, or up to the end of a stream that ends sooner. The player reports a request only when it
 * ends, so this is the only sign of a request the server holds open, and the same sign a player
 * gives that has stopped requesting.
 */
function readDownloadWait(
  history: SegmentHistory,
  mediaType: SegmentMediaType,
  level: number,
  targetLevel: number,
  remaining: number,
): Pick<DownloadWait, 'seconds'> | undefined {
  const last = history.getLastDownload(mediaType);
  if (!last || !Number.isFinite(level) || !Number.isFinite(targetLevel)) {
    return undefined;
  }

  const seconds = (Date.now() - last.at) / 1000;
  const segment = last.duration > 0 ? last.duration : 0;
  const room = Math.min(targetLevel, remaining) - level;

  return seconds >= Math.max(MIN_DOWNLOAD_WAIT_SECONDS, DOWNLOAD_WAIT_SEGMENTS * segment) && room > segment
    ? { seconds }
    : undefined;
}

function resolveSourceUrl(source: SourceConfig | null): string | undefined {
  return [source?.dash, source?.hls, source?.smooth, source?.progressive].find(
    (url): url is string => typeof url === 'string' && url.length > 0,
  );
}

/** `player.analytics` is absent without the analytics module, and the collector can throw before it is set up. */
function readImpressionId(player: PlayerAPI): string | undefined {
  try {
    return (player.analytics as Bitmovin8Adapter | undefined)?.getCurrentImpressionId() || undefined;
  } catch {
    return undefined;
  }
}
