import type { PlayerAPI, PlayerEvent, SegmentPlaybackEvent, SegmentRequestFinishedEvent } from 'bitmovin-player';
import type { SegmentParsedEvent } from 'bitmovin-player/types/core/Events';

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
  /** Whether the player lists the rendition now. A multi-period source lists only the current period's renditions. */
  isListed: boolean;
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
  /** End in seconds as declared by the manifest. Equal to `start` until a request for the segment is reported. */
  end: number;
  /** Start in seconds on the playback timeline, read from the segment itself. */
  mediaStart?: number;
  /** End in seconds on the playback timeline, read from the segment itself. */
  mediaEnd?: number;
  /** The outcome of the latest request for the segment. */
  outcome: 'downloaded' | 'failed';
  /** Failed HTTP attempts over every request for the segment. */
  failures: number;
  played: boolean;
  /** Throughput of the first network download that measured one, in Mbps. */
  mbps?: number;
  /** Whether the browser's HTTP cache answered every request for the segment. */
  httpCache?: boolean;
  /** Whether the prefetching loader downloaded the segment ahead of playback. */
  prefetched?: boolean;
  /** How many times the player refilled the segment from its own segment cache, without a request. */
  reused?: number;
  url?: string;
}

export interface LastDownload {
  at: number;
  duration: number;
}

