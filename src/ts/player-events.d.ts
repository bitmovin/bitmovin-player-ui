declare namespace bitmovin {

  namespace player {

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
      ON_AD_CLICKED: EVENT,
      ON_AD_ERROR: EVENT,
      ON_AD_FINISHED: EVENT,
      ON_AD_LINEARITY_CHANGED: EVENT,
      ON_AD_MANIFEST_LOADED: EVENT,
      ON_AD_SCHEDULED: EVENT,
      ON_AD_SKIPPED: EVENT,
      ON_AD_STARTED: EVENT,
      ON_AUDIO_ADAPTATION: EVENT,
      ON_AUDIO_CHANGED: EVENT,
      ON_AUDIO_DOWNLOAD_QUALITY_CHANGE: EVENT,
      ON_AUDIO_PLAYBACK_QUALITY_CHANGE: EVENT,
      ON_AUDIO_DOWNLOAD_QUALITY_CHANGED: EVENT,
      ON_AUDIO_PLAYBACK_QUALITY_CHANGED: EVENT,
      ON_CAST_AVAILABLE: EVENT,
      ON_CAST_START: EVENT,
      ON_CAST_WAITING_FOR_DEVICE: EVENT,
      ON_CAST_STARTED: EVENT,
      ON_CAST_PLAYING: EVENT,
      ON_CAST_PAUSED: EVENT,
      ON_CAST_STOPPED: EVENT,
      ON_CAST_PLAYBACK_FINISHED: EVENT,
      ON_CAST_TIME_UPDATED: EVENT,
      ON_CUE_ENTER: EVENT,
      ON_CUE_EXIT: EVENT,
      ON_DOWNLOAD_FINISHED: EVENT,
      ON_DVR_WINDOW_EXCEEDED: EVENT,
      ON_ERROR: EVENT,
      ON_FULLSCREEN_ENTER: EVENT,
      ON_FULLSCREEN_EXIT: EVENT,
      ON_HIDE_CONTROLS: EVENT,
      ON_METADATA: EVENT,
      ON_MUTED: EVENT,
      ON_PAUSED: EVENT,
      ON_PERIOD_SWITCHED: EVENT,
      ON_PLAY: EVENT,
      ON_PLAYBACK_FINISHED: EVENT,
      ON_PLAYER_RESIZE: EVENT,
      ON_READY: EVENT,
      ON_SEEK: EVENT,
      ON_SEEKED: EVENT,
      ON_SEGMENT_REQUEST_FINISHED: EVENT,
      ON_SHOW_CONTROLS: EVENT,
      ON_SOURCE_LOADED: EVENT,
      ON_SOURCE_UNLOADED: EVENT,
      ON_STALL_STARTED: EVENT,
      ON_STALL_ENDED: EVENT,
      ON_SUBTITLE_ADDED: EVENT,
      ON_SUBTITLE_CHANGED: EVENT,
      ON_SUBTITLE_REMOVED: EVENT,
      ON_TIME_CHANGED: EVENT,
      ON_TIME_SHIFT: EVENT,
      ON_TIME_SHIFTED: EVENT,
      ON_UNMUTED: EVENT,
      ON_VIDEO_ADAPTATION: EVENT,
      ON_VIDEO_DOWNLOAD_QUALITY_CHANGED: EVENT,
      ON_VIDEO_PLAYBACK_QUALITY_CHANGED: EVENT,
      ON_VOLUME_CHANGED: EVENT,
      ON_VR_ERROR: EVENT,
      ON_VR_MODE_CHANGED: EVENT,
      ON_VR_STEREO_CHANGED: EVENT,
      ON_WARNING: EVENT,
      ON_PICTURE_IN_PICTURE_ENTER: EVENT,
      ON_PICTURE_IN_PICTURE_EXIT: EVENT,
    }

    interface PlayerEvent {
      timestamp: number;
      type: EVENT;
    }

    interface SubtitleChangedEvent extends PlayerEvent {
      time: number;
      sourceSubtitle: Subtitle;
      targetSubtitle: Subtitle;
    }

    interface SubtitleAddedEvent extends PlayerEvent {
      subtitle: Subtitle;
    }

    interface SubtitleRemovedEvent extends PlayerEvent {
      subtitleId: string;
    }

    interface SubtitleCueEvent extends PlayerEvent {
      start: number;
      end: number;
      text: string;
      region?: string;
      regionStyle?: string;
    }

    interface VolumeChangeEvent extends PlayerEvent {
      sourceVolume: number;
      targetVolume: number;
    }

    interface CastStartedEvent extends PlayerEvent {
    }

    interface CastWaitingForDeviceEvent extends PlayerEvent {
      castPayload: {
        currentTime: number;
        deviceName: string;
        timestamp: number;
        type: string;
      };
    }

    interface CastLaunchedEvent extends PlayerEvent {
      deviceName: string;
      resuming: boolean;
    }

    interface CastStoppedEvent extends PlayerEvent {
    }

    interface ErrorEvent extends PlayerEvent {
      code: number;
      message: string;
    }

    interface AdStartedEvent extends PlayerEvent {
      clickThroughUrl: string;
      clientType: string;
      duration: number;
      skipOffset: number;
      timeOffset: string;
      adMessage?: string;
      skipMessage?: SkipMessage;
    }

    interface PlayerResizeEvent extends PlayerEvent {
      width: string;
      height: string;
    }

    interface PlayerEventCallback {
      (event: PlayerEvent): void;
    }
  }
}