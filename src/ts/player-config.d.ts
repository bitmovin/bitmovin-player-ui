declare namespace bitmovin {

  namespace PlayerAPI {

    interface ProgressiveSourceConfig {
      /**
       * The URL to the progressive video file.
       */
      url: string;
      /**
       * The MIME type of the video file, e.g. “video/mp4” or “video/webm”.
       */
      type?: string;
      /**
       * Can be used to specify which bitrate the a progressive source has. Providing multiple progressive
       * sources with different bitrates allows the users to manually select qualities.
       * Please note that no automatic quality switching will happen.
       */
      bitrate?: number;
      /**
       * Sets the source/quality which the player will use per default. Should be set to true at only one object
       * within the progressive array. If no element has set this attribute to true, the first object in the array
       * will be used per default.
       */
      preferred?: boolean;
      /**
       * Specifies the label to be displayed in the quality selection in the player’s settings window.
       */
      label?: string;
    }

    interface SourceConfigOptions {
      /**
       * Send credentials and cookies along with cross origin manifest (HLS and MPEG-DASH) requests.
       * Must be supported by the server. Default is false.
       */
      manifestWithCredentials?: boolean;
      /**
       * Send credentials and cookies along with cross origin (HLS and MPEG-DASH) segment requests.
       * Must be supported by the server. Default is false.
       */
      withCredentials?: boolean;
      /**
       * Send credentials and cookies along with cross origin HLS manifest requests.
       * Must be supported by the server. Default is false.
       */
      hlsManifestWithCredentials?: boolean;
      /**
       * Send credentials and cookies along with cross origin HLS segment requests.
       * Must be supported by the server. Default is false.
       */
      hlsWithCredentials?: boolean;
      /**
       * Send credentials and cookies along with cross origin MPEG-DASH manifest requests.
       * Must be supported by the server. Default is false.
       */
      dashManifestWithCredentials?: boolean;
      /**
       * Send credentials and cookies along with cross origin MPEG-DASH segment requests.
       * Must be supported by the server. Default is false.
       */
      dashWithCredentials?: boolean;
      /**
       * If set to true, this will keep the poster image visible during playback, e.g. for audio-only streams.
       */
      persistentPoster?: boolean;
      /**
       * The position in fractional seconds to start playback from.
       */
      startTime?: number;
    }

    interface SourceConfigTrack {
      /**
       * The URL to the timed text file, i.e. WebVTT file.
       */
      file: string;
      /**
       * The type of timed data. At the moment, “thumbnails” is the only supported kind.
       */
      kind: string;
    }

    interface Header {
      /**
       * The name of the HTTP header.
       */
      name: string;
      /**
       * The value of the HTTP header.
       */
      value: string;
    }

    interface DRMConfig {
    }

    interface WidevineModularDRMConfig extends DRMConfig {
      /**
       * An URL to the Widevine license server for this content (mandatory for widevine).
       */
      LA_URL: string;
      /**
       * Set to true to send credentials such as cookies or authorization headers along with the license requests.
       * Default is false.
       */
      withCredentials?: boolean;
      /**
       * Specifies how often a license request should be retried if was not successful (e.g. the license server
       * was not reachable). Default is 1. 0 disables retries.
       */
      maxLicenseRequestRetries?: number;
      /**
       * Specifies how long in milliseconds should be waited before a license request should be retried.
       */
      licenseRequestRetryDelay?: number;
      /**
       * An array of objects which specify custom HTTP headers.
       */
      headers?: Header[];
      /**
       * A function which gets the widevine license from the server. Is needed for custom widevine servers where
       * not only the license itself is responded, but instead the license is e.g. wrapped in an JSON object.
       * @param licenseObject
       */
      prepareLicense?: (licenseObject: any) => any;
      /**
       * A function to prepare the license acquisition message which will be sent to the license acquisition
       * server. As many DRM provider expect different, vendor-specific message, this can be done using this
       * user-defined function (optional / depending on the DRM server). The parameter is the key message event
       * object as given by the Widevine Content Decryption Module (CDM).
       * @param keyMessage
       */
      prepareMessage?: (keyMessage: any) => any;
      /**
       * An object which allows to specify configuration options of the DRM key system, such as
       * distinctiveIdentifier or persistentState (refer to
       * {@link https://w3c.github.io/encrypted-media/#mediakeysystemconfiguration-dictionary
       * MediaKeySystemConfiguration} for more details). Please note that these settings need to be supported by the
       * browser or playback will fail.
       */
      mediaKeySystemConfig?: Object;
    }

    interface PlayReadyDRMConfig extends DRMConfig {
      /**
       * An URL to the PlayReady license server for this content (optional).
       */
      LA_URL?: string;
      /**
       * Set to true to send credentials such as cookies or authorization headers along with the license requests.
       * Default is false.
       */
      withCredentials?: boolean;
      /**
       * Specifies how often a license request should be retried if was not successful (e.g. the license
       * server was not reachable). Default is 1. 0 disables retries.
       */
      maxLicenseRequestRetries?: number;
      /**
       * Specifies how long in milliseconds should be waited before a license request should be retried.
       */
      licenseRequestRetryDelay?: number;
      /**
       * An array of objects which specify custom HTTP headers.
       */
      headers?: Header[];
    }

    interface AdobeAccessDRMConfig extends DRMConfig {
      /**
       * The URL to the Adobe Access license server for this content. The URL should already include all
       * necessary GET parameters.
       */
      LA_URL: string;
      /**
       * The token required to authenticate on the Access license server.
       */
      authToken: string;
    }

    interface AdobePrimeTimeDRMConfig extends DRMConfig {
      /**
       * The URL to the Adobe PrimeTime license server for this content.
       */
      LA_URL: string;
      /**
       *  The URL for individualization requests.
       */
      indivURL: string;
      /**
       * Set to true to send credentials such as cookies or authorization headers along with the license requests.
       * Default is false.
       */
      withCredentials?: boolean;
      /**
       * An array of objects which specify custom HTTP headers.
       */
      headers?: Header[];
      /**
       * An object which allows to specify configuration options of the DRM key system, such as
       * distinctiveIdentifier or persistentState (refer to
       * {@link https://w3c.github.io/encrypted-media/#mediakeysystemconfiguration-dictionary
       * MediaKeySystemConfiguration} for more details). Please note that these settings need to be supported by the
       * browser or playback will fail.
       */
      mediaKeySystemConfig?: Object;
    }

    interface AppleFairplayDRMConfig extends DRMConfig {
      /**
       * The URL to the Fairplay license server for this content.
       */
      LA_URL: string;
      /**
       * The URL to the Fairplay certificate of the license server.
       */
      certificateURL: string;
      /**
       * An array of objects which specify custom HTTP headers for the license request (optional).
       */
      headers?: Header[];
      /**
       * An array of objects which specify custom HTTP headers for the certificate request (optional).
       */
      certificateHeaders?: Header[];
      /**
       * A function to prepare the license acquisition message which will be sent to the license acquisition
       * server (optional). As many DRM providers expect different, vendor-specific messages, this can be done
       * using this user-defined function. The first parameter is the key message event object as given by the
       * Fairplay Content Decryption Module (CDM), enhanced by the messageBase64Encoded attribute, which contains
       * the key message encoded as base64 encoded string. The second parameter is the ssion object, enhanced by
       * a contentId attribute.
       * @param event
       * @param session
       */
      prepareMessage?: (event: any, session: any) => any;
      /**
       * A function to prepare the contentId, which is sent to the Fairplay license server as request body
       * (optional). As many DRM providers expect different, vendor-specific messages, this can be done using
       * this user-defined function. The parameter is the URI extracted from the HLS manifset (m3u8) and the
       * return value should be the contentID as string.
       * @param url
       */
      prepareContentId?: (url: string) => string;
      /**
       * Set to true to send credentials such as cookies or authorization headers along with the license requests.
       * Default is false.
       */
      withCredentials?: boolean;
      /**
       * A function to prepare the certificate before passing it into the browser. This is needed if the server
       * response with anything else than the certificate, e.g. if the certificate is wrapped into a JSON object.
       * The server response is passed as parameter “as is” and the return type is expected to be an ArrayBuffer.
       * @param data
       */
      prepareCertificate?: (data: any) => ArrayBuffer;
      /**
       * A function to prepare the license before passing it into the browser. This is needed if the server
       * response with anything else than the license, e.g. if the license is wrapped into a JSON object.
       * The server response is passed as parameter “as is” and the return type is expected to be a
       * Base64-encoded string.
       * @param data
       */
      prepareLicense?: (data: any) => string;
      /**
       * Similar to prepareLicense, this callback can be used to prepare the license before passing it to the
       * browser, but the license can be processed asynchronously. Please note that this function must return a
       * promise and the parameter for the resolve function needs to be the Uint8Array, which is passed “as is”
       * to the browser. Using this function prevents prepareLicense from being called.
       * @param data
       */
      prepareLicenseAsync?: (data: any) => Promise<Uint8Array>;
      /**
       * A boolean flag to change between Uint8Array (default, value false) and Uint16Array initialization data.
       * Depends on the fairplay license server, most use Uint8Array but e.g. EZDRM requires Uint16Array.
       */
      useUint16InitData?: boolean;
      /**
       * Sets an explicit response type for the license request. Default response type for this request is
       * 'text', e.g. EZDRM requires 'blob'
       */
      licenseResponseType?: string;
    }

    interface VRControlConfig {
      /**
       * Specifies the transition timing that shall be used for this control.
       */
      transitionTimingType?: VR.TransitionTimingType;
      /**
       * The time that a transition should take.
       */
      transitionTime?: number;
      /**
       * The maximum displacement speed in degrees per second. Default values are 90°/s for keyboard controls, and
       * Infinity for mouse and API controls.
       */
      maxDisplacementSpeed?: number;
    }

    interface VRKeyboardControlConfig extends VRControlConfig {
      /**
       * Specifies which keys should be used for the keyboard control.
       */
      keyMap?: VR.KeyMap;
    }

    interface VRConfig {
      /**
       * Specifies the type of the VR/360 content.
       */
      contentType: VR.ContentType;
      /**
       * Specifies if the video should start in stereo mode (true) or not (false, default).
       */
      stereo?: boolean;
      /**
       * Specifies the starting viewpoint, stated in degrees.
       */
      startPosition?: number;
      /**
       * Specifies the angles the user can view around within the VR/360 video.
       * Per default, the user has no limitations.
       */
      viewingWindow?: VR.ViewingWindow;
      /**
       * Specifies whether the restricted inline playback shall be used or not.
       */
      restrictedInlinePlayback?: boolean;
      /**
       * Specifies whether performance measurements shall be enabled or not.
       */
      enableFrameRateMeasurements?: boolean;
      /**
       * Specifies the cardboard config.
       */
      cardboard?: string;
      /**
       * The threshold in degrees that the viewport can change before the ON_VR_VIEWING_DIRECTION_CHANGE event is
       * triggered.
       */
      viewingDirectionChangeThreshold?: number;
      /**
       * The minimal interval between consecutive ON_VR_VIEWING_DIRECTION_CHANGE events.
       */
      viewingDirectionChangeEventInterval?: number;
      /**
       * The keyboard control config.
       */
      keyboardControl?: VRKeyboardControlConfig;
      /**
       * The mouse control config.
       */
      mouseControl?: VRControlConfig;
      /**
       * The api control config.
       */
      apiControl?: VRControlConfig;
    }

    interface SourceLabelingConfig {
      /**
       * A function that generates a label for a track, usually an audio track.
       * @param track Object with metadata about the track for which the label should be generated. The id field is
       *   populated when used for HLS, the mimeType when used for DASH.
       */
      tracks?: (track: { id?: string, mimeType?: string, lang: string }) => string;
      /**
       * A function that generates a label for a quality, usually a video quality.
       * @param quality Object with metadata about the quality for which the label should be generated.
       */
      qualities?: (quality: { id: string, mimeType: string, bitrate: number, width: number, height: number, qualityRanking?: number, frameRate?: number }) => string;
      /**
       * A function that generates a label for a subtitle.
       * @param subtitle The subtitle for which the label should be generated.
       */
      subtitles?: (subtitle: Subtitle) => string;
    }

    interface SourceConfig {
      /**
       * The URL to the MPEG-DASH manifest file (MPD, Media Presentation Description) for the video to play.
       * The file has to be a valid MPD. MPEG-DASH content can easily and for free be generated using our
       * encoding solution bitcodin.
       */
      dash?: string;
      /**
       * An URL to an HLS playlist file (M3U8). The file has to be a valid M3U8 playlist.
       * HLS content can easily and for free be generated using our encoding solution bitcodin.
       */
      hls?: string;
      /**
       * An URL to a Microsoft Smooth Streaming Manifest (normally ends with .ism/Manifest but can also be a .xml)
       * @since 7.5
       */
      smooth?: string;
      /**
       * An Array of objects to video files, used for progressive download as fallback. Is only used when all
       * other methods fail. Multiple progressive files can be used, e.g. .mp4 and .webm files to support as
       * many browsers as possible.
       */
      progressive?: string | ProgressiveSourceConfig[];
      /**
       * The URL to a preview image displayed until the video starts. Make sure JavaScript and Flash are allowed
       * to access it, i.e. CORS (for the HTML5/JavaScript player) must be enabled and a crossdomain.xml has to
       * be there if it’s not the same server as the website.
       */
      poster?: string;
      /**
       * The DRM object should be included into the source object.
       */
      drm?: DRMConfig;
      /**
       * An object specifying advanced source specific options.
       */
      options?: SourceConfigOptions;
      /**
       * An array of objects with timed data.
       */
      tracks?: SourceConfigTrack[];
      /**
       * Configuration for VR and omnidirectional (360°) video.
       */
      vr?: VRConfig;
      /**
       * The title of the video source.
       */
      title?: string;
      /**
       * The description of the video source.
       */
      description?: string;
      /**
       * An object with callback functions that provide labels for audio tracks, qualities and subtitle tracks.
       */
      labeling?: {
        /**
         * Labeling functions for DASH sources.
         */
        dash?: SourceLabelingConfig;
        /**
         * Labeling functions for HLS sources.
         */
        hls?: SourceLabelingConfig;
      };
    }

    interface PlaybackTech {
      player: string;
      streaming: string;
    }

    interface PlaybackConfig {
      /**
       * Whether the player starts playing after setup or not. Can be true or false (default).
       * Note that autoplay does not work on mobile devices and the bitmovin player therefore disables
       * it automatically on these devices!
       */
      autoplay?: boolean;
      /**
       * Whether the sound is muted on startup or not. Can be true or false (default).
       */
      muted?: boolean;
      /**
       * Defines one (as string) or more (as array of strings) audio languages which should be used in
       * the specified order on start up.
       */
      audioLanguage?: string | string[];
      /**
       * Defines one (as string) or more (as array of strings) subtitle languages which should be used
       * in the specified order on start up.
       */
      subtitleLanguage?: string | string[];
      /**
       * Disables the save & restore behavior of user settings like volume, muted, selected language etc.
       * if set to false. Default is false.
       */
      restoreUserSettings?: boolean;
      /**
       * Enables time shift / DVR for live streams. Default is true (enabled). If time shift is disabled
       * (set to false), the timeline (scrub bar) will not be shown any more.
       */
      timeShift?: boolean;
      /**
       * An array of objects to specify the player and streaming technology order to use. If the first is
       * supported, this technologies are used. If not, the second is tried etc.
       */
      preferredTech?: PlaybackTech[];

    }

    interface StyleConfig {
      /**
       * The width of the player. Can have any value including the unit (e.g. px, %, em, vw) usable in CSS,
       * e.g. 500px or 90%. Not more than two options of width, height, and aspect ratio should be given.
       * Defaults to 100%.
       */
      width?: string;
      /**
       * The height of the player. Can have any value including the unit (e.g. px, %, em, vh) usable in CSS,
       * e.g. 500px or 90%. Not more than two options of width, height, and aspect ratio should be given.
       * If no height is given, it is calculated in respect of the width in a way that a 16:9 aspect ratio
       * is given (default).
       */
      height?: string;
      /**
       * The aspect ratio of the player, e.g. 16:9, 16:10, 4:3. Not more than two options of width, height,
       * and aspect ratio should be given. Defaults to 16:9.
       */
      aspectratio?: string;
      /**
       * A short hand function to disable/enable controls, playOverlay, subtitles, keyboard,
       * and mouse. It is not possible to override this setting with one of the mentioned attributes.
       */
      ux?: boolean;
    }

    interface ContextMenuEntry {
      name: string;
      url: string;
    }

    interface TweaksConfig {
      /**
       * Determines if the automatic quality switching is enabled on startup. Can be true (default) or false.
       */
      autoqualityswitching?: boolean;
      /**
       * Changes the maximum buffer level in seconds. Default is 20 seconds.
       */
      max_buffer_level?: number;
      /**
       * If set to true, the mediaPresentationDuration (the total duration of the video) in the MPD is ignored
       * and the video is played until no more segments are available. This enables playback of MPDs with a wrong
       * mediaPresentationDuration. Default is false.
       */
      search_real_end?: boolean;
      /**
       * Custom context menu entries can be added. The value given to this option is an array of objects.
       * Each object should have a name attribute, which is the string displayed in the context menu, and a
       * url attribute, which is the link where the user gets redirected to if she clicks on the menu entry.
       * The order of the entries is defined by the array, i.e. the first element in the array is the first
       * element in the context menu.
       */
      context_menu_entries?: ContextMenuEntry[];
      /**
       * Set the wmode of the flash object if the flash fallback is used. Valid values are the strings direct,
       * window, opaque, transparent (default), and gpu. Please refer to Flash OBJECT and EMBED tag attributes
       * for more information.
       */
      wmode?: string;
      /**
       * Enable/Disable hardware-supported video decoding. Enabling this might lead to decoding artefacts,
       * but can improve performance. Default is false.
       */
      hwdecoding?: boolean;
      /**
       * DASH in Flash adds a timestamp as URL parameter to each MPD request to prevent caching, especially for
       * MPD updates. This setting enables/disables the parameter. Default is true (timestamp is added).
       */
      prevent_mpd_caching?: boolean;
      /**
       * Query parameters are added as GET parameters to all request URLs (e.g. manifest, media segments,
       * subtitle files, …). Query_parameters should be an object with key value pairs, where the keys are
       * used as parameter name and the values as parameter values.
       */
      query_parameters?: { [key: string]: string; };
      /**
       * If enabled the native player used for HLS in Safari would fetch and parse the HLS playlist and trigger
       * onSegmentPlayback events carrying segment-specific metadata like EXT-X-PROGRAM-DATE-TIME if present
       * in the manifest.
       */
      native_hls_parsing?: boolean;
    }

    interface CastConfig {
      /**
       * ChromeCast support is disabled per default. To enable it, set this attribute to true. Default is false.
       */
      enable?: boolean;
      /**
       * The ChromeCast application ID retrieved from Google when a Cast receiver app is registered. To use
       * ChromeCast with player version 6 an higher, it is not necessary to use this option. For versions
       * pre v6, please use ‘121122A0’, or your dedicated ID, in case you want to use a custom ChromeCast
       * receiver app.
       */
      application_id?: string;
      /**
       * A custom message namespace as defined in the Cast receiver app. To use ChromeCast, it is not necessary
       * to use this option! This is only needed if one wants to create a custom ChromeCast receiver app.
       */
      message_namespace?: string;
    }

    interface AdaptationConfig {
      /**
       * Limits the automatically selected quality to the player size, so the player won’t select quality
       * levels with a higher resolution than itself has. Default value is false (disabled).
       */
      limitToPlayerSize?: boolean;
      /**
       * The bitrate in bits per second (bps) the player should start playback with. If this option doesn’t exist
       * in the configuration, the player will try to find the best startup bitrate automatically.
       */
      startupBitrate?: string;
      /**
       * The maximum bitrate in bits per second (bps) the player should start playback with.
       * Has no effect if startupBitrate is used.
       */
      maxStartupBitrate?: string;
      /**
       * The player automatically cancels requests if it takes too long and retries in a lower quality.
       * This behavior can be disabled by setting this option to false (default is true).
       */
      disableDownloadCancelling?: boolean;
      /**
       * Specifies whether the player preloads the content or not. Can be true (default) or false.
       */
      preload?: boolean;
      /**
       * Lower and upper bitrate boundaries. Values should generally be strings with mbps (megabits per second), kbps
       * (kilobits per second), or bps (bits per second) units (e.g. '5000kbps'). Only the values 0 (no limitation for
       * lower boundaries) and Infinity (no limitation for upper boundaries) are not required to be strings.
       */
      bitrates?: {
        minSelectableAudioBitrate?: number | string;
        maxSelectableAudioBitrate?: number | string;
        minSelectableVideoBitrate?: number | string;
        maxSelectableVideoBitrate?: number | string;
      };
      /**
       * A callback function to customize the player's adaptation logic that is called before the player tries to
       * download a new video segment.
       * @param data An object carrying the <code>suggested</code> attribute, holding the suggested
       *   representation/quality ID the player would select
       * @return A valid representation/quality ID which the player should use, based on your custom logic (or
       *   <code>data.suggested</code> to switch to the suggested quality)
       * @see PlayerAPI#getAvailableVideoQualities to get a list of all available video qualities
       */
      onVideoAdaptation?: (data: { suggested: string }) => string;
      /**
       * A callback function to customize the player's adaptation logic that is called before the player tries to
       * download a new audio segment.
       * @param data An object carrying the <code>suggested</code> attribute, holding the suggested
       *   representation/quality ID the player would select
       * @return A valid representation/quality ID which the player should use, based on your custom logic (or
       *   <code>data.suggested</code> to switch to the suggested quality)
       * @see PlayerAPI#getAvailableAudioQualities to get a list of all available audio qualities
       */
      onAudioAdaptation?: (data: { suggested: string }) => string;
    }

    /**
     * Adaptation configurations for different platforms.
     */
    interface AdaptationPlatformConfig {
      desktop?: AdaptationConfig;
      mobile?: AdaptationConfig;
    }

    interface AdvertisingScheduleItem {
      /**
       * Specifies which ad client to use, like e.g., VAST or VPAID.
       */
      client?: string;
      /**
       * Defines when the ad shall be played. Supports the same values as {@link AdvertisingConfig#offset}.
       */
      offset: string;
      /**
       * Defines the path to the ad manifest.
       */
      tag: string;
    }

    interface AdvertisingConfig {
      /**
       * Mandatory. Specifies which ad client to use, like e.g., VAST or VPAID.
       */
      client: string;
      /**
       * Specifies the time in seconds, how much the VAST tag is loaded prior to the ad playback. By default
       * the VAST tag is loaded at player startup.
       */
      adCallOffset?: number;
      /**
       * Defines a custom message that will be displayed to the user instead of the progress bar during
       * ad playback. The predefined placeholder xx can be used to show the remaining seconds of the ad.
       */
      admessage?: string;
      /**
       * Defines a custom message that will be displayed to the user as a skip button.
       */
      skipmessage?: SkipMessage;
      /**
       * Specifies that cookies are send along with the ad request. The server needs to explicitly accept
       * them for CORS requests, otherwise the request will fail.
       */
      withCredentials?: boolean;
      /**
       * Defines the path to an ad manifest. Can be used to schedule a single ad without setting the {@link #schedule}
       * property, that will be played at the time defined in the {@link #offset} property.
       * It will be played as pre-roll add by default if no offset is set, or when as schedule with additional ads
       * is provided.
       */
      tag?: string;
      /**
       * Defines when the ad shall be played.
       *
       * Allowed values are:
       * - 'pre': pre-roll ad
       * - 'post': post-roll ad
       * - fractional seconds: '10', '12.5' (mid-roll ad)
       * - percentage of the entire video duration: '25%', '50%' (mid-roll ad)
       * - timecode [hh:mm:ss.mmm]: '00:10:30.000', '01:00:00.000' (mid-roll ad)
       */
      offset?: string;
      /**
       * Contains one or more ad breaks. Each ad break defines when an ad shall be played and must contain
       * an offset and a tag property.
       */
      schedule?: { [name: string]: AdvertisingScheduleItem; };
      /**
       * If set to true, mid-roll ads are only played during normal playback. Seeking to a time after the
       * mid-roll ads doesn't trigger ad playback.
       * @since 7.1
       */
      allowSeekingOverMidRollAds?: boolean;
    }

    interface LocationConfig {
      /**
       * Specifies the path, relative or absolute, to the file containing the Flash based player.
       * Default name: bitmovinplayer.swf
       */
      flash?: string;
      /**
       * Specifies the path, relative or absolute, to the file needed for VR and 360º video playback.
       * Default name: bitmovinplayer-vr.js
       */
      vr?: string;
      /**
       * Specifies the path, relative or absolute, to the UI/skin.
       * Default name: bitmovinplayer-ui.js
       */
      ui?: string;
      /**
       * Specifies the path, relative or absolute, to the style sheet of the UI/skin.
       * Default name: bitmovinplayer-ui.css
       */
      ui_css?: string;
    }

    interface LogConfig {
      /**
       * Enable or disable the bitmovin credits in the browser’s console. Defaults to true (enable).
       */
      bitmovin?: boolean;
      /**
       * Logging level.
       */
      level?: string;
    }

    interface LicensingConfig {
      /**
       * Can be used to set the delay (in milliseconds) until the licensing call is issued.
       * Maximum value is 30000 (30 seconds).
       */
      delay?: number;
    }

    /**
     * Values the `HttpRequestType` property can have in the network API config callbacks.
     */
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

    /**
     * Allowed types of the {@link HttpRequest.body}
     */
    type HttpRequestBody = ArrayBuffer | ArrayBufferView | Blob | FormData | string | Document | URLSearchParams;

    /**
     * Possible types of {@link HttpResponse.body}
     */
    type HttpResponseBody = string | ArrayBuffer | Blob | Object | Document;

    /**
     * Allowed HTTP request method
     */
    enum HttpRequestMethod {
      GET,
      POST,
      HEAD,
    }

    interface HttpRequest {
      /**
       * HTTP method of the request
       */
      method: HttpRequestMethod;
      /**
       * URL of the request
       */
      url: string;
      /**
       * Headers of this request
       */
      headers: Header[];
      /**
       * Request body to send to the server (optional).
       */
      body?: HttpRequestBody;
      /**
       * Type we expect the {@link HttpResponse.body} to be.
       */
      responseType: HttpResponseType;
      /**
       * The credentials property as used in the `fetch` API and mapped to the `XmlHttpRequest` as follows:
       * <pre>
       * 'include' ... withCredentials = true
       * 'omit'    ... withCredentials = false
       * </pre>
       */
      credentials: 'omit' | 'same-origin' | 'include';
    }

    interface HttpResponse<ResponseBody extends HttpResponseBody> {
      /**
       * Corresponding request object of this response
       */
      request: HttpRequest;
      /**
       * URL of the actual request. May differ from {@link HttpRequest.url} when redirects have happened.
       */
      url: string;
      /**
       * Headers of the response.
       */
      headers: Header[];
      /**
       * HTTP status code
       */
      status: number;
      /**
       * Status text provided by the server or default value if not present in response.
       */
      statusText: string;
      /**
       * Body of the response with type defined by {@link HttpRequest.responseType} (optional).
       */
      body?: ResponseBody;
      /**
       * Amount of bytes of the response body (optional).
       */
      length?: number;
    }

    interface HttpResponseTiming {
      /**
       * The timestamp at which the request was opened.
       */
      openedTimestamp?: number;
      /**
       * The timestamp at which the headers where received.
       */
      headersReceivedTimestamp?: number;
      /**
       * The timestamp of the current progress event.
       */
      progressTimestamp?: number;
      /**
       * The timestamp at which the request was finished.
       */
      doneTimestamp?: number;
    }

    interface RequestProgress {
      loadedBytes: number;
      totalBytes: number;
      responseTiming?: HttpResponseTiming;
    }

    /**
     * This interfaces needs to be implemented and returned by {@link NetworkConfig.sendHttpRequest} and can be used
     * to implement custom network request implementations. The default implementation of the player uses
     * `XMLHttpRequest`.
     */
    interface RequestController<T> {
      /**
       * Is called by the player if it wants to cancel the current request (e.g. on seek)
       */
      cancel(): void;

      /**
       * Provides the data transfer progress to the player (if available).
       * @param {(requestProgress: RequestProgress) => void} listener
       */
      setProgressListener(listener: (requestProgress: RequestProgress) => void): void;

      /**
       * Returns a Promise that resolves with the actual {@link HttpResponse}
       * @returns {Promise<HttpResponse<T>>}
       */
      getResponse(): Promise<HttpResponse<T>>;
    }

    interface NetworkConfig {
      preprocessHttpRequest?: (type: HttpRequestType, request: HttpRequest) => Promise<HttpRequest>;
      sendHttpRequest?: <T extends HttpResponseBody>(type: HttpRequestType,
                                                     request: HttpRequest) => RequestController<T>;
      retryHttpRequest?: <T extends HttpResponseBody>(type: HttpRequestType, response: HttpResponse<T>, retry: number) =>
        Promise<HttpRequest>;
      preprocessHttpResponse?: <T extends HttpResponseBody>(type: HttpRequestType, response: HttpResponse<T>) =>
        Promise<HttpResponse<T>>;
    }

    interface Config {
      /**
       * Mandatory. A personal key can be found in the bitmovin portal and should be specified here as string.
       * Do not forget to enter all your domains (subdomains are included) in your account.
       */
      key?: string;
      /**
       * Mandatory. Contains information to the video source, e.g. dash, hls, progressive fallback.
       */
      source?: SourceConfig;
      /**
       * Playback config settings.
       */
      playback?: PlaybackConfig;
      /**
       * UX/UI config settings.
       */
      style?: StyleConfig;
      /**
       * A list of callback functions for events.
       */
      events?: { [event: string]: PlayerEventCallback; };
      /**
       * Tweaks. Use these values only if you know what you are doing.
       */
      tweaks?: TweaksConfig;
      /**
       * Google Cast configuration.
       */
      cast?: CastConfig;
      /**
       * Configures the adaptation logic.
       */
      adaptation?: AdaptationPlatformConfig;
      /**
       * Allows you to define which ads you want to display and when you want to display them.
       * In order to play ads on your website, you need to specify an ad config.
       */
      advertising?: AdvertisingConfig;
      /**
       * This can be used to specify custom paths to bitmovinplayer.swf, bitmovinplayer-core.min.js,
       * and bitmovinplayer-core.min.css instead of having all files in the same folder.
       */
      location?: LocationConfig;
      /**
       * Can be use to fine tune logging of the player.
       */
      logs?: LogConfig;
      /**
       * Licensing configuration.
       */
      licensing?: LicensingConfig;
      /**
       * Network configuration.
       */
      network?: NetworkConfig;
    }
  }
}