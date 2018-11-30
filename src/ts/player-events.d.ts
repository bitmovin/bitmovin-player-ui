declare namespace bitmovin {

  namespace PlayerAPI {

    /**
     * The events that are exposed by the player API are strings.
     * Events can be subscribed to through {@link Player#addEventHandler}.
     * TODO rename enum to Event (camel case)
     */
    type EVENT = string;
    /**
     * All available events of the player
     */
    interface EventList {
      ON_AD_CLICKED: EVENT;
      ON_AD_ERROR: EVENT;
      ON_AD_FINISHED: EVENT;
      ON_AD_LINEARITY_CHANGED: EVENT;
      ON_AD_MANIFEST_LOADED: EVENT;
      ON_AD_SCHEDULED: EVENT;
      ON_AD_SKIPPED: EVENT;
      ON_AD_STARTED: EVENT;
      ON_AUDIO_ADAPTATION: EVENT;
      ON_AUDIO_CHANGED: EVENT;
      ON_AUDIO_ADDED: EVENT;
      ON_AUDIO_REMOVED: EVENT;
      ON_AUDIO_QUALITY_CHANGED: EVENT;
      ON_AUDIO_DOWNLOAD_QUALITY_CHANGE: EVENT;
      ON_AUDIO_DOWNLOAD_QUALITY_CHANGED: EVENT;
      ON_AUDIO_PLAYBACK_QUALITY_CHANGED: EVENT;
      ON_CAST_AVAILABLE: EVENT;
      ON_CAST_START: EVENT;
      ON_CAST_WAITING_FOR_DEVICE: EVENT;
      ON_CAST_STARTED: EVENT;
      ON_CAST_PLAYING: EVENT;
      ON_CAST_PAUSED: EVENT;
      ON_CAST_STOPPED: EVENT;
      ON_CAST_PLAYBACK_FINISHED: EVENT;
      ON_CAST_TIME_UPDATED: EVENT;
      ON_CUE_PARSED: EVENT;
      ON_CUE_ENTER: EVENT;
      ON_CUE_UPDATE: EVENT;
      ON_CUE_EXIT: EVENT;
      ON_DOWNLOAD_FINISHED: EVENT;
      ON_DVR_WINDOW_EXCEEDED: EVENT;
      ON_ERROR: EVENT;
      ON_FULLSCREEN_ENTER: EVENT;
      ON_FULLSCREEN_EXIT: EVENT;
      ON_HIDE_CONTROLS: EVENT;
      ON_METADATA: EVENT;
      ON_METADATA_PARSED: EVENT;
      ON_MUTED: EVENT;
      ON_PAUSED: EVENT;
      ON_PERIOD_SWITCH: EVENT;
      ON_PERIOD_SWITCHED: EVENT;
      ON_PLAY: EVENT;
      ON_PLAYING: EVENT;
      ON_PLAYBACK_FINISHED: EVENT;
      ON_PLAYER_RESIZE: EVENT;
      ON_READY: EVENT;
      ON_SEEK: EVENT;
      ON_SEEKED: EVENT;
      ON_SEGMENT_PLAYBACK: EVENT;
      ON_SEGMENT_REQUEST_FINISHED: EVENT;
      ON_SHOW_CONTROLS: EVENT;
      ON_SOURCE_LOADED: EVENT;
      ON_SOURCE_UNLOADED: EVENT;
      ON_STALL_STARTED: EVENT;
      ON_STALL_ENDED: EVENT;
      ON_SUBTITLE_ADDED: EVENT;
      ON_SUBTITLE_CHANGED: EVENT;
      ON_SUBTITLE_REMOVED: EVENT;
      ON_TIME_CHANGED: EVENT;
      ON_TIME_SHIFT: EVENT;
      ON_TIME_SHIFTED: EVENT;
      ON_UNMUTED: EVENT;
      ON_VIDEO_ADAPTATION: EVENT;
      ON_VIDEO_QUALITY_CHANGED: EVENT;
      ON_VIDEO_DOWNLOAD_QUALITY_CHANGE: EVENT;
      ON_VIDEO_DOWNLOAD_QUALITY_CHANGED: EVENT;
      ON_VIDEO_PLAYBACK_QUALITY_CHANGED: EVENT;
      ON_VOLUME_CHANGED: EVENT;
      ON_VR_ERROR: EVENT;
      ON_VR_MODE_CHANGED: EVENT;
      ON_VR_STEREO_CHANGED: EVENT;
      ON_WARNING: EVENT;
      ON_PICTURE_IN_PICTURE_ENTER: EVENT;
      ON_PICTURE_IN_PICTURE_EXIT: EVENT;
      ON_AIRPLAY_AVAILABLE: EVENT;
      ON_VR_VIEWING_DIRECTION_CHANGE: EVENT;
      ON_VR_VIEWING_DIRECTION_CHANGED: EVENT;
      ON_DESTROY: EVENT;
      ON_AD_BREAK_STARTED: EVENT;
      ON_AD_BREAK_FINISHED: EVENT;
      ON_PLAYBACK_SPEED_CHANGED: EVENT;
      ON_VIDEO_QUALITY_ADDED: EVENT;
      ON_VIDEO_QUALITY_REMOVED: EVENT;
      ON_AUDIO_QUALITY_ADDED: EVENT;
      ON_AUDIO_QUALITY_REMOVED: EVENT;
    }

    interface PlayerEvent {
      /**
       * THe time at which this event was fired
       */
      timestamp?: number;
      /**
       * Event type, e.g. 'onPlay'
       */
      type?: EVENT;
    }

    interface PlaybackEvent extends PlayerEvent {
      /**
       * Current playback time (in seconds)
       */
      time: number;
    }

    interface UserInteractionEvent extends PlayerEvent {

      /**
       * The issuer who lead to the triggering of this event
       */
      issuer?: string;
    }

    interface SeekEvent extends UserInteractionEvent {
      /**
       * The current position (in seconds)
       */
      position: number;
      /**
       * The target position (in seconds)
       */
      seekTarget: number;
    }

    interface VolumeChangedEvent extends UserInteractionEvent {
      /**
       * The volume before the event has been triggered
       */
      sourceVolume: number;
      /**
       * The new selected volume
       */
      targetVolume: number;
    }

    interface PlayerResizeEvent extends PlayerEvent {
      /**
       * new width (ex : "1920px")
       */
      width: string;
      /**
       * new height (ex : "1080px")
       */
      height: string;
    }

    interface ErrorEvent extends PlayerEvent {
      /**
       * The error code used to identify the occurred error
       */
      code: number;
      /**
       * The error message to explain the reason for the error
       */
      message: string;
    }

    interface WarningEvent extends PlayerEvent {
      /**
       * The error code used to identify the occurred error
       */
      code: number;
      /**
       * The error message to explain the reason for the error
       */
      message: string;
    }

    interface AudioChangedEvent extends PlaybackEvent {
      /**
       * Previous audio track
       */
      sourceAudio: AudioTrack;
      /**
       * New audio track
       */
      targetAudio: AudioTrack;
    }

    interface AudioTrackEvent extends PlayerEvent {
      /**
       * The concerned audio track
       */
      track: AudioTrack;
    }

    interface SubtitleChangedEvent extends PlaybackEvent {
      /**
       * Previous subtitle
       */
      sourceSubtitle: Subtitle;
      /**
       * New subtitle
       */
      targetSubtitle: Subtitle;
    }

    interface MediaQualityChangeEvent<Q extends Quality> extends PlayerEvent {
      /**
       * Previous quality or null if no quality was set before.
       */
      sourceQuality?: Q | null;
      /**
       * ID of the previous quality or null if no quality was set before.
       */
      sourceQualityId: string | null;
      /**
       * New quality
       */
      targetQuality?: Q;
      /**
       * ID of the new quality.
       */
      targetQualityId: string;
    }

    interface VideoQualityChangeEvent extends MediaQualityChangeEvent<VideoQuality> {
    }

    interface AudioQualityChangeEvent extends MediaQualityChangeEvent<AudioQuality> {
    }

    interface VideoDownloadQualityChangeEvent extends MediaQualityChangeEvent<VideoQuality> {
    }

    interface AudioDownloadQualityChangeEvent extends MediaQualityChangeEvent<AudioQuality> {
    }

    interface VideoDownloadQualityChangedEvent extends MediaQualityChangeEvent<VideoQuality> {
    }

    interface AudioDownloadQualityChangedEvent extends MediaQualityChangeEvent<AudioQuality> {
    }

    interface MediaPlaybackQualityChangeEvent<Q extends Quality> extends PlayerEvent {
      /**
       * Previous quality
       */
      sourceQuality: Q;
      /**
       * New quality
       */
      targetQuality: Q;
    }

    interface VideoPlaybackQualityChangedEvent extends MediaPlaybackQualityChangeEvent<VideoQuality> {
    }

    interface AudioPlaybackQualityChangedEvent extends MediaPlaybackQualityChangeEvent<AudioQuality> {
    }

    interface TimeChangedEvent extends PlaybackEvent {
    }

    interface SegmentPlaybackEvent extends PlayerEvent {
      /**
       * segment URL
       */
      url: string;
      /**
       * segment Unique ID
       */
      uid: string;
      /**
       * media mime type
       */
      mimeType: string;
      /**
       * current playback time (seconds)
       */
      playbackTime: number;
      /**
       * segment duration
       */
      duration: number;
      /**
       * coding parameters
       */
      mediaInfo: {
        bitrate?: number,
        sampleRate?: number,
        frameRate?: number,
        width?: number,
        height?: number,
      };
      /**
       * optional program date time (time string)
       */
      dateTime?: string;
      /**
       * ID of the representation this segment belongs to
       */
      representationId: string;
      EXPERIMENTAL?: any;
    }

    enum MetadataType {
      /**
       * HLS `#EXT-X-CUE-OUT`, `#EXT-X-CUE-OUT-CONT` and `#EXT-X-CUE-IN` tags are surfaced with this type.
       */
      CUETAG,
      /**
       * DASH `EventStream` events (also known as `MPD Events`) are surfaced with this type.
       */
      EVENT_STREAM,
      /**
       * All custom, i.e. unknown/unsupported HLS tags are surfaced with this type.
       */
      CUSTOM,
      /**
       * HLS `#EXT-X-SCTE35` tags are surfaced with this type.
       */
      SCTE,
      /**
       * ID3 tags from MPEG-2 Transport Stream container formats are surfaced with this type.
       * See {@link MetadataType.EMSG} for the MP4 equivalent.
       */
      ID3,
      /**
       * EMSG data from MP4 container formats are surfaced with this type.
       * See {@link MetadataType.ID3} for the MPEG-2 TS equivalent.
       */
      EMSG,
      /**
       * Used for custom messages between the sender and the remote receiver, such as a Chromecast receiver app.
       * Refer to {@link PlayerAPI.addMetadata} for details.
       */
      CAST,
    }

    interface MetadataEvent extends PlayerEvent {
      /**
       * ID3 and EMSG (<span class="highlight">[new in v4.2]</span>) are supported types.
       */
      metadataType: MetadataType;
      /**
       * The metadata object as encountered in the stream.
       */
      metadata: Object;
      /**
       * The start time of the event.
       */
      start?: number;
      /**
       * The end time of the event.
       */
      end?: number;
    }

    export interface MetadataParsedEvent extends MetadataEvent {
    }

    interface AdaptationEvent extends PlayerEvent {
      /**
       * The id of the suggested representation
       */
      representationID: string;
    }

    interface VideoAdaptationEvent extends AdaptationEvent {
    }

    interface AudioAdaptationEvent extends AdaptationEvent {
    }

    interface DownloadFinishedEvent extends PlayerEvent {
      /**
       * The HTTP status code of the request. Status code 0 means a network or CORS error happened.
       */
      httpStatus: number;
      /**
       * Indicates whether the request was successful (true) or failed (false).
       */
      success: boolean;
      /**
       * The URL of the request.
       */
      url: string;
      /**
       * The time needed to finish the request.
       */
      downloadTime: number;
      /**
       * The size of the downloaded data, in bytes.
       */
      size: number;
      /**
       * Most requests are re-tried a few times if they fail. This marks how many attempts have been made.
       * Starts at 1.
       */
      attempt: number;
      /**
       * Most requests are re-tried a few times if they fail. This marks the maximum amount of tries to
       * fulfill the request.
       */
      maxAttempts: number;
      /**
       * Specifies which type of request this was. Valid types are currently manifest, media, and
       * license (for DRM license requests).
       */
      downloadType: string;
    }

    interface SegmentRequestFinishedEvent extends PlayerEvent {
      /**
       * The HTTP status code of the request. Status code 0 means a network or CORS error happened.
       */
      httpStatus: number;
      /**
       * Indicates whether the request was successful (true) or failed (false).
       */
      success: boolean;
      /**
       * The time needed to finish the request.
       */
      downloadTime: number;
      /**
       * The size of the downloaded data, in bytes.
       */
      size: number;
      /**
       * The expected size of the segment in seconds.
       */
      duration: number;
      /**
       * The mimeType of the segment
       */
      mimeType: string;
      /**
       * The Unique ID of the downloaded segment
       */
      uid: string;
      /**
       * Indicates whether the segment is an init segment (true) or not (false).
       */
      isInit: boolean;
    }

    interface AdManifestLoadedEvent extends PlayerEvent {
      manifest: string;
    }

    interface AdScheduledEvent extends PlayerEvent {
      /**
       * The total number of scheduled ads.
       */
      numAds: number;
    }

    interface AdStartedEvent extends PlayerEvent {
      /**
       * The target URL to open once the user clicks on the ad
       * @since v4.2
       */
      clickThroughUrl: string;
      /**
       * The index of the ad in the queue
       * @since v6.0
       */
      indexInQueue: number;
      clientType: string;
      /**
       * The duration of the ad
       * @since v6.0
       */
      duration: number;
      /**
       * The skip offset of the ad
       * @since v6.0
       */
      skipOffset: number;
      timeOffset: string;
      adMessage?: string;
      skipMessage?: SkipMessage;
    }

    interface AdClickedEvent extends PlayerEvent {
      /**
       * The click through url of the ad
       */
      clickThroughUrl: string;
    }

    interface AdLinearityChangedEvent extends PlayerEvent {
      /**
       * True if the ad is linear
       */
      isLinear: boolean;
    }

    interface CastWaitingForDeviceEvent extends PlayerEvent {
      castPayload: {
        currentTime: number;
        deviceName: string;
        timestamp: number;
        type: string;
      };
    }

    interface CastStartedEvent extends PlayerEvent {
      /**
       * Friendly name of the connected remote Cast device
       */
      deviceName: string;
      /**
       * True if an existing session is resumed, false if a new session has been established
       */
      resuming: boolean;
    }

    interface SourceLoadedEvent extends PlayerEvent {
      /**
       * URL of the new manifest
       */
      newManifest: string;

    }

    interface SubtitleAddedEvent extends PlayerEvent {
      /**
       * The added subtitle object
       */
      subtitle: Subtitle;
    }

    interface SubtitleRemovedEvent extends PlayerEvent {
      /**
       * The ID of the removed subtitle
       */
      subtitleId: string;
    }

    interface VRStereoChangedEvent extends PlayerEvent {
      /**
       * True if the player is in stereo mode, false otherwise
       */
      stereo: boolean;
    }

    interface VRViewingDirectionChangeEvent extends PlayerEvent {
      direction: bitmovin.PlayerAPI.VR.ViewingDirection;
    }

    interface VRViewingDirectionChangedEvent extends VRViewingDirectionChangeEvent {
      //
    }

    interface SubtitleCueEvent extends PlayerEvent {
      start: number;
      end: number;
      text: string;
      html?: string;
      image?: string;
      region?: string;
      regionStyle?: string;
      position?: {
        row: number;
        column: number;
      };
    }

    interface PlaybackSpeedChangedEvent extends PlayerEvent {
      from: number;
      to: number;
    }

    interface PlayerEventCallback {
      (event: PlayerEvent): void;
    }

    interface AdStartedEvent extends PlayerEvent {
      /**
       * The target URL to open once the user clicks on the ad
       * @since v4.2
       */
      clickThroughUrl: string;
      /**
       * The index of the ad in the queue
       * @since v6.0
       */
      indexInQueue: number;
      clientType: string;
      /**
       * The duration of the ad
       * @since v6.0
       */
      duration: number;
      /**
       * The skip offset of the ad
       * @since v6.0
       */
      skipOffset: number;
      timeOffset: string;
      adMessage?: string;
      skipMessage?: SkipMessage;
    }

    interface TimeShiftEvent extends UserInteractionEvent {
      /**
       * The position from which we start the timeshift (currentTime before the timeshift)
       */
      position: number;
      /**
       * The position to which we want to jump for the timeshift ( currentTime after timeshift has completed)
       */
      target: number;
    }

    interface SubtitleCueParsedEvent extends SubtitleCueEvent {
      subtitleId: string;
    }
  }
}
