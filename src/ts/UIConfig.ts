import { ErrorMessageMap, ErrorMessageTranslator } from './components/overlays/ErrorMessageOverlay';
import { SourceConfig } from 'bitmovin-player';
import type { LocalizationConfig, UIVariantIdentifier } from './UIManager';
import type { UIComponentConfigOverrides } from './UIComponentConfigOverrides';
export type { UIComponentConfigMap, UIComponentConfigOverrides } from './UIComponentConfigOverrides';

/**
 * A link to an external recommended video that can be shown in the {@link RecommendationOverlay} after the
 * playback of the current video has ended.
 *
 * @category Configs
 */
export interface ExternalRecommendationLink {
  /**
   * The URL of the recommended video.
   */
  url: string;
  /**
   * A thumbnail image URL representing the recommended video.
   */
  thumbnail?: string;
}

/**
 * A configuration for a recommended video that can be shown in the {@link RecommendationOverlay} after the
 * playback of the current video has ended.
 *
 * @category Configs
 */
export interface RecommendationConfig {
  /**
   * The title of the recommended video.
   */
  title: string;
  /**
   * The recommendation item, either an external link or a source config that can be loaded into the player.
   * If a source config is provided:
   * - it will be loaded into the current player instance.
   * - the poster image of the source config will be used as thumbnail if available.
   */
  resource: ExternalRecommendationLink | SourceConfig;
  /**
   * An optional duration of the recommended video which will be displayed on the recommendation.
   */
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
  /**
   * Specifies UI metadata displayed or used by UI components.
   */
  metadata?: {
    /**
     * Title displayed by {@link MetadataLabel} components configured for title content.
     *
     * Values provided via the {@link SourceConfig} `title` override this value.
     */
    title?: string;
    /**
     * Description displayed by {@link MetadataLabel} components configured for description content.
     *
     * Values provided via the {@link SourceConfig} `description` override this value.
     */
    description?: string;
    /**
     * Timeline markers rendered on components such as the {@link SeekBar}.
     *
     * Values provided via the {@link SourceConfig} `markers` override this array.
     * Use {@link UIManager.addTimelineMarker} and {@link UIManager.removeTimelineMarker} to update timeline markers
     * after the UI has been initialized or a Source was loaded.
     */
    markers?: TimelineMarker[];
    /**
     * Recommendations displayed by the {@link RecommendationOverlay} after playback of the current source has ended.
     *
     * Values provided via the {@link SourceConfig} `recommendations` override this array.
     * Use {@link UIManager.recommendations} to update recommendations after the UI has been initialized or
     * a Source was loaded.
     */
    recommendations?: RecommendationConfig[];
  };
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
  /**
   * Specifies if the Watermark element should be included in the UI.
   * Per default, the Watermark shows the Bitmovin Logo.
   *
   * Default: false
   */
  includeWatermark?: boolean;
  /**
   * Configure Shadow DOM rendering.
   * Enable it with:
   * `shadowDom: true`
   * `shadowDom: { enabled: true }` (especially if you need to set more configuration options)
   *
   * Enable ShadowDom rendering to prevent CSS from an enclosing website to interfere with the UI styles. Check
   * the availability here: https://caniuse.com/shadowdomv1.
   *
   * Default: false
   */
  shadowDom?: ShadowDomConfig | boolean;
  /**
   * Allows setting a {@link LocalizationConfig} to specify language details of the UI.
   */
  localization?: LocalizationConfig;

  /**
   * The rendered player height threshold in pixels at or below which small-player adjustments are applied to
   * CEA-608 captions:
   *
   * 1. The caption overlay is constrained to a centered 80% safe area (proportional margins on all four sides),
   *    replacing the fixed `em`-based margins used at larger sizes.
   * 2. The controlbar pushup is disabled, keeping captions anchored to the safe area regardless of controlbar state.
   *
   * "Rendered height" refers to the actual on-screen height of the player DOM element in CSS pixels, not the
   * video resolution.
   *
   * At small player sizes fixed `em` margins take up a disproportionate share of the available space, and pushing
   * captions up when the controlbar appears can make them illegible. The 80% safe area and the suppressed pushup
   * together keep CEA-608 captions legible and correctly positioned at these sizes.
   *
   * Set to `0` to disable both adjustments for all player sizes (restoring the default large-player behaviour
   * everywhere).
   *
   * Default: `360`
   */
  cea608SmallPlayerHeightThreshold?: number;
  /**
   * Allows overriding component-specific config without building a custom UI layout through the UIFactory.
   * Component-specific config can be specified by the public component class name.
   *
   * Top-level entries apply to all UI variants. Entries nested under a {@link UIVariantIdentifier} only apply to that
   * variant and override top-level component config. Component keys can be any public component class that extends
   * {@link Component}. Base component keys also apply to subclasses, for example a `ToggleButton` config applies to
   * `FullscreenToggleButton`, `VolumeToggleButton`, and other toggle buttons unless a more specific component key
   * overrides it.
   *
   * @example
   * ```ts
   * componentConfigOverrides: {
   *   // Applies to all ToggleButton based components in all UI variants.
   *   ToggleButton: { buttonStyle: ButtonStyle.Text },
   *
   *   // Applies only to the main UI variant.
   *   main: {
   *     FullscreenToggleButton: { text: 'Main fullscreen' },
   *   },
   * }
   * ```
   */
  componentConfigOverrides?: UIComponentConfigOverrides;
}

export interface ShadowDomConfig {
  /**
   * Render the UI inside a Shadow DOM.
   * Enable this to keep player UI styles from being affected by host-page CSS and to keep the UI’s classes from
   * affecting the page.
   *
   * Default: false
   */
  enabled: boolean;
  /**
   * Filename or URL of the UI stylesheet to inject into the Shadow DOM.
   *
   * If a non-URL value is provided, the UI looks for a linked stylesheet whose `href` contains this
   * value and reuses it inside the shadow root so the default styling is available.
   *
   * If a URL is provided, the value is used as it is.
   *
   * Default: 'bitmovinplayer-ui'
   */
  uiStylesheet?: string;

  /**
   * Additional stylesheets to inject into the Shadow DOM (array of filenames/URLs).
   *
   * Use this to include custom UI styles when Shadow DOM is enabled.
   *
   * Default: undefined
   */
  additionalStylesheets?: string[];
}
