/// <reference path='player-config.d.ts' />
/// <reference path='player-events.d.ts' />

declare namespace bitmovin {

  import Config = bitmovin.PlayerAPI.Config;
  import ViewMode = bitmovin.player.ViewMode;
  import ViewModeOptions = bitmovin.PlayerAPI.ViewModeOptions;
  import Subtitle = bitmovin.PlayerAPI.SubtitleTrack;

  interface PlayerStatic {
    /**
     * Creates and returns a new player instance attached to the provided DOM element.
     */
    new (containerElement: HTMLElement, config: Config): bitmovin.PlayerAPI;

    /**
     * The version number of the player.
     */
    version: string;
  }

  namespace player {
    const Player: PlayerStatic;

    namespace Network {
      enum HttpRequestMethod {
        GET,
        POST,
        HEAD,
      }

      enum HttpRequestType {
        MANIFEST_DASH,
        MANIFEST_HLS_MASTER,
        MANIFEST_HLS_VARIANT,
        MANIFEST_SMOOTH,
        MANIFEST_ADS,

        MEDIA_AUDIO,
        MEDIA_VIDEO,
        MEDIA_SUBTITLES,
        MEDIA_THUMBNAILS,

        DRM_LICENSE_WIDEVINE,
        DRM_LICENSE_PLAYREADY,
        DRM_LICENSE_FAIRPLAY,
        DRM_LICENSE_PRIMETIME,
        DRM_LICENSE_CLEARKEY,

        DRM_CERTIFICATE_FAIRPLAY,

        KEY_HLS_AES,
      }

      enum HttpResponseType {
        ARRAYBUFFER,
        BLOB,
        DOCUMENT,
        JSON,
        TEXT,
      }
    }

    enum ViewMode {
      Inline,
      Fullscreen,
      PictureInPicture,
    }

    enum LogLevel {
      DEBUG,
      LOG,
      WARN,
      ERROR,
      OFF,
    }
  }

  interface PlayerExports {
    readonly Event: typeof PlayerAPI.Event;
    readonly LogLevel: typeof player.LogLevel;
    readonly Network: typeof player.Network;
    readonly PlayerAPINotAvailableException: any;
    readonly ViewMode: typeof ViewMode;
  }

  type PlayerType = 'html5' | 'flash' | 'native' | 'native-flash' | 'unknown';

  type StreamType = 'progressive' | 'dash' | 'hls' | 'smooth' | 'unknown';

  /**
   * Bitmovin Player instance members.
   */
  interface PlayerAPI {

    /**
     * The version number of the player.
     */
    readonly version: string;

    /**
     * The VR API.
     */
    readonly vr: PlayerAPI.PlayerVRAPI;

    readonly subtitles: PlayerAPI.PlayerSubtitlesAPI;

    /**
     * Exports from the player core as a convenience fallback for non-modular code.
     * It is recommended to use ES6 imports instead.
     *
     * Usage:
     *
     * ```ts
     * import { Player } from 'bitmovin-player';
     * const player = new player.Player(...);
     * player.on(player.exports.Event.Ready, () => ...);
     * ```
     *
     * Recommended approach:
     *
     * ```ts
     * import { Player, Event } from 'bitmovin-player';
     * const player = new player.Player(...);
     * player.on(Event.Ready, () => ...);
     * ```
     *
     * @deprecated It is recommended to use ES6 imports instead
     */
    readonly exports: PlayerExports;