/** Where a record sits on the playback timeline: its parsed span where the player reported one. */
export function mediaSpan(record: SegmentRecord): { start: number; end: number } {
  return { start: record.mediaStart ?? record.start, end: record.mediaEnd ?? record.end };
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
  private readonly lastDownloads: Partial<Record<SegmentMediaType, LastDownload>> = {};
  /**
   * From `AdBreakStarted` to `AdBreakFinished`. `ads.isLinearAdActive()` alone is false before the first
   * ad of a break starts and between its ads, while the player already reports the ad break.
   */
  private adBreakActive = false;

  initialize(player: PlayerAPI): void {
    const events = player.exports.PlayerEvent;
    this.player = player;
    player.on(events.Ready, this.updateRenditions);
    player.on(events.PeriodSwitched, this.updateRenditions);
    player.on(events.VideoQualityAdded, this.updateRenditions);
    player.on(events.AudioAdded, this.updateRenditions);
    player.on(events.SourceUnloaded, this.reset);
    player.on(events.SegmentRequestFinished, this.onSegmentRequestFinished);
    player.on(events.SegmentPlayback, this.onSegmentPlayback);
    player.on(segmentParsedEvent(player), this.onSegmentParsed);
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
    player.off(events.PeriodSwitched, this.updateRenditions);
    player.off(events.VideoQualityAdded, this.updateRenditions);
    player.off(events.AudioAdded, this.updateRenditions);
    player.off(events.SourceUnloaded, this.reset);
    player.off(events.SegmentRequestFinished, this.onSegmentRequestFinished);
    player.off(events.SegmentPlayback, this.onSegmentPlayback);
    player.off(segmentParsedEvent(player), this.onSegmentParsed);
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

  /** When, by `Date.now()`, the last media segment of a media type downloaded, and its duration. */
  getLastDownload(mediaType: SegmentMediaType): LastDownload | undefined {
    return this.lastDownloads[mediaType];
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
    delete this.lastDownloads.video;
    delete this.lastDownloads.audio;
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
      isListed: true,
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
            isListed: true,
          });
        } else {
          qualities.forEach(quality =>
            listed.push({
              id: quality.id,
              mediaType: 'audio',
              label: `${track.lang} ${quality.label}`,
              bitrate: quality.bitrate,
              isListed: true,
            }),
          );
        }
      });

    // A multi-period source lists only the current period's qualities. The renditions of earlier periods, and
    // of removed qualities, stay until the source unloads, because their segments are still recorded.
    const listedIds = listed.map(rendition => rendition.id);
    this.setRenditions(
      listed.concat(
        this.renditions
          .filter(rendition => !listedIds.includes(rendition.id))
          .map(rendition => ({ ...rendition, isListed: false })),
      ),
    );
  };

  /** Keeps the renditions in lane order. */
  private setRenditions(renditions: PlayerGraphsRendition[]): void {
    const ofType = (mediaType: SegmentMediaType) =>
      renditions
        .filter(rendition => rendition.mediaType === mediaType)
        .sort((left, right) => right.bitrate - left.bitrate);
    this.renditions = ofType('video').concat(ofType('audio'));
  }

  /**
   * Adds a rendition the player does not list for a recorded segment, named by its ID, as for the next period's
   * segments that download before the player switches to that period. A bitrate the segment reports replaces a
   * missing one.
   */
  private addUnlistedRendition(record: SegmentRecord, bitrate: number | undefined): void {
    const id = record.representationId;
    const known = this.renditions.find(rendition => rendition.id === id);
    const isNewBitrate = known != null && !known.isListed && !(known.bitrate > 0) && bitrate > 0;
    if (known && !isNewBitrate) {
      return;
    }

    const unlisted = {
      id,
      mediaType: record.mediaType,
      label: id,
      bitrate: bitrate > 0 ? bitrate : 0,
      isListed: false,
    };
    this.setRenditions(this.renditions.filter(rendition => rendition !== known).concat(unlisted));
  }

  private readonly onSegmentRequestFinished = (event: SegmentRequestFinishedEvent): void => {
    // During an ad break, only the content segments prefetched to resume with are content.
    if (this.isAdPlaying() && !event.wasPrefetched) {
      return;
    }

    const mediaType = toMediaType(event.mimeType);
    // Ahead of the checks below: a TS segment reports no start time until the timing is established,
    // and its download still shows that downloads go on.
    if (event.success && !event.isInit && mediaType != null) {
      this.lastDownloads[mediaType] = { at: Date.now(), duration: event.duration };
    }
    if (
      event.isInit ||
      event.uid == null ||
      mediaType == null ||
      event.representationId == null ||
      !Number.isFinite(event.startTime) ||
      !(event.duration > 0) ||
      isCancelledWithoutFailure(event)
    ) {
      return;
    }

    const httpCache = event.success && event.loadedFrom === 'httpCache';
    const record = this.recordFor(event.uid, {
      representationId: event.representationId,
      mediaType,
      start: event.startTime,
      url: event.url,
    });
    // A record created from a parsed chunk of chunked CMAF gets its declared span from the request.
    record.end = event.startTime + event.duration;
    record.outcome = event.success ? 'downloaded' : 'failed';
    record.failures += countFailures(event);
    // A segment re-requested from the HTTP cache after a network download, as after an ad break, stays a network download.
    // A record created from a parsed chunk has no request outcome yet, so its first request decides.
    record.httpCache = (record.httpCache ?? true) && httpCache;
    record.prefetched = record.prefetched || event.wasPrefetched === true;
    this.addUnlistedRendition(record, undefined);

    if (event.success && !httpCache && record.mbps == null) {
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

  private readonly onSegmentParsed = (event: SegmentParsedEvent): void => {
    const mediaType = toMediaType(event.mimeType);
    if (this.isAdPlaying() || mediaType == null || event.representationId == null || !Number.isFinite(event.duration)) {
      return;
    }
    const existing = this.records.get(event.uid);
    // A muxed TS segment is parsed into a video and an audio part, both under the video rendition.
    // The part of the record's own media type describes it.
    if (existing ? existing.mediaType !== mediaType : !Number.isFinite(event.startTime)) {
      return;
    }

    const record = this.recordFor(event.uid, {
      representationId: event.representationId,
      mediaType,
      start: event.startTime,
      url: event.url,
    });
    // `playbackTime` is unknown for transmuxed TS until the timing is established, and that has no offset to subtract.
    const start = Number.isFinite(event.playbackTime) ? event.playbackTime : event.presentationTimestamp;
    // Chunked CMAF reports each chunk of a segment, so the segment spans all of them.
    record.mediaStart = Math.min(record.mediaStart ?? start, start);
    record.mediaEnd = Math.max(record.mediaEnd ?? start, start + event.duration);
    if (event.loadedFrom === 'cache') {
      record.reused = (record.reused ?? 0) + 1;
    }
    this.addUnlistedRendition(record, event.mediaInfo?.bitrate);
  };

  private readonly onAdBreakStarted = (): void => {
    this.adBreakActive = true;
  };

  private readonly onAdBreakFinished = (): void => {
    this.adBreakActive = false;
  };

  private recordFor(
    uid: string,
    fields: Pick<SegmentRecord, 'representationId' | 'mediaType' | 'start' | 'url'>,
  ): SegmentRecord {
    const existing = this.records.get(uid);
    if (existing) {
      return existing;
    }

    const record: SegmentRecord = {
      uid,
      ...fields,
      end: fields.start,
      outcome: 'downloaded',
      failures: 0,
      played: false,
    };
    this.records.set(uid, record);
    if (this.records.size > MAX_RECORDS) {
      this.records.delete(this.records.keys().next().value);
    }

    return record;
  }
}

/** `PlayerEvent` is an enum and cannot be augmented until the typings carry the event. */
function segmentParsedEvent(player: PlayerAPI): PlayerEvent {
  return (player.exports.PlayerEvent as unknown as Record<string, PlayerEvent>).SegmentParsed;
}

/** The media type of a segment the graphs plot, or null for subtitle and metadata segments. */
function toMediaType(mimeType: string | undefined): SegmentMediaType | null {
  if (mimeType?.startsWith('video/')) {
    return 'video';
  }

  return mimeType?.startsWith('audio/') ? 'audio' : null;
}

/**
 * A successful request's last attempt is the one that worked. Each attempt of a failed or cancelled
 * request failed. A custom segment loader of the player can leave the count undefined.
 */
function countFailures({ success, attempt }: SegmentRequestFinishedEvent): number {
  if (!Number.isFinite(attempt)) {
    return 0;
  }

  return success ? attempt - 1 : attempt;
}

/**
 * A request the player cancelled because it no longer wanted the segment, as for a seek or a track
 * switch, or one that adaptation abandoned after it received data. A request abandoned without any
 * data, as from a server that does not answer, and a timeout stay failures.
 */
function isCancelledWithoutFailure({ cancelReason, size }: SegmentRequestFinishedEvent): boolean {
  return cancelReason === 'cancel' || (cancelReason === 'abr' && size > 0);
}
