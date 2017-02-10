/// <reference path='player-config.d.ts' />
/// <reference path='player-events.d.ts' />

declare namespace bitmovin {

  /**
   * Creates and returns a new player instance attached to the provided DOM element ID.
   * @param domElementID the ID of the DOM (i.e. HTML) element that the player should be added to
   */
  function player(domElementID: string): player.Player;

  namespace player {

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

    interface VRStatus {
      /**
       * The type of the VR content. Either one of the {@link VR.CONTENT_TYPE} enum values or 'none' for
       * non-VR content.
       * TODO add 'none' to CONTENT_TYPE enum
       */
      contentType: VR.CONTENT_TYPE | string;
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
      w: number;
      /**
       * Height of the thumbnail.
       */
      h: number;
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
    }

    /**
     * Defines messages to be shown during ad playback.
     */
    interface SkipMessage {
      /**
       * The message that is displayed until the ad can be skipped.
       * Has the placeholder 'xx', which is replaced by the remaining time until the ad can be skipped.
       * TODO replace placeholder with a better pattern, e.g. '{remainingTime}' instead of 'xx' which can
       *      appear in normal text (for backwards compatibility, the new pattern could be matched first and
       *      if not found, fallback to the old pattern)
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

    /**
     * Definition of a subtitle/caption track.
     */
    interface Subtitle {
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
       * The URL to the subtitle track.
       * TODO check why this is missing from the API docs
       */
      url: string;
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