    /**
     * Subscribes an event handler to a player event. This method was called `addEventHandler` in previous
     * player versions.
     *
     * @param eventType The type of event to subscribe to.
     * @param callback The event callback handler that will be called when the event fires.
     * @since v7.8
     */
    on(eventType: PlayerAPI.Event, callback: PlayerAPI.PlayerEventCallback): void;
    /**
     * Sends custom metadata to a remote receiver app (e.g. Chromecast).
     *
     * @param metadataType The type of the metadata. Currently only 'CAST' is supported.
     * @param metadata The custom data to send to the receiver.
     * @return True if it was successful.
     * @since v4.0
     */
    addMetadata(metadataType: string, metadata: any): boolean;
    /**
     * Stops a running Cast session (i.e. {@link #isCasting} returns true). Has no effect if {@link #isCasting}
     * returns false.
     * @since v4.0
     */
    castStop(): void;
    /**
     * Initiates casting the current video to a Cast-compatible device. The user has to choose the target device.
     * @since v4.0
     */
    castVideo(): void;
    /**
     * Removes all existing query parameters as specified in {@link setQueryParameters} or
     * {@link TweaksConfig.query_parameters}.
     * @since v4.0
     */
    clearQueryParameters(): void;
    /**
     * Unloads the player and removes all inserted HTML elements and event handlers.
     *
     * @return Promise resolves when the player has cleaned up all its event handlers & resources
     * @since v8.0
     */
    destroy(): Promise<void>;
    /**
     * Returns the currently used audio track.
     * @since v4.0
     */
    getAudio(): PlayerAPI.AudioTrack;
    /**
     * Returns the seconds of already buffered audio data or null if no audio source is loaded.
     * @since v4.0
     */
    getAudioBufferLength(): number | null;
    /**
     * Returns the currently selected audio quality. One of the elements of {@link getAvailableAudioQualities}.
     * @since v7.3.1
     */
    getAudioQuality(): PlayerAPI.AudioQuality;
    /**
     * Returns an array of all available audio tracks.
     * @since v4.0
     */
    getAvailableAudio(): PlayerAPI.AudioTrack[];
    /**
     * Returns an array of all available audio qualities the player can adapt between.
     * @since v4.0
     */
    getAvailableAudioQualities(): PlayerAPI.AudioQuality[];
    /**
     * Returns a list of available impression servers.
     * @since v4.0
     */
    getAvailableImpressionServers(): string[];
    /**
     * Returns a list of available license servers.
     * @since v4.0
     */
    getAvailableLicenseServers(): string[];
    /**
     * Returns an array containing all available video qualities the player can adapt between.
     * @since v4.0
     */
    getAvailableVideoQualities(): PlayerAPI.VideoQuality[];
    /**
     * Returns the config object of the current player instance.
     *
     * @param mergedConfig true to return the config expanded with all default values, false to return the user
     *   config passed to {@link setup}
     * @return The current user or merged player config.
     * @since v4.0
     */
    getConfig(mergedConfig?: boolean): PlayerAPI.Config;
    /**
     * Returns the html element that the player is embedded in, which has been provided in the player constructor.
     * @since v8.0
     */
    getContainer(): HTMLElement;
    /**
     * Returns the current playback time in seconds of the video.
     * @since v4.0
     */
    getCurrentTime(): number;
    /**
     * Returns data about the last downloaded audio segment.
     * @since v4.0
     */
    getDownloadedAudioData(): PlayerAPI.DownloadedAudioData;
    /**
     * Returns data about the last downloaded video segment.
     * @since v4.0
     */
    getDownloadedVideoData(): PlayerAPI.DownloadedVideoData;
    /**
     * Returns the total number of dropped frames since playback started.
     * @since v4.0
     */
    getDroppedFrames(): number;
    /**
     * Returns the total duration in seconds of the current video or {@code Infinity} if it’s a live stream.
     * @since v4.0
     */
    getDuration(): number;
    /**
     * Returns the used DASH or HLS manifest file.
     *
     * Previous player versions (v4.2-v7.0) returned an object for DASH and a string for HLS, this has been corrected
     * in v7.1.
     *
     * @since v7.1
     */
    getManifest(): string;
    /**
     * Returns the limit in seconds for time shift. Is either negative or 0 and applicable to live streams only.
     * @since v4.0
     */
    getMaxTimeShift(): number;
    /**
     * Returns data about the currently playing audio segment.
     * @since v4.0
     */
    getPlaybackAudioData(): PlayerAPI.AudioQuality;
    /**
     * Returns the current playback speed of the player. 1 is the default playback speed, values
     * between 0 and 1 refer to slow motion and values greater than 1 refer to fast forward. Values less or
     * equal zero are ignored.
     * @since v4.0
     */
    getPlaybackSpeed(): number;
    /**
     * Returns data about the currently playing video segment.
     * @since v4.0
     */
    getPlaybackVideoData(): PlayerAPI.VideoQuality;
    /**
     * Returns the currently used rendering mode. See {@link PlayerType} for details of the valid values.
     * @since v4.0
     */
    getPlayerType(): PlayerType;
    /**
     * Creates a snapshot of the current video frame.
     * Snapshots cannot be taken from DRM protected content and the Flash fallback.
     *
     * @param type The type of image snapshot to capture. Allowed values are 'image/jpeg' and 'image/webp'.
     * @param quality A number between 0 and 1 indicating the image quality.
     * @since v4.0
     */
    getSnapshot(type?: string, quality?: number): PlayerAPI.Snapshot; // TODO convert type to enum
    /**
     * Returns the currently used streaming technology. See {@link StreamType} for details of the valid values.
     * @since v4.0
     */
    getStreamType(): StreamType;
    /**
     * Tests and retrieves a list of all supported DRM systems in the current user agent.
     * @returns A Promise that resolves to an array of strings with the supported DRM systems after fulfillment.
     * Should never be rejected.
     * @since v4.1
     */
    getSupportedDRM(): Promise<string[]>;
    /**
     * Returns an array of objects denoting a player and streaming technology combination supported on
     * the current platform. The order in the array is the order which will be used to play a stream.
     * @since v4.0
     */
    getSupportedTech(): PlayerAPI.Technology[];
    /**
     * Returns a thumbnail image for a certain time or null if there is no thumbnail available.
     * Requires a configured thumbnails track in {@link SourceConfig.thumbnailTrack}.
     * @param time the media time for which the thumbnail should be returned
     * @returns A thumbnail if a thumbnails track is configured and a thumbnail exists for the specified time, else null
     * @since v8.0
     */
    getThumbnail(time: number): PlayerAPI.Thumbnail;
    /**
     * Returns the current time shift offset to the live edge in seconds. Only applicable to live streams.
     * @since v4.0
     */
    getTimeShift(): number;
    /**
     * Returns the stalled time in seconds since playback started.
     * @since v4.0
     */
    getTotalStalledTime(): number;
    /**
     * Returns the seconds of already buffered video data or null if no video source is loaded.
     * @since v4.0
     */
    getVideoBufferLength(): number | null;
    /**
     * Returns the currently selected video quality. One of the elements of {@link getAvailableVideoQualities}.
     * @since v7.3.1
     */
    getVideoQuality(): PlayerAPI.VideoQuality;
    /**
     * Returns the player’s volume between 0 (silent) and 100 (max volume).
     * @since v4.0
     */
    getVolume(): number;
    /**
     * Returns true if the video has ended.
     * @since v4.0
     */
    hasEnded(): boolean;
    /**
     * Returns true while an ad is played back or content playback has been paused for ad playback, false otherwise.
     * @param pending If true, isAd will return true if the content playback has been paused for
     * playback of a pending ad
     * @since v6.1
     */
    isAd(pending?: boolean): boolean;
    /**
     * Returns true if casting to another device (such as a ChromeCast) is available, otherwise false.
     * Please note that this function only returns true after the {@link Event.CastAvailable} event has fired.
     * @since v5.2
     */
    isCastAvailable(): boolean;
    /**
     * Returns true if the video is currently casted to a device and not played in the browser,
     * or false if the video is played locally.
     * @since v4.0
     */
    isCasting(): boolean;
    /**
     * Checks if a DRM system is supported in the current user agent.
     *
     * @param drmSystem A KeySystem string to test against
     * @returns Resolves with the DRM system string if it is supported, or rejects with an error message if not
     * @since v4.1
     */
    isDRMSupported(drmSystem: string): Promise<string>;
    /**
     * Return true if the displayed video is a live stream.
     * @since v4.0
     */
    isLive(): boolean;
    /**
     * Returns true if the player has been muted.
     * @since v4.0
     */
    isMuted(): boolean;
    /**
     * Returns true if the player has started playback but is currently paused.
     * @since v4.0
     */
    isPaused(): boolean;
    /**
     * Returns true if the player is currently playing, i.e. has started and is not paused.
     * @since v4.0
     */
    isPlaying(): boolean;
    /**
     * Returns true if the player is currently stalling due to an empty buffer.
     * @since v4.0
     */
    isStalled(): boolean;
    /**
     * Sets a new video source and returns a promise which resolves to the player.
     *
     * @param source A source object as specified in player configuration during {@link setup}
     * @param forceTechnology Forces the player to use the specified playback and streaming technology. The specified
     * technologies have to be separated by a period (e.g. 'html5.hls'). A list of valid combinations can retrieved
     * by calling {@link getSupportedTech}.
     * @param disableSeeking If set, seeking will be disabled
     * @since v4.0
     */
    load(source: PlayerAPI.SourceConfig, forceTechnology?: string, disableSeeking?: boolean): Promise<void>;
    /**
     * Mutes the player if an audio track is available. Has no effect if the player is already muted.
     *
     * @param issuer The issuer of the API call that will be passed to events triggered by this call
     * @since v4.0
     */
    mute(issuer?: string): void;
    /**
     * Pauses the video if it is playing. Has no effect if the player is already paused.
     *
     * @param issuer The issuer of the API call that will be passed to events triggered by this call
     * @since v4.0
     */
    pause(issuer?: string): void;
    /**
     * Starts playback or resumes after being paused. No need to call it if the player is setup with
     * autoplay attribute ({@link PlaybackConfig.autoplay}). Has no effect if the player is already playing.
     * @returns a Promise which resolves as soon as playback has actually started. This promise can reject
     * if play is prohibited by the browser (a missing user interaction for example)
     * @param issuer The issuer of the API call that will be passed to events triggered by this call
     * @since v4.0
     */
    play(issuer?: string): Promise<void>;
    /**
     * Removes a handler for a player event. This method was called `removeEventHandler` in previous
     * player versions.
     *
     * @param eventType The event to remove the handler from
     * @param callback The callback handler to remove
     * @since v7.8
     */
    off(eventType: PlayerAPI.Event, callback: PlayerAPI.PlayerEventCallback): void;
    /**
     * Schedules an ad for playback.
     *
     * @param adManifestUrl URL to the ad manifest. The array is used for ad waterfalling: all entries beyond the first
     * are fallbacks if the previous ones did not work.
     * @param client the type of ad to be played.
     * @param options Optional options for ad playback.
     * @since v4.2
     * @return `true` if scheduling the ad was successful, `false` otherwise.
     */
    scheduleAd(adManifestUrl: string, client: string, options?: PlayerAPI.ScheduleAdOptions): boolean;
    /**
     * Returns the time range that is currently valid for seeking.
     * @since v7.1
     */
    getSeekableRange(): PlayerAPI.TimeRange;
    /**
     * Seeks to the given playback time specified by the parameter time in seconds. Must not be greater
     * than the total duration of the video. Has no effect when watching a live stream as seeking is
     * not possible.
     *
     * @param time The time to seek to
     * @param issuer The issuer of the API call that will be passed to events triggered by this call
     * @since v4.0
     */
    seek(time: number, issuer?: string): boolean;
    /**
     * Sets the audio track to the ID specified by trackID.
     * Available tracks can be retrieved with {@link getAvailableAudio}.
     *
     * @param trackID The ID of the audio track to activate
     * @since v4.0
     */
    setAudio(trackID: string): void;
    /**
     * Manually sets the audio stream to a fixed quality, identified by ID. Has to be an ID defined in
     * the MPD or the keyword 'auto'. Auto resets to dynamic switching. A list with valid IDs can be
     * retrieved by calling {@link getAvailableAudioQualities}.
     *
     * @param audioQualityID The ID of the desired audio quality or 'auto' for dynamic switching
     * @since v4.0
     */
    setAudioQuality(audioQualityID: string): void;
    /**
     * Sets authentication data which is sent along with the licensing call. Can be used to add more
     * information for a 3rd party licensing backend. The data be any type or object as needed by the
     * 3rd party licensing backend.
     *
     * @param customData Data which should be sent with the licensing call
     * @since v4.2
     */
    setAuthentication(customData: any): void;
    /**
     * [<i>HTML5 only</i>]
     * Sets the playback speed of the player. Fast forward as well as slow motion is supported.
     * Slow motion is used by values between 0 and 1, fast forward by values greater than 1.
     *
     * @see {@link getPlaybackSpeed}
     * @param speed A playback speed factor greater than 0
     * @since v4.0
     */
    setPlaybackSpeed(speed: number): void;
    /**
     * Sets a poster image. Will be displayed immediately, even if a video stream is playing.
     *
     * @param url The URL to the poster image
     * @param keepPersistent Flag to set the poster image persistent so it is also displayed during playback (useful
     *   for audio-only playback)
     * @since v4.3
     */
    setPosterImage(url: string, keepPersistent: boolean): void;
    /**
     * Adds GET parameters to all request URLs (e.g. manifest, media segments, subtitle files, …).
     * The queryParameters should be an object with key value pairs, where the keys are used as
     * parameter name and the values as parameter values.
     *
     * @param queryParameters The list of query parameter key/value pairs
     * @since v4.1
     */
    setQueryParameters(queryParameters: PlayerAPI.QueryParameters): void;
    /**
     * Passes an HTML video element to the player, which should be used in case of non-Flash playback.
     * Needs to be called before {@link setup}. Has no effect if the Flash fallback is selected.
     *
     * @param videoElement The HTML video element to use
     * @since v5.1
     */
    setVideoElement(videoElement: HTMLElement): void;
    /**
     * Manually sets the video stream to a fixed quality, identified by ID. Has to be an ID defined in
     * the MPD or the keyword 'auto'. Auto resets to dynamic switching. A list with valid IDs can be retrieved
     * by calling {@link getAvailableVideoQualities}.
     *
     * @param videoQualityID ID defined in the MPD or 'auto'
     * @since v4.0
     */
    setVideoQuality(videoQualityID: string): void;
    /**
     * Sets the player’s volume in the range of 0 (silent) to 100 (max volume). Unmutes a muted player.
     *
     * @param volume The volume to set between 0 and 100
     * @param issuer The issuer of the API call that will be passed to events triggered by this call
     * @since v4.0
     */
    setVolume(volume: number, issuer?: string): void;
    /**
     * Enables or disables stereo mode for VR content.
     *
     * @param enableStereo true to enable stereo, false to disable
     * @returns true if stereo mode was successfully set, else false
     * @since v6.0
     */
    setVRStereo(enableStereo: boolean): boolean;
    /**
     * Skips the current ad. Has no effect if ad is not skippable or if no ad is played back.
     * @returns True if skipping the ad was successful.
     * @since v4.0
     */
    skipAd(): boolean;
    /**
     * Shifts the time to the given offset in seconds from the live edge. Has to be within {@link getMaxTimeShift}
     * (which is a negative value) and 0. Only works in live streams.
     * <span class='highlight'>[new in v4.3]</span>: The offset can be positive and is then interpreted as a UNIX
     * timestamp in seconds. The value has to be within the timeShift window as specified by {@link getMaxTimeShift}.
     *
     * @param offset The offset to timeshift to
     * @param issuer The issuer of the API call that will be passed to events triggered by this call
     * @since v4.0
     */
    timeShift(offset: number, issuer?: string): void;
    /**
     * Unloads the current video source.
     * @since v4.0
     */
    unload(): Promise<void>;
    /**
     * Unmutes the player if muted.
     *
     * @param issuer The issuer of the API call that will be passed to events triggered by this call
     * @since v4.0
     */
    unmute(issuer?: string): void;
    /**
     * Checks if Apple AirPlay support is available.
     * @since v7.1
     */
    isAirplayAvailable(): boolean;
    /**
     * Shows the airplay playback target picker.
     * @since v7.1
     */
    showAirplayTargetPicker(): void;
    /**
     * Returns the currently buffered time ranges of the video element.
     * @since v6.1
     */
    getBufferedRanges(): PlayerAPI.TimeRange[];
    /**
     * Returns infos for segments that can be requested by the player
     * @returns {SegmentMap}
     * @since v7.2
     */
    getAvailableSegments(): any;
    /**
     * Starts preloading the content of the currently loaded source.
     * @since v6.1
     */
    preload(): void;
    /**
     * Sets the level of player log outputs.
     * @param level Log level, allowed values are "debug", "log", "warn", "error" and "off"
     * @since v6.1
     */
    setLogLevel(level: player.LogLevel): void;

