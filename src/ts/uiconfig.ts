import { ErrorMessageMap, ErrorMessageTranslator } from './components/errormessageoverlay';

/**
 * @category Configs
 */
export interface UIRecommendationConfig {
  title: string;
  url: string;
  thumbnail?: string;
  duration?: number;
}

/**
 * Marks a position on the playback timeline, e.g. a chapter or an ad break.
 */
export interface TimelineMarker {
  /**
   * The time in the playback timeline (e.g. {@link SeekBar}) that should be marked.
   */
  time: number;
  /**
   * Optional duration that makes the marker mark an interval instead of a single moment in time.
   */
  duration?: number;
  /**
   * Optional title text of the marked position, e.g. a chapter name.
   * Will be rendered in the {@link SeekBarLabel} attached to a {@link SeekBar}.
   */
  title?: string;
  /**
   * Url to timeline marker image
   * Prefered small image sizes (~50px) with aspect ratio of 1:1
   * Best performing with SVG format
   */
  imageUrl?: string;
  /**
   * Optional CSS classes that are applied to the marker on a {@link SeekBar} and can be used to
   * differentiate different types of markers by their style (e.g. different color of chapter markers
   * and ad break markers).
   * The CSS classes are also propagated to a connected {@link SeekBarLabel}.
   *
   * Multiple classes can be added to allow grouping of markers into types (e.g. chapter markers,
   * ad break markers) by a shared class and still identify and style each marker with distinct
   * classes (e.g. `['marker-type-chapter', 'chapter-number-1']`).
   */
  cssClasses?: string[];
}

/**
 * @category Configs
 */
export interface UIConfig {
  /**
   * Specifies the container in the DOM into which the UI will be added. Can be a CSS selector string or a
   * HTMLElement object. By default, the player container will be used ({@link PlayerAPI#getContainer}).
   */
  container?: string | HTMLElement;
  metadata?: {
    title?: string;
    description?: string;
    markers?: TimelineMarker[];
  };
  // TODO move recommendations into metadata in next major release
  recommendations?: UIRecommendationConfig[];
  /**
   * Specifies if the UI variants should be resolved and switched automatically upon certain player events. The default
   * is `true`. Should be set to `false` if purely manual switching through {@link UIManager.resolveUiVariant} is
   * desired. A hybrid approach can be used by setting this to `true` (or leaving the default) and overriding
   * automatic switches through a {@link UIManager.onUiVariantResolve} event handler.
   */
  autoUiVariantResolve?: boolean;
  /**
   * Specifies if the `PlaybackSpeedSelectBox` should be displayed within the `SettingsPanel`
   * Default: true
   */
  playbackSpeedSelectionEnabled?: boolean;
  /**
   * Specifies if the player controls including `SettingsPanel` should auto hide when still hovered. This
   * configuration does not apply to devices using a touch screen. On touch screen devices the `SettingsPanel`
   * is by default configured to not auto-hide and the behaviour cannot be changed using this configuration.
   * Default: false
   */
  disableAutoHideWhenHovered?: boolean;
  /**
   * Whether the play head should snap to markers on the seek bar when seeking sufficiently near them.
   *
   * The related config option `seekbarSnappingRange` defines the tolerance that is used to determine whether a seek
   * time hits a marker.
   *
   * Note:
   * - When hitting a point marker (i.e. one without duration), the play head would snap to the exact time of the
   *   marker.
   * - Likewise, when hitting a range marker (i.e. one with duration) which effectively snaps to the start of the time
   *   range that it defines.
   *
   * Default: true
   */
  seekbarSnappingEnabled?: boolean;
  /**
   * Specifies the seek bar marker snapping tolerance in percent. This option has no effect if `seekbarSnappingEnabled`
   * is set to false.
   * Default: 1
   */
  seekbarSnappingRange?: number;
  /**
   * Provide customized errorMessages
   * For an example have a look at {@link ErrorMessageOverlayConfig.messages}
   */
  errorMessages?: ErrorMessageMap | ErrorMessageTranslator;
  /**
   * Toggles the seek preview feature.
   * Default: true
   */
  enableSeekPreview?: boolean;
  /**
   * Specifies if the player should enter fullscreen by clicking on the `PlaybackToggleButton`,
   * `HugePlaybackToggleButton`, or `PlaybackToggleOverlay` when attempting the initial playback start.
   * Default: false
   */
  enterFullscreenOnInitialPlayback?: boolean;
  /**
   * Forces subtitle-labels back into their respective container if they overflow and are therefore cropped.
   */
  forceSubtitlesIntoViewContainer?: boolean;

  /**
   * If set to true, prevents the UI from using `localStorage`.
   */
  disableStorageApi?: boolean;
  /**
   * Specifies if the `EcoModeToggleButton` should be displayed within the `SettingsPanel`
   */
  ecoMode?: boolean;
}
