import type { UIVariantIdentifier } from './UIManager';

export enum UIComponentLayoutOverride {
  Include = 'include',
  Exclude = 'exclude',
}

/**
 * Component layout overrides keyed by public component class name, optionally scoped by UI variant.
 *
 * Overrides are only applied to UI variants with a {@link UIVariantIdentifier}. Top-level entries apply to all
 * identified UI variants. Variant-scoped entries override top-level entries for the matching variant.
 *
 * Base component keys also apply to subclasses, and more specific component keys override base component keys. For
 * example, `ToggleButton` applies to `FullscreenToggleButton`, unless `FullscreenToggleButton` has its own override.
 *
 * Default component layout overrides for identified variants:
 * ```ts
 * componentLayoutOverrides: {
 *   EcoModeContainer: UIComponentLayoutOverride.Exclude,
 *   QuickSeekButton: UIComponentLayoutOverride.Exclude,
 *   Watermark: UIComponentLayoutOverride.Exclude,
 * }
 * ```
 *
 * @example
 * ```ts
 * componentLayoutOverrides: {
 *   FullscreenToggleButton: UIComponentLayoutOverride.Exclude,
 *
 *   [UIVariantIdentifier.main]: {
 *     FullscreenToggleButton: UIComponentLayoutOverride.Include,
 *     Watermark: UIComponentLayoutOverride.Include,
 *   },
 * }
 * ```
 *
 * @category Configs
 */
export interface UIComponentLayoutOverrides extends UIComponentLayoutOverrideMap {
  /**
   * Component layout overrides for the empty UI variant.
   *
   * @category UI variants
   */
  [UIVariantIdentifier.empty]?: UIComponentLayoutOverrideMap;
  /**
   * Component layout overrides for the ads UI variant.
   *
   * @category UI variants
   */
  [UIVariantIdentifier.ads]?: UIComponentLayoutOverrideMap;
  /**
   * Component layout overrides for the small-screen UI variant.
   *
   * @category UI variants
   */
  [UIVariantIdentifier.smallScreen]?: UIComponentLayoutOverrideMap;
  /**
   * Component layout overrides for the small-screen ads UI variant.
   *
   * @category UI variants
   */
  [UIVariantIdentifier.smallScreenAds]?: UIComponentLayoutOverrideMap;
  /**
   * Component layout overrides for the TV UI variant.
   *
   * @category UI variants
   */
  [UIVariantIdentifier.tv]?: UIComponentLayoutOverrideMap;
  /**
   * Component layout overrides for the TV ads UI variant.
   *
   * @category UI variants
   */
  [UIVariantIdentifier.tvAds]?: UIComponentLayoutOverrideMap;
  /**
   * Component layout overrides for the main UI variant.
   *
   * @category UI variants
   */
  [UIVariantIdentifier.main]?: UIComponentLayoutOverrideMap;
  /**
   * Component layout overrides for the subtitle UI variant.
   *
   * @category UI variants
   */
  [UIVariantIdentifier.subtitle]?: UIComponentLayoutOverrideMap;
  /**
   * Component layout overrides for the castReceiver UI variant.
   *
   * @category UI variants
   */
  [UIVariantIdentifier.castReceiver]?: UIComponentLayoutOverrideMap;
}

/**
 * Component layout overrides keyed by public component class name.
 *
 * Each property matches a public component class name. The value controls whether default layouts keep or remove
 * matching component instances. Base component keys apply to subclasses, and more specific component keys override base
 * component keys.
 *
 * @category Configs
 */
// Keep this map in sync with UIComponentConfigMap from UIComponentConfigOverrides.ts.
export interface UIComponentLayoutOverrideMap {
  /**
   * @category Components
   */
  AdClickOverlay?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  AdControlBar?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  AdCounterLabel?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  AdMessageLabel?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  AdSkipButton?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  AdStatusOverlay?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  AirPlayToggleButton?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  AudioQualitySelectBox?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  AudioTrackListBox?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  AudioTrackSelectBox?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  BackgroundColorSelectBox?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  BackgroundOpacitySelectBox?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  BufferingOverlay?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  Button?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  CastStatusOverlay?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  CastToggleButton?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  CastUIContainer?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  CharacterEdgeColorSelectBox?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  CharacterEdgeSelectBox?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  ClickOverlay?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  CloseButton?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  Component?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  Container?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  ContextMenu?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  ControlBar?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  DismissClickOverlay?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  DynamicSettingsPanelItem?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  EcoModeContainer?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  EcoModeToggleButton?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  ErrorMessageOverlay?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  FontColorSelectBox?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  FontFamilySelectBox?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  FontOpacitySelectBox?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  FontSizeSelectBox?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  FontStyleSelectBox?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  FullscreenToggleButton?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  HugePlaybackToggleButton?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  HugeReplayButton?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  Icon?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  InteractiveContextMenuItem?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  InteractiveSettingsPanelItem?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  ItemSelectionList?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  Label?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  ListBox?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  ListSelector?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  MetadataLabel?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  PictureInPictureToggleButton?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  PersistentPreferencesToggleButton?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  PlayerContextMenu?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  PlaybackSpeedSelectBox?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  PlaybackTimeLabel?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  PlaybackToggleButton?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  PlaybackToggleOverlay?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  PlayerInsightsPanel?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  QuickSeekButton?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  RecommendationItem?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  RecommendationOverlay?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  ReplayButton?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  SeekBar?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  SeekBarLabel?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  SelectBox?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  SettingsPanel?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  SettingsPanelItem?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  SettingsPanelPage?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  SettingsPanelPageBackButton?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  SettingsPanelPageNavigatorButton?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  SettingsPanelPageOpenButton?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  SettingsPanelSelectOption?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  SettingsPanelSeparator?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  SettingsToggleButton?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  SmallCenteredPlaybackToggleButton?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  Spacer?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  SubtitleListBox?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  SubtitleOverlay?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  SubtitleSelectBox?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  SubtitleSettingSelectBox?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  SubtitleSettingsPanelPage?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  SubtitleSettingsResetButton?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  TitleBar?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  ToggleButton?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  ToggleSettingsPanelItem?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  TouchControlOverlay?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  TvNoiseCanvas?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  UIContainer?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  VideoQualitySelectBox?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  VolumeControlButton?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  VolumeSlider?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  VolumeToggleButton?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  VRToggleButton?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  Watermark?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  WindowColorSelectBox?: UIComponentLayoutOverride;
  /**
   * @category Components
   */
  WindowOpacitySelectBox?: UIComponentLayoutOverride;
}