    /**
     * Returns the used HTML5 video element or the Flash object if the fallback is used.
     *
     * @returns The HTML5 video element or the Flash object which is used by the player
     */
    getVideoElement(): HTMLVideoElement | HTMLObjectElement;

    /**
     * Tests if a particular {@link ViewMode} is available for selection with {@link setViewMode}.
     * @param {ViewMode} viewMode the view mode to test
     * @returns {boolean} `true` if the tested view mode is available, else `false`
     * @since v8.0
     */
    isViewModeAvailable(viewMode: ViewMode): boolean;

    /**
     * Sets the player to a particular {@link ViewMode}. Will only work if the selected view mode is available and
     * {@link isViewModeAvailable} returns `true`, else this call will be ignored. If successful, a
     * {@link Event.ViewModeChanged} will be fired.
     * @param {ViewMode} viewMode the view mode to switch the player into
     * @param {ViewModeOptions} options additional optional parameters for view modes
     * @since v8.0
     */
    setViewMode(viewMode: ViewMode, options?: ViewModeOptions): void;

    /**
     * Gets the active {@link ViewMode}.
     * @returns {ViewMode} the view mode that is currently active
     * @since v8.0
     */
    getViewMode(): ViewMode;

    /**
     * Gets the source that was loaded via a successfully finished {@link load} call or `null` if no source is loaded
     * or a load is in progress.
     * @returns {SourceConfig | null} the loaded source or `null` if no source is loaded
     */
    getSource(): PlayerAPI.SourceConfig | null;
  }

