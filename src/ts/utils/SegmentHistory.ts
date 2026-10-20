import type { PlayerAPI, SegmentPlaybackEvent, SegmentRequestFinishedEvent } from 'bitmovin-player';

export type SegmentMediaType = 'video' | 'audio';

/**
 * A video or audio rendition the player lists, as one lane of the segment timeline.
 */
export interface PlayerGraphsRendition {
  /** Matches the `id` of the player's quality and the `representationId` of its segment events. */
  id: string;
  mediaType: SegmentMediaType;
  label: string;
  /** In bits per second, 0 where the player reports none. */
  bitrate: number;
}

/**
 * One media segment as the player reported it.
 */
export interface SegmentRecord {
  /** The player's segment ID, unique per segment, which joins its request and playback events. */
  uid: string;
  representationId: string;
  mediaType: SegmentMediaType;
  /** Start in seconds as declared by the manifest. */
  start: number;
  /** End in seconds as declared by the manifest. */
  end: number;
  /** The outcome of the latest request for the segment. */
  outcome: 'downloaded' | 'failed';
  /** Failed HTTP attempts over every request for the segment. */
  failures: number;
  played: boolean;
  /** Throughput of the first download that measured one, in Mbps. */
  mbps?: number;
  url?: string;
}

/**
 * How many records are kept. The oldest are dropped first.
 */
const MAX_RECORDS = 20000;

/**
 * Records the segments, renditions and download facts the player reports, for the player graphs.
 * Recording runs from {@link initialize} to {@link release}, independent of whether a graph is shown.
 */
export class SegmentHistory {
  private player: PlayerAPI | null = null;
  private renditions: PlayerGraphsRendition[] = [];
  private readonly records = new Map<string, SegmentRecord>();
  private readonly unsized: Partial<Record<SegmentMediaType, number>> = {};
  private adBreakActive = false;

  initialize(player: PlayerAPI): void {
    const events = player.exports.PlayerEvent;
    this.player = player;
    player.on(events.Ready, this.updateRenditions);
    player.on(events.SourceUnloaded, this.reset);
    player.on(events.SegmentRequestFinished, this.onSegmentRequestFinished);
    player.on(events.SegmentPlayback, this.onSegmentPlayback);
    player.on(events.AdBreakStarted, this.onAdBreakStarted);
    player.on(events.AdBreakFinished, this.onAdBreakFinished);
    // A UI built after `Ready`, as after a UI variant switch, gets its lanes without waiting for the next source.
    this.updateRenditions();
  }

  release(): void {
    const player = this.player;
    if (!player) {
      return;
    }

    const events = player.exports.PlayerEvent;
    player.off(events.Ready, this.updateRenditions);
    player.off(events.SourceUnloaded, this.reset);
    player.off(events.SegmentRequestFinished, this.onSegmentRequestFinished);
    player.off(events.SegmentPlayback, this.onSegmentPlayback);
    player.off(events.AdBreakStarted, this.onAdBreakStarted);
    player.off(events.AdBreakFinished, this.onAdBreakFinished);
    this.player = null;
  }

  /** The renditions in lane order: video, then audio, highest bitrate first within each. */
  getRenditions(): PlayerGraphsRendition[] {
    return this.renditions.map(rendition => ({ ...rendition }));
  }

  /** The records in arrival order. The array is a copy, the records are not. */
  getRecords(): readonly SegmentRecord[] {
    return Array.from(this.records.values());
  }

  /** How many successful downloads of a media type reported no size, as chunked CMAF does. */
  getUnsizedCount(mediaType: SegmentMediaType): number {
    return this.unsized[mediaType] ?? 0;
  }

  /**
   * Whether a linear ad plays in place of the content. The player then reports the ad's position and
   * downloads as its own.
   */
  isAdPlaying(): boolean {
    if (this.adBreakActive) {
      return true;
    }

    try {
      return this.player?.ads?.isLinearAdActive?.() === true;
    } catch {
      return false;
    }
  }

  private readonly reset = (): void => {
    this.renditions = [];
    this.records.clear();
    delete this.unsized.video;
    delete this.unsized.audio;
    this.adBreakActive = false;
  };

