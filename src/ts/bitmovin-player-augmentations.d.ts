/**
 * Player API fields the player graphs read that are not in the released `bitmovin-player` typings yet.
 * Delete this file, and its entry in `tsconfig.json`, once they ship.
 */
// The empty export makes this file a module, so the blocks below merge into the existing interfaces.
export {};

declare module 'bitmovin-player/types/core/Events' {
  interface SegmentRequestFinishedEvent {
    /** The playback start time of the segment in seconds. Undefined for init segments. */
    startTime?: number;
    /** The ID of the representation the segment belongs to. Undefined for init segments. */
    representationId?: string;
    /** Whether the prefetching loader downloaded the segment ahead of playback. */
    wasPrefetched?: boolean;
    /** The number of HTTP attempts the request took. */
    attempts?: number;
    /** Why the player cancelled the request. On such an event, `size` is the bytes received, `-1` for none. */
    cancelReason?: 'timeout' | 'abr' | 'cancel';
    /** Whether the network or the browser's HTTP cache answered a successful request. */
    loadedFrom?: 'network' | 'httpCache';
  }

  /** Reported once a media segment has been downloaded and parsed, with the timing read from the segment. */
  interface SegmentParsedEvent extends PlayerEventBase {
    url: string;
    /** Matches the `uid` of the request that loaded the segment. */
    uid: string;
    mimeType: string;
    /** Start of the segment on the playback timeline, read from the segment. */
    playbackTime: number;
    /** The time encoded in the segment, without the presentation time offset applied. */
    presentationTimestamp: number;
    duration: number;
    /** Start of the segment as declared by the manifest. */
    startTime?: number;
    representationId?: string;
    /** Where the segment data came from. `cache` is a player-internal segment cache, reused without a request. */
    loadedFrom: 'network' | 'httpCache' | 'prefetch' | 'cache';
  }
}

declare module 'bitmovin-player/types/core/PlayerAPI' {
  interface AudioTrack {
    /** Whether the audio of the track is carried in the video segments. */
    isMuxedIntoVideo?: boolean;
  }
}