  namespace PlayerAPI {

    interface ViewModeOptions {
      fullscreenElement?: HTMLElement;
    }

    /**
     * Properties of a thumbnail out of a seeking thumbnail preview definition.
     */
    interface Thumbnail {
      /**
       * Start time of the thumbnail.
       */
      start: number;
      /**
       * End time of the thumbnail.
       */
      end: number;
      /**
       * Width of the thumbnail.
       */
      width: number;
      /**
       * Height of the thumbnail.
       */
      height: number;
      /**
       * Index of the thumbnail in its spritesheet.
       */
      i: number;
      /**
       * Horizontal offset of the thumbnail in its spritesheet.
       */
      x: number;
      /**
       * Vertical offset of the thumbnail in its spritesheet.
       */
      y: number;
      /**
       * URL of the spritesheet.
       */
      url: string;
      /**
       * Raw cue data.
       */
      text: string;
    }

    /**
     * Quality definition of a media representation.
     */
    interface Quality {
      /**
       * The bitrate of the media representation.
       */
      bitrate: number;
      /**
       * The id of the media representation.
       */
      id: string;
      /**
       * The label of the media representation that should be exposed to the user (e.g. in the UI).
       */
      label: string;
    }

    /**
     * Quality definition of an audio representation.
     */
    interface AudioQuality extends Quality {
    }

