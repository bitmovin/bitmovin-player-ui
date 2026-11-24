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
    /** How many HTTP requests the player sent for the segment, also for a cancelled request. */
    attempt?: number;
    /**
     * Why the player cancelled the request before it completed: `timeout` when the download ran past the time the
     * remaining buffer allows, `abr` when the adaptation logic abandoned it to switch quality, `cancel` for every
     * other cancellation, such as a seek, a track switch or unloading the source. Undefined for a request that
     * completed, successfully or not. On the event for a cancelled request, `size` is the number of bytes received
     * before the cancellation, `0` or `-1` when none arrived.
     */
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
    /** The coding parameters of the segment's media. */
    mediaInfo: {
      bitrate?: number;
      sampleRate?: number;
      frameRate?: number;
      width?: number;
      height?: number;
    };
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