    /**
     * Bitmovin Player instance members.
     */
    interface Player {
      /**
       * Subscribes an event handler to a player event.
       *
       * @param eventType The type of event to subscribe to.
       * @param callback The event callback handler that will be called when the event fires.
       */
      addEventHandler(eventType: EVENT, callback: PlayerEventCallback): Player;
      /**
       * Sends custom metadata to Bitmovin's Cast receiver app.
       *
       * @param metadataType The type of the metadata. Currently only 'CAST' is supported.
       * TODO validate why it says 'CAST' here and if it shouldn't be 'cast' (lowercase) instead
       * @param metadata The custom data to send to the receiver.
       */
      addMetadata(metadataType: string, metadata: any): void;
      /**
       * Adds a new external subtitle/caption track. The track is only added to the available tracks but
       * not activated. Call {@link #setSubtitle} to activate it.
       *
       * @param subtitle the subtitle to add
       */
      addSubtitle(subtitle: Subtitle): Player;
      /**
       * Stops a running Cast session (i.e. {@link #isCasting} returns true). Has no effect if {@link #isCasting}
       * returns false.
       */
      castStop(): Player;
      /**
       * Initiates casting the current video to a Cast-compatible device. The user has to choose the target device.
       */
      castVideo(): Player;
      /**
       * Removes all existing query parameters as specified in {@link #setQueryParameters} or
       * {@link Config#tweaks#query_parameters}.
       */
      clearQueryParameters(): Player;
      /**
       * Unloads the player and removes all inserted HTML elements and event handlers.
       */
      destroy(): void;
      /**
       * Switch player to fullscreen mode. Has no effect if already in fullscreen.
       */
      enterFullscreen(): void;
      /**
       * Exit player fullscreen mode. Has no effect if not in fullscreen.
       */
      exitFullscreen(): void;
      /**
       * Returns the currently used audio track.
       */
      getAudio(): AudioTrack;
      /**
       * Returns the seconds of already buffered audio data or null if no audio source is loaded.
       */
      getAudioBufferLength(): number | null;
      /**
       * Returns an array of all available audio tracks.
       */
      getAvailableAudio(): AudioTrack[];
      /**
       * Returns an array of all available audio qualities the player can adapt between.
       */
      getAvailableAudioQualities(): AudioQuality[];
      /**
       * Returns a list of available impression servers.
       */
      getAvailableImpressionServers(): string[];
      /**
       * Returns a list of available license servers.
       */
      getAvailableLicenseServers(): string[];
      /**
       * Returns an array of all available subtitle/caption tracks.
       */
      getAvailableSubtitles(): Subtitle[];
      /**
       * Returns an array containing all available video qualities the player can adapt between.
       */
      getAvailableVideoQualities(): VideoQuality[];
      /**
       * Returns the config object of the current player instance.
       *
       * @param mergedConfig true to return the config expanded with all default values, false to return the user
       *   config passed to {@link #setup}
       */
      getConfig(mergedConfig?: boolean): any;
      /**
       * Returns the current playback time in seconds of the video.
       */
      getCurrentTime(): number;
      /**
       * Returns data about the last downloaded audio segment.
       */
      getDownloadedAudioData(): DownloadedAudioData;
      /**
       * Returns data about the last downloaded video segment.
       */
      getDownloadedVideoData(): DownloadedVideoData;
      /**
       * Returns the total number of dropped frames since playback started.
       */
      getDroppedFrames(): number;
      /**
       * Returns the total duration in seconds of the current video or {@code Infinity} if it’s a live stream.
       */
      getDuration(): number;
      /**
       * Returns the figure element that the player is embedded in, if the player is set up, or null otherwise.
       */
      getFigure(): HTMLElement;
      /**
       * Returns the manifest file.
       */
      getManifest(): Object;
      /**
       * Returns the limit in seconds for time shift. Is either negative or 0 and applicable to live streams only.
       */
      getMaxTimeShift(): number;
      /**
       * Returns data about the currently played audio segment.
       */
      getPlaybackAudioData(): AudioQuality;
      /**
       * Returns the current playback speed of the player. 1 is the default playback speed, values
       * between 0 and 1 refer to slow motion and values greater than 1 refer to fast forward. Values less or
       * equal zero are ignored.
       */
      getPlaybackSpeed(): number;
      /**
       * Returns data about the currently played video segment.
       */
      getPlaybackVideoData(): VideoQuality;
      /**
       * Returns the currently used rendering mode. Possible values are html5, flash, and native.
       * TODO convert to enum, see {@link SupportedTech#player}
       */
      getPlayerType(): string;
      /**
       * Creates a snapshot of the current video frame.
       * TODO is it possible to take a snapshot of DRM protected content?
       *
       * @param type The type of image snapshot to capture. Allowed values are 'image/jpeg' and 'image/webp'.
       * TODO convert type to enum
       * @param quality A number between 0 and 1 indicating the image quality.
       */
      getSnapshot(type?: string, quality?: number): Snapshot;
      /**
       * Returns the currently used streaming technology. Possible values are currently dash, hls, and progressive.
       * TODO convert to enum, see {@link SupportedTech#streaming}
       */
      getStreamType(): string;
      /**
       * Returns the currently used subtitle track.
       */
      getSubtitle(): Subtitle;
      /**
       * Tests and retrieves a list of all supported DRM systems in the current user agent.
       */
      getSupportedDRM(): Promise<string[]>;
      /**
       * Returns an array of objects denoting a player and streaming technology combination supported on
       * the current platform. The order in the array is the order which will be used to play a stream.
       */
      getSupportedTech(): SupportedTech[];
      /**
       * Returns a thumbnail image for a certain time or null if there is no thumbnail available.
       * @param time the media time for which the thumbnail should be returned
       */
      getThumb(time: number): Thumbnail;
      /**
       * Returns the current time shift offset to the live edge in seconds. Only applicable to live streams.
       */
      getTimeShift(): number;
      /**
       * Returns the stalled time in seconds since playback started.
       */
      getTotalStalledTime(): number;
      /**
       * Returns the seconds of already buffered video data or null if no video source is loaded.
       */
      getVideoBufferLength(): number | null;
      /**
       * Returns the player’s volume between 0 (silent) and 100 (max volume).
       */
      getVolume(): number;
      /**
       * Returns the current VR playback status.
       */
      getVRStatus(): VRStatus;
      /**
       * Returns true if the video has ended.
       */
      hasEnded(): boolean;
      /**
       * Returns true while an ad is played back, false otherwise.
       */
      isAd(): boolean;
      /**
       * Returns true if casting to another device (such as a ChromeCast) is available, otherwise false.
       * Please note that this function only returns true after the onCastAvailable event has fired.
       */
      isCastAvailable(): boolean;
      /**
       * Returns true if the video is currently casted to a device and not played in the browser,
       * or false if the video is played locally.
       */
      isCasting(): boolean;
      /**
       * Checks if a DRM system is supported in the current user agent.
       *
       * @param drmSystem A KeySystem string to test against
       */
      isDRMSupported(drmSystem: string): Promise<string>;
      /**
       * Returns true if the player is currently in fullscreen mode.
       */
      isFullscreen(): boolean;
      /**
       * Return true if the displayed video is a live stream.
       */
      isLive(): boolean;
      /**
       * Returns true if the player has been muted.
       */
      isMuted(): boolean;
      /**
       * Returns true if the player has started playback but is currently paused.
       */
      isPaused(): boolean;
      /**
       * Returns true if the player is currently playing, i.e. has started and is not paused.
       */
      isPlaying(): boolean;
      /**
       * Returns true if the player has finished initialization and is ready to use and to handle other API calls.
       */
      isReady(): boolean;
      /**
       * Returns true if the setup call has already been successfully called.
       */
      isSetup(): boolean;
      /**
       * Returns true if the player is currently stalling due to an empty buffer.
       */
      isStalled(): boolean;
      /**
       * Sets a new video source.
       *
       * @param source A source object as specified in player configuration during {@link #setup}
       * @param forceTechnology Forces the player to use the specified playback and streaming technology
       * @param disableSeeking If set, seeking will be disabled
       */
      load(source: SourceConfig, forceTechnology?: string, disableSeeking?: boolean): void;
      /**
       * Mutes the player if an audio track is available. Has no effect if the player is already muted.
       */
      mute(): Player;
      /**
       * Pauses the video if it is playing. Has no effect if the player is already paused.
       */
      pause(issuer?: string): Player;
      /**
       * Starts playback or resumes after being paused. No need to call it if the player is setup with
       * autoplay attribute ({@link Config#playback#autoplay}). Has no effect if the player is already playing.
       */
      play(issuer?: string): Player;
      /**
       * Removes a handler for a player event.
       *
       * @param eventType The event to remove the handler from
       * @param callback The callback handler to remove
       */
      // TODO remove string type option (this is a temporary hack for PlayerWrapper#clearEventHandlers)
      removeEventHandler(eventType: EVENT | string, callback: PlayerEventCallback): Player;
      /**
       * Removes the existing subtitle/caption track with the track ID specified by trackID. If the track is
       * currently active, it will be deactivated and then removed. If no track with the given ID exists,
       * the call will be ignored.
       * To disable an active subtitle track, call {@link #setSubtitle} with null.
       *
       * @param subtitleTrackID The ID of the subtitle to remove
       */
      removeSubtitle(subtitleTrackID: string): Player;
      /**
       * Schedules an ad for playback.
       *
       * @param adManifestUrl URL to the ad manifest
       * @param adType Always 'vast' (for now)
       * TODO convert adType to enum? (if ad systems should be pluggable and they are therefore not statically defined,
       *   keep it as string)
       * @param options Optional ad parameters
       */
      scheduleAd(adManifestUrl: string, adType: string, options?: ScheduleAdOptions): void;
      /**
       * Seeks to the given playback time specified by the parameter time in seconds. Must not be greater
       * than the total duration of the video. Has no effect when watching a live stream as seeking is
       * not possible.
       *
       * @param time The time to seek to
       */
      seek(time: number): boolean;
      /**
       * Sets the audio track to the ID specified by trackID.
       * Available tracks can be retrieved with {@link #getAvailableAudio}.
       *
       * @param trackID The ID of the audio track to activate
       */
      setAudio(trackID: string): Player;
      /**
       * Manually sets the audio stream to a fixed quality, identified by ID. Has to be an ID defined in
       * the MPD or the keyword 'auto'. Auto resets to dynamic switching. A list with valid IDs can be
       * retrieved by calling {@link #getAvailableAudioQualities}.
       *
       * @param audioQualityID The ID of the desired audio quality or 'auto' for dynamic switching
       */
      setAudioQuality(audioQualityID: string): Player;
      /**
       * Sets authentication data which is sent along with the licensing call. Can be used to add more
       * information for a 3rd party licensing backend. The data be any type or object as needed by the
       * 3rd party licensing backend.
       *
       * @param customData Data which should be sent with the licensing call
       */
      setAuthentication(customData: any): void;
      /**
       * Sets the number of the last segment that the player is allowed to request.
       * Only working with Segment Template manifests.
       *
       * @param lastSegmentNum The number of the last segment to request
       */
      setLastSegment(lastSegmentNum: number): Player;
      /**
       * Sets the playback speed of the player. Fast forward as well as slow motion is supported.
       * Slow motion is used by values between 0 and 1, fast forward by values greater than 1.
       *
       * @see #getPlaybackSpeed
       * @param speed A playback speed factor greater than 0
       */
      setPlaybackSpeed(speed: number): void;
      /**
       * Sets a poster image. Will be displayed immediately, even if a video stream is playing.
       *
       * @param url The URL to the poster image
       * @param keepPersistent Flag to set the poster image persistent so it is also displayed during playback (useful
       *   for audio-only playback)
       */
      setPosterImage(url: string, keepPersistent: boolean): void;
      /**
       * Adds GET parameters to all request URLs (e.g. manifest, media segments, subtitle files, …).
       * The queryParameters should be an object with key value pairs, where the keys are used as
       * parameter name and the values as parameter values.
       *
       * @param queryParameters The list of query parameter key/value pairs
       */
      setQueryParameters(queryParameters: { [key: string]: string; }): Player;
      /**
       * Sets the subtitle track to the ID specified by trackID. A list can be retrieved by calling
       * {@link #getAvailableSubtitles}. Using null as ID disables subtitles.
       *
       * @param trackID The ID if the desired subtitle track or null to disable subtitles
       */
      setSubtitle(trackID: string): Player;
      /**
       * Sets up a new player instance with the given configuration, as specified in player configuration documentation.
       *
       * @param userConfig User-supplied configuration of the player
       * @param forceTechnology Forces the player to use the specified playback and streaming technology
       */
      setup(userConfig: Config, forceTechnology?: string): Promise<Player>;
      /**
       * Passes an HTML video element to the player, which should be used in case of non-Flash playback.
       * Needs to be called before {@link #setup}. Has no effect if the Flash fallback is selected.
       *
       * @param videoElement The HTML video element to use
       */
      setVideoElement(videoElement: HTMLElement): void;
      /**
       * Manually sets the video stream to a fixed quality, identified by ID. Has to be an ID defined in
       * the MPD or the keyword 'auto'. Auto resets to dynamic switching. A list with valid IDs can be retrieved
       * by calling {@link #getAvailableVideoQualities}.
       *
       * @param videoQualityID ID defined in the MPD or 'auto'
       */
      setVideoQuality(videoQualityID: string): Player;
      /**
       * Sets the player’s volume in the range of 0 (silent) to 100 (max volume). Unmutes a muted player.
       *
       * @param volume The volume to set between 0 and 100
       */
      setVolume(volume: number): Player;
      /**
       * Enables or disables stereo mode for VR content.
       *
       * @param enableStereo true to enable stereo, false to disable
       * @returns true if stereo mode was successfully set, else false
       */
      setVRStereo(enableStereo: boolean): boolean;
      /**
       * Skips the current ad. Has no effect if ad is not skippable or if no ad is played back.
       */
      skipAd(): void;
      /**
       * Shifts the time to the given offset in seconds from the live edge. Has to be within {@link #getMaxTimeShift}
       * (which is a negative value) and 0. Only works in live streams.
       * New in v4.3: The offset can be positive and is then interpreted as a UNIX timestamp in seconds. The
       * value has to be within the timeShift window as specified by {@link #getMaxTimeShift}.
       *
       * @param offset The offset to timeshift to
       */
      timeShift(offset: number): Player;
      /**
       * Unloads the current video source.
       */
      unload(): Player;
      /**
       * Unmutes the player if muted.
       */
      unmute(): Player;

      fireEvent(event: EVENT, data: {}): void;
      /**
       * All available events of the player.
       */
      EVENT: EventList;
      /**
       * The version number of the player.
       */
      version: string;
      /**
       * Checks if Apple AirPlay support is available.
       */
      isAirplayAvailable(): boolean;
      /**
       * Shows the airplay playback target picker.
       */
      showAirplayTargetPicker(): Player;
      /**
       * Checks if macOS picture in picture mode is available.
       */
      isPictureInPictureAvailable(): boolean;
      /**
       * Returns the status of picture in picture mode.
       */
      isPictureInPicture(): boolean;
      /**
       * Enter picture in picture mode.
       */
      enterPictureInPicture(): Player;
      /**
       * Exit picture in picture mode.
       */
      exitPictureInPicture(): Player;
    }

    namespace VR {
      enum CONTENT_TYPE {
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
        SBS
      }
    }
  }
}