    /**
     * Quality definition of a video representation.
     */
    interface VideoQuality extends Quality {
      /**
       * The width of the video representation.
       */
      width: number;
      /**
       * The heights of the video representation.
       */
      height: number;
    }

    export interface TimeRange {
      /**
       * The start of the range
       */
      start: number;
      /**
       * The end of the range.
       */
      end: number;
    }

    /**
     * Describes the role of a media track, e.g. an {@link AudioTrack}.
     */
    interface MediaTrackRole {
      schemeIdUri: string;
      value?: string;
      id?: string;
      [key: string]: string | undefined;
    }

    /**
     * Definition of an audio track.
     */
    interface AudioTrack {
      /**
       * The id of the audio track that is used to identify and set the track.
       */
      id: string;
      /**
       * The language of the audio track.
       */
      lang: string;
      /**
       * The text used to represent this track to the user (e.g. in the UI).
       */
      label: string;
      /**
       * The optional roles of the track.
       */
      role?: MediaTrackRole[];
    }

    /**
     * Defines messages to be shown during ad playback.
     */
    interface SkipMessage {
      /**
       * The message that is displayed until the ad can be skipped.
       * Supports the placeholders '{remainingTime[formatString]}', '{playedTime[formatString]}' and
       * '{adDuration[formatString]}', which are replaced by the remaining time until the ad can be skipped,
       * the current time or the ad duration.
       *
       * The format string is optional. The default is the time in seconds.
       *
       * Supported format strings:
       * - %d: Inserts the time as an integer.
       * - %0Nd: Inserts the time as an integer with leading zeroes, if the length of the time string is smaller than N.
       * - %f: Inserts the time as a float.
       * - %0Nf: Inserts the time as a float with leading zeroes.
       * - %.Mf: Inserts the time as a float with M decimal places. Can be combined with %0Nf, e.g. %04.2f
       *    (the time 10.123 would be printed as 0010.12).
       * - %hh:mm:ss
       * - %mm:ss
       */
      countdown: string;
      /**
       * The message that is displayed once the ad can be skipped.
       */
      skip: string;
    }

