import { ErrorMessageMap, ErrorMessageTranslator } from './components/errormessageoverlay';

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
   * Specifies the seekbar snapping range in percentage
   * Default: 1
   */
  seekbarSnappingRange?: number;
  /**
   * Provide customized errorMessages
   * For an example have a look at {@link ErrorMessageOverlayConfig.messages}
   */
  errorMessages?: ErrorMessageMap | ErrorMessageTranslator;
}