  private readonly updateRenditions = (): void => {
    const player = this.player;
    if (!player) {
      return;
    }

    const listed: PlayerGraphsRendition[] = player.getAvailableVideoQualities().map(quality => ({
      id: quality.id,
      mediaType: 'video',
      label: quality.label,
      bitrate: quality.bitrate,
    }));
    player
      .getAvailableAudio()
      .filter(track => !track.isMuxedIntoVideo)
      .forEach(track => {
        const qualities = track.getQualities();
        if (qualities.length <= 1) {
          listed.push({
            id: qualities[0]?.id ?? track.id,
            mediaType: 'audio',
            label: track.lang,
            bitrate: qualities[0]?.bitrate ?? 0,
          });
        } else {
          qualities.forEach(quality =>
            listed.push({
              id: quality.id,
              mediaType: 'audio',
              label: `${track.lang} ${quality.label}`,
              bitrate: quality.bitrate,
            }),
          );
        }
      });

    // A multi-period source lists only the current period's qualities at each `Ready`. The lanes of
    // earlier periods stay until the source unloads.
    const listedIds = listed.map(rendition => rendition.id);
    const all = listed.concat(this.renditions.filter(rendition => !listedIds.includes(rendition.id)));
    const ofType = (mediaType: SegmentMediaType) =>
      all.filter(rendition => rendition.mediaType === mediaType).sort((left, right) => right.bitrate - left.bitrate);
    this.renditions = ofType('video').concat(ofType('audio'));
  };

  private readonly onSegmentRequestFinished = (event: SegmentRequestFinishedEvent): void => {
    // During an ad break, only the content segments prefetched to resume with are content.
    if (this.isAdPlaying() && !event.wasPrefetched) {
      return;
    }

    const mediaType = toMediaType(event.mimeType);
    if (
      event.isInit ||
      mediaType == null ||
      event.representationId == null ||
      !Number.isFinite(event.startTime) ||
      !(event.duration > 0) ||
      isCancelledWithoutFailure(event)
    ) {
      return;
    }

    const record = this.recordFor(event.uid ?? `${event.url}@${event.startTime}`, {
      representationId: event.representationId,
      mediaType,
      start: event.startTime,
      end: event.startTime + event.duration,
      url: event.url,
    });
    record.outcome = event.success ? 'downloaded' : 'failed';
    record.failures += countFailures(event);

    if (event.success && record.mbps == null) {
      if (event.size > 0 && event.downloadTime > 0) {
        record.mbps = (event.size * 8) / event.downloadTime / 1e6;
      } else {
        this.unsized[mediaType] = this.getUnsizedCount(mediaType) + 1;
      }
    }
  };

  private readonly onSegmentPlayback = (event: SegmentPlaybackEvent): void => {
    const record = event.uid != null ? this.records.get(event.uid) : undefined;
    if (record) {
      record.played = true;
    }
  };

  private readonly onAdBreakStarted = (): void => {
    this.adBreakActive = true;
  };

  private readonly onAdBreakFinished = (): void => {
    this.adBreakActive = false;
  };

  private recordFor(
    uid: string,
    fields: Pick<SegmentRecord, 'representationId' | 'mediaType' | 'start' | 'end' | 'url'>,
  ): SegmentRecord {
    const existing = this.records.get(uid);
    if (existing) {
      return existing;
    }

    const record: SegmentRecord = { uid, ...fields, outcome: 'downloaded', failures: 0, played: false };
    this.records.set(uid, record);
    if (this.records.size > MAX_RECORDS) {
      this.records.delete(this.records.keys().next().value);
    }

    return record;
  }
}

/** The media type of a segment the graphs plot, or null for subtitle and metadata segments. */
function toMediaType(mimeType: string | undefined): SegmentMediaType | null {
  if (mimeType?.startsWith('video/')) {
    return 'video';
  }

  return mimeType?.startsWith('audio/') ? 'audio' : null;
}

/** A successful request's last attempt is the one that worked, a failed request exhausted all of them. */
function countFailures({ success, attempts }: SegmentRequestFinishedEvent): number {
  if (!Number.isFinite(attempts)) {
    return 0;
  }

  return success ? Math.max(0, attempts - 1) : attempts;
}

/**
 * A request the player cancelled because it no longer wanted the segment, as for a seek or a track
 * switch, or one that adaptation abandoned after it received data. A request abandoned without any
 * data, as from a server that does not answer, and a timeout stay failures.
 */
function isCancelledWithoutFailure({ cancelReason, size }: SegmentRequestFinishedEvent): boolean {
  return cancelReason === 'cancel' || (cancelReason === 'abr' && size > 0);
}