    /**
     * Options for scheduling an ad through {@link Player#scheduleAd}.
     * TODO check how this relates to {@link AdvertisingScheduleItem}/{@link AdvertisingConfig} and if interfaces can
     * be consolidated
     */
    interface ScheduleAdOptions {
      /**
       * The offset for the ad, may be 'pre', 'post', seconds, percent, or a string in the format hh:mm:ss
       * @see AdvertisingConfig#offset
       */
      timeOffset?: any;
      /**
       * If set, the ad will be rescheduled automatically when a new source is loaded.
       */
      persistent?: boolean;
      /**
       * The message that is displayed to the user instead of the progress bar with the placeholder 'xx',
       * which is replaced by the remaining ad duration.
       * TODO consolidate with {@link AdvertisingConfig} and/or {@link SkipMessage}?
       */
      adMessage?: string;
      /**
       * The message that is displayed on the 'skip ad' button.
       * TODO consolidate with {@link AdvertisingConfig} and/or {@link SkipMessage}?
       */
      skipMessage?: SkipMessage;
      /**
       * A full styling object that is applied only during ad playback.
       * Supports all styling options but the player sizing.
       * TODO is that the same as {@link StyleConfig}?
       */
      style?: Object;
      /**
       * Specifies the time in seconds until the ad can be skipped.
       * If set, overwrites the skip offset specified in the ad manifest (VAST and VPAID, not IMA)
       */
      skipOffset?: number;
    }

    /**
     * A player and streaming technology tuple describing a supported technology of the player.
     */
    interface SupportedTech {
      /**
       * A string determining a rendering mode used to render the player.
       * Possible values are html5, flash, and native.
       * TODO convert to enum
       */
      player: string;
      /**
       * A string determining a streaming technology.
       * Possible values are currently dash, hls, and progressive.
       * TODO convert to enum
       */
      streaming: string;
    }

    interface Track {
      /**
       * The URL to the associated file.
       */
      url: string;
    }

    /**
     * Definition of a subtitle/caption track.
     */
    interface SubtitleTrack extends Track {
      /**
       * Used to identify and set the subtitle track.
       */
      id: string;
      /**
       * The language of the subtitle track.
       */
      lang: string;
      /**
       * The text used to represent this track to the user (e.g. in the UI).
       */
      label: string;
      /**
       * Only used for fragmented subtitles in HLS
       * TODO check why this is missing from the API docs
       */
      isFragmented?: boolean;
      enabled?: boolean;
    }

    /**
     * A snapshot of a video frame.
     */
    interface Snapshot {
      /**
       * The width of the image.
       */
      width: number;
      /**
       * The height of the image.
       */
      height: number;
      /**
       * A Base64-encoded string that contains the image.
       */
      data: String;
    }

    /**
     * Data describing a downloaded segment of a representation.
     */
    interface DownloadedData {
      /**
       * The id of the representation.
       */
      id: string;
      /**
       * The bitrate of the representation.
       */
      bitrate: number;
      /**
       * True if the player’s logic automatically selects the best representation (default),
       * or false if a fixed representation is currently chosen.
       */
      isAuto: boolean;
    }

    /**
     * Data describing a downloaded audio segment of an audio representation.
     */
    interface DownloadedAudioData extends DownloadedData {
    }

    /**
     * Data describing a downloaded video segment of a video representation.
     */
    interface DownloadedVideoData extends DownloadedData {
      /**
       * The width of the video representation.
       */
      width: number;
      /**
       * The height of the video representation.
       */
      height: number;
    }

    interface PlayerVRAPI {
      /**
       * Enables or disables stereo mode for VR content.
       * @param {Boolean} enableStereo - If true, stereo mode will be enabled.
       * @returns {Boolean} - True if API call was successful, false otherwise.
       */
      setStereo(enableStereo: boolean): boolean;

      /**
       * Enables the gyroscope (also on VRHMDs).
       * @return {boolean} - True, if the VRHandler is ready, false otherwise.
       */
      enableGyroscope(): boolean;

      /**
       * Disables the gyroscope (also on VRHMDs).
       * @return {boolean} - True, if the VRHandler is ready, false otherwise.
       */
      disableGyroscope(): boolean;

      /**
       * Returns true, if the gyroscope is enabled, false otherwise.
       * @return {boolean} - True, if the gyroscope is enabled, false otherwise.
       */
      isGyroscopeEnabled(): boolean;

      /**
       * Enables the mouse controls.
       * @return {boolean} - True, if the VRHandler is ready, false otherwise.
       */
      enableMouseControl(): boolean;

      /**
       * Disables the mouse controls.
       * @return {boolean} - True, if the VRHandler is ready, false otherwise.
       */
      disableMouseControl(): boolean;

      /**
       * Returns true, if mouse controls are enabled, false otherwise.
       * @return {Boolean} - True, if mouse controls are enabled, false otherwise.
       */
      isMouseControlEnabled(): boolean;

      /**
       * Enables the keyboard controls.
       * @return {boolean} - True, if the VRHandler is ready, false otherwise.
       */
      enableKeyboardControl(): boolean;

      /**
       * Disables the keyboard controls.
       * @return {boolean} - True, if the VRHandler is ready, false otherwise.
       */
      disableKeyboardControl(): boolean;

      /**
       * Returns true, if keyboard controls are enabled, false otherwise.
       * @return {Boolean} - True, if keyboard controls are enabled, false otherwise.
       */
      isKeyboardControlEnabled(): boolean;

      /**
       * Returns true, if stereo is enabled, false otherwise.
       * @return {Boolean} - True, if stereo is enabled, false otherwise.
       */
      getStereo(): boolean;

      /**
       * Returns the current state of the VR handler or null, if the VR handler is not yet initialized.
       * @return {String|null} - The current state of the VR handler.
       */
      getState(): string | null;

      /**
       * Returns the last recorded error or null, if no error occurred.
       * @return {String|null} - The last recorded error.
       */
      getLastError(): string | null;

      /**
       * Returns the current viewing direction, if the VRHandler is in the playing state.
       * @return {VR.ViewingDirection} - The current viewing direction.
       */
      getViewingDirection(): VR.ViewingDirection;

      /**
       * Sets the given viewing direction, if the VRHandler is in the playing state.
       * @param {VR.ViewingDirection} viewingDirection - The viewing direction to set.
       * @return {boolean} - True, if the viewing direction could be set, false otherwise.
       */
      setViewingDirection(viewingDirection: VR.ViewingDirection): boolean;

      /**
       * Moves the current VR viewing direction in the given direction with the given speed. The speed is determined by
       * the length of the direction vector in degrees / second. The movement will be continued for 110ms, after that
       * period the movement will be dampened and fade out. To sustain a smooth viewport movement, no more than 100ms
       * must pass between consecutive calls to this function.
       * @param {VR.Vec3} direction - A three-component vector describing the direction and speed in which the viewing
       *   direction shall be moved.
       * @return {Boolean} - True, if the VRHandler is ready, false otherwise.
       */
      moveViewingDirection(direction: VR.Vec3): boolean;

      /**
       * Sets the minimal interval between consecutive VRViewingDirectionChange events. The default value is
       * 250ms.
       * @param {number} interval - The minimal interval between consecutive VRViewingDirectionChange events.
       * @return {boolean} - True, if the VRHandler is ready, false otherwise.
       */
      setViewingDirectionChangeEventInterval(interval: number): boolean;

      /**
       * Gets the minimal interval between consecutive VRViewingDirectionChange events.
       * @return {Number} - The minimal interval between consecutive VRViewingDirectionChange events.
       */
      getViewingDirectionChangeEventInterval(): number;

      /**
       * Sets the number of degrees that the viewport can change before the VRViewingDirectionChange event is
       * triggered. The default value is 5°.
       * @param {Number} threshold - The threshold in degrees that the viewport can change before the
       * VRViewingDirectionChange event is triggered.
       * @return {Boolean} - True, if the VRHandler is ready, false otherwise.
       */
      setViewingDirectionChangeThreshold(threshold: number): boolean;

      /**
       * Gets the number of degrees that the viewport can change before the VRViewingDirectionChange event is
       * triggered.
       * @return {Number} - The threshold in degrees that the viewport can change before the
       * VRViewingDirectionChange event is triggered.
       */
      getViewingDirectionChangeThreshold(): number;

      /**
       * Sets the vertical field of view in degrees.
       * @param {Number} fieldOfView - The vertical field of view in degrees.
       * @return {Boolean} - True, if the VRHandler is ready, false otherwise.
       */
      setVerticalFieldOfView(fieldOfView: number): boolean;

      /**
       * Gets the vertical field of view in degrees.
       * @return {Number} - The vertical field of view in degrees.
       */
      getVerticalFieldOfView(): number;

      /**
       * Sets the horizontal field of view in degrees.
       * @param {Number} fieldOfView - The horizontal field of view in degrees.
       * @return {Boolean} - True, if the VRHandler is ready, false otherwise.
       */
      setHorizontalFieldOfView(fieldOfView: number): boolean;

      /**
       * Gets the horizontal field of view in degrees.
       * @return {Number} - The horizontal field of view in degrees.
       */
      getHorizontalFieldOfView(): number;

      /**
       * Applies a zoom factor to the current field of view.
       * @param {number} factor - The zoom factor to apply.
       * @return {Boolean} - True, if the VRHandler is ready, false otherwise.
       */
      zoom(factor: number): boolean;

      /**
       * Returns the current zoom factor.
       * @returns {number} - The current zoom factor, if the VRHandler is ready, -1 otherwise.
       */
      getZoom(): number;
    }

    namespace VR {
      enum ContentType {
        /**
         * A single equirectangular video typically used for 2D VR/360 content.
         */
        SINGLE,
          /**
           * Two equirectangular videos for 3D content in top-and-bottom position.
           */
        TAB,
          /**
           *  Two equirectangular videos for 3D content in side-by-side position.
           */
        SBS,
      }

      enum State {
        READY,
        PLAYING,
        ERROR,
        UNINITIALIZED,
      }

      /**
       * The direction in which the viewport of the VR player is looking.
       */
      interface ViewingDirection {
        /**
         * Rotation around the vertical axis in degrees.
         */
        yaw: number;
        /**
         * Rotation around the horizontal axis in degrees.
         */
        pitch: number;
        /**
         * Rotation around the depth axis in degrees.
         */
        roll: number;
      }

      interface Status {
        /**
         * The type of the VR content. Either one of the {@link VR.CONTENT_TYPE} enum values or 'none' for
         * non-VR content.
         * TODO add 'none' to CONTENT_TYPE enum
         */
        contentType: ContentType | string;
        /**
         * The current playback state. Is either 'ready' (if playback has not yet started), 'playing'
         * (if VR content is playing) or 'error' if an error occurred and VR playback has been disabled.
         * Will only be present if contentType is not 'none'.
         * TODO introduce PlaybackState enum
         */
        playbackState?: string;
        /**
         * The last error that occurred. Will only be present if playbackState equals 'error'.
         * TODO update description to PlaybackState.Error enum value
         */
        lastError?: string;
        /**
         * True, if the content is currently played back in stereo. Will only be present if contentType is
         * not 'none' and playbackState is not 'error'.
         * TODO update description with enum values
         */
        isStereo?: boolean;
        /**
         * The direction the player is currently facing. Will only be present if contentType is not 'none'
         * and playbackState is not 'error'.
         * TODO update description with enum values
         */
        viewingDirection?: ViewingDirection;
      }

      interface Vec3 {
        /**
         * The x component of the vector.
         */
        x: number;
        /**
         * The y component of the vector.
         */
        y: number;
        /**
         * The roll of the vector.
         */
        phi: number;
      }

      /**
       * Represents a viewing window for VR content. The current viewing direction is restricted to the set viewing
       * window.
       */
      interface ViewingWindow {
        /**
         * Lower bound for yaw.
         */
        minYaw: number;
        /**
         * Upper bound for yaw.
         */
        maxYaw: number;
        /**
         * Lower bound for pitch.
         */
        minPitch: number;
        /**
         * Upper bound for pitch.
         */
        maxPitch: number;
      }

      enum TransitionTimingType {
        NONE,
        EASE_IN,
        EASE_OUT,
        EASE_IN_OUT,
      }

      interface KeyMap {
        /**
         * The keys that shall be used to move the viewing direction upwards. Each string represents a key combination,
         * where different keys are separated by a space character, i.e. 'w', 'ArrowUp' or 'Alt F4'.
         */
        up?: string[];
        /**
         * The keys that shall be used to move the viewing direction downwards. Each string represents a key
         * combination, where different keys are separated by a space character, i.e. 'w', 'ArrowUp' or 'Alt F4'.
         */
        down?: string[];
        /**
         * The keys that shall be used to move the viewing direction leftwards. Each string represents a key
         * combination, where different keys are separated by a space character, i.e. 'w', 'ArrowUp' or 'Alt F4'.
         */
        left?: string[];
        /**
         * The keys that shall be used to move the viewing direction rightwards. Each string represents a key
         * combination, where different keys are separated by a space character, i.e. 'w', 'ArrowUp' or 'Alt F4'.
         */
        right?: string[];
        /**
         * The keys that shall be used to rotate the viewing direction clockwise. Each string represents a key
         * combination, where different keys are separated by a space character, i.e. 'w', 'ArrowUp' or 'Alt F4'.
         */
        rotateClockwise?: string[];
        /**
         * The keys that shall be used to rotate the viewing direction counterclockwise. Each string represents a key
         * combination, where different keys are separated by a space character, i.e. 'w', 'ArrowUp' or 'Alt F4'.
         */
        rotateCounterclockwise?: string[];
      }
    }

    interface PlayerSubtitlesAPI {
      add(subtitle: SubtitleTrack): void;
      remove(subtitleID: string): void;
      list(): SubtitleTrack[];
      enable(subtitleID: string, exclusive?: boolean): void;
      disable(subtitleID: string): void;
    }
  }
}
