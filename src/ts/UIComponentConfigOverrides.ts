import type { UIVariantIdentifier } from './UIManager';
import type { AdControlBarConfig } from './components/ads/AdControlBar';
import type { AdCounterLabelConfig } from './components/ads/AdCounterLabel';
import type { AdSkipButtonConfig } from './components/ads/AdSkipButton';
import type { ButtonConfig } from './components/buttons/Button';
import type { CloseButtonConfig } from './components/buttons/CloseButton';
import type { PlaybackToggleButtonConfig } from './components/buttons/PlaybackToggleButton';
import type { QuickSeekButtonConfig } from './components/buttons/QuickSeekButton';
import type { ToggleButtonConfig } from './components/buttons/ToggleButton';
import type { VolumeControlButtonConfig } from './components/buttons/VolumeControlButton';
import type { ComponentConfig } from './components/Component';
import type { ContainerConfig } from './components/Container';
import type { ContextMenuConfig } from './components/contextmenu/ContextMenu';
import type { InteractiveContextMenuItemConfig } from './components/contextmenu/InteractiveContextMenuItem';
import type { PlayerContextMenuConfig } from './components/contextmenu/PlayerContextMenu';
import type { ControlBarConfig } from './components/ControlBar';
import type { LabelConfig } from './components/labels/Label';
import type { MetadataLabelConfig } from './components/labels/MetadataLabel';
import type { PlaybackTimeLabelConfig } from './components/labels/PlaybackTimeLabel';
import type { AudioTrackListBoxConfig } from './components/lists/AudioTrackListBox';
import type { ListBoxConfig } from './components/lists/ListBox';
import type { ListSelectorConfig } from './components/lists/ListSelector';
import type { SubtitleListBoxConfig } from './components/lists/SubtitleListBox';
import type { BufferingOverlayConfig } from './components/overlays/BufferingOverlay';
import type { ClickOverlayConfig } from './components/overlays/ClickOverlay';
import type { DismissClickOverlayConfig } from './components/overlays/DismissClickOverlay';
import type { ErrorMessageOverlayConfig } from './components/overlays/ErrorMessageOverlay';
import type { PlaybackToggleOverlayConfig } from './components/overlays/PlaybackToggleOverlay';
import type { SubtitleOverlayConfig } from './components/overlays/SubtitleOverlay';
import type { TouchControlOverlayConfig } from './components/overlays/TouchControlOverlay';
import type { PlayerInsightsPanelConfig } from './components/panels/player-insights/PlayerInsightsPanel';
import type { RecommendationItemConfig } from './components/RecommendationItem';
import type { SeekBarConfig } from './components/seekbar/SeekBar';
import type { SeekBarLabelConfig } from './components/seekbar/SeekBarLabel';
import type { VolumeSliderConfig } from './components/seekbar/VolumeSlider';
import type { DynamicSettingsPanelItemConfig } from './components/settings/DynamicSettingsPanelItem';
import type { SettingsPanelConfig } from './components/settings/SettingsPanel';
import type { SettingsPanelItemConfig } from './components/settings/SettingsPanelItem';
import type { SettingsPanelPageConfig } from './components/settings/SettingsPanelPage';
import type { SettingsPanelPageNavigatorConfig } from './components/settings/SettingsPanelPageNavigatorButton';
import type { SettingsPanelSelectOptionConfig } from './components/settings/SettingsPanelSelectOption';
import type { SettingsPanelSeparatorConfig } from './components/settings/SettingsPanelSeparator';
import type { SettingsToggleButtonConfig } from './components/settings/SettingsToggleButton';
import type { SubtitleSettingSelectBoxConfig } from './components/settings/subtitlesettings/SubtitleSettingSelectBox';
import type { SubtitleSettingsPanelPageConfig } from './components/settings/subtitlesettings/SubtitleSettingsPanelPage';
import type { TitleBarConfig } from './components/TitleBar';
import type { UIContainerConfig } from './components/UIContainer';
import type { WatermarkConfig } from './components/Watermark';

/**
 * Component config overrides keyed by public component class name, optionally scoped by UI variant.
 *
 * Use UI variant keys to scope overrides to one layout. Use component class names to configure all instances of a
 * component. Base component keys also apply to subclasses, and more specific component keys override base component
 * config.
 *
 * Config precedence, from lowest to highest:
 * 1. Component superclass config
 * 2. Component default config
 * 3. Constructor config from the {@link UIFactory}
 * 4. Top-level base component config, e.g. `ToggleButton`
 * 5. Top-level specific component config, e.g. `FullscreenToggleButton`
 * 6. Variant-specific base component config, e.g. `main.ToggleButton`
 * 7. Variant-specific component config, e.g. `main.FullscreenToggleButton`
 *
 * @example
 * ```ts
 * const componentConfigOverrides: UIComponentConfigOverrides = {
 *   // Scoped by UI variants
 *   main: {
 *     // Any component class name can be used here.
 *     FullscreenToggleButton: {
 *       // Component specific config
 *     },
 *   },
 *   smallScreen: {
 *     // Variant-specific config overrides top-level component config.
 *     SeekBar: {
 *       // Component specific config
 *     },
 *   },
 *
 *   // Any component class name can also be configured globally.
 *   ToggleButton: {
 *     // Component specific config
 *   },
 *   SeekBar: {
 *     // Component specific config
 *   },
 * };
 * ```
 *
 * @category Configs
 */
export interface UIComponentConfigOverrides extends UIComponentConfigMap {
  /**
   * Component config overrides for the empty UI variant.
   *
   * @category UI variants
   */
  [UIVariantIdentifier.empty]?: UIComponentConfigMap;
  /**
   * Component config overrides for the ads UI variant.
   *
   * @category UI variants
   */
  [UIVariantIdentifier.ads]?: UIComponentConfigMap;
  /**
   * Component config overrides for the small-screen UI variant.
   *
   * @category UI variants
   */
  [UIVariantIdentifier.smallScreen]?: UIComponentConfigMap;
  /**
   * Component config overrides for the small-screen ads UI variant.
   *
   * @category UI variants
   */
  [UIVariantIdentifier.smallScreenAds]?: UIComponentConfigMap;
  /**
   * Component config overrides for the TV UI variant.
   *
   * @category UI variants
   */
  [UIVariantIdentifier.tv]?: UIComponentConfigMap;
  /**
   * Component config overrides for the TV ads UI variant.
   *
   * @category UI variants
   */
  [UIVariantIdentifier.tvAds]?: UIComponentConfigMap;
  /**
   * Component config overrides for the main UI variant.
   *
   * @category UI variants
   */
  [UIVariantIdentifier.main]?: UIComponentConfigMap;
  /**
   * Component config overrides for the subtitle UI variant.
   *
   * @category UI variants
   */
  [UIVariantIdentifier.subtitle]?: UIComponentConfigMap;
  /**
   * Component config overrides for the castReceiver UI variant.
   *
   * @category UI variants
   */
  [UIVariantIdentifier.castReceiver]?: UIComponentConfigMap;
}

/**
 * Component config overrides keyed by public component class name.
 *
 * Each property matches a public component class name. The value type is the component-specific constructor config.
 *
 * @category Configs
 */
// Keep this map in sync with public component exports from main.ts.
export interface UIComponentConfigMap {
  /**
   * @category Components
   */
  AdClickOverlay?: Partial<ClickOverlayConfig>;
  /**
   * @category Components
   */
  AdControlBar?: Partial<AdControlBarConfig>;
  /**
   * @category Components
   */
  AdCounterLabel?: Partial<AdCounterLabelConfig>;
  /**
   * @category Components
   */
  AdMessageLabel?: Partial<LabelConfig>;
  /**
   * @category Components
   */
  AdSkipButton?: Partial<AdSkipButtonConfig>;
  /**
   * @category Components
   */
  AdStatusOverlay?: Partial<ContainerConfig>;
  /**
   * @category Components
   */
  AirPlayToggleButton?: Partial<ToggleButtonConfig>;
  /**
   * @category Components
   */
  AudioQualitySelectBox?: Partial<ListSelectorConfig>;
  /**
   * @category Components
   */
  AudioTrackListBox?: Partial<AudioTrackListBoxConfig>;
  /**
   * @category Components
   */
  AudioTrackSelectBox?: Partial<ListSelectorConfig>;
  /**
   * @category Components
   */
  BackgroundColorSelectBox?: Partial<SubtitleSettingSelectBoxConfig>;
  /**
   * @category Components
   */
  BackgroundOpacitySelectBox?: Partial<SubtitleSettingSelectBoxConfig>;
  /**
   * @category Components
   */
  BufferingOverlay?: Partial<BufferingOverlayConfig>;
  /**
   * @category Components
   */
  Button?: Partial<ButtonConfig>;
  /**
   * @category Components
   */
  CastStatusOverlay?: Partial<ContainerConfig>;
  /**
   * @category Components
   */
  CastToggleButton?: Partial<ToggleButtonConfig>;
  /**
   * @category Components
   */
  CastUIContainer?: Partial<UIContainerConfig>;
  /**
   * @category Components
   */
  CharacterEdgeColorSelectBox?: Partial<SubtitleSettingSelectBoxConfig>;
  /**
   * @category Components
   */
  CharacterEdgeSelectBox?: Partial<SubtitleSettingSelectBoxConfig>;
  /**
   * @category Components
   */
  ClickOverlay?: Partial<ClickOverlayConfig>;
  /**
   * @category Components
   */
  CloseButton?: Partial<CloseButtonConfig>;
  /**
   * @category Components
   */
  Component?: Partial<ComponentConfig>;
  /**
   * @category Components
   */
  Container?: Partial<ContainerConfig>;
  /**
   * @category Components
   */
  ContextMenu?: Partial<ContextMenuConfig>;
  /**
   * @category Components
   */
  ControlBar?: Partial<ControlBarConfig>;
  /**
   * @category Components
   */
  DismissClickOverlay?: Partial<DismissClickOverlayConfig>;
  /**
   * @category Components
   */
  DynamicSettingsPanelItem?: Partial<DynamicSettingsPanelItemConfig>;
  /**
   * @category Components
   */
  EcoModeContainer?: Partial<ContainerConfig>;
  /**
   * @category Components
   */
  EcoModeToggleButton?: Partial<ToggleButtonConfig>;
  /**
   * @category Components
   */
  ErrorMessageOverlay?: Partial<ErrorMessageOverlayConfig>;
  /**
   * @category Components
   */
  FontColorSelectBox?: Partial<SubtitleSettingSelectBoxConfig>;
  /**
   * @category Components
   */
  FontFamilySelectBox?: Partial<SubtitleSettingSelectBoxConfig>;
  /**
   * @category Components
   */
  FontOpacitySelectBox?: Partial<SubtitleSettingSelectBoxConfig>;
  /**
   * @category Components
   */
  FontSizeSelectBox?: Partial<SubtitleSettingSelectBoxConfig>;
  /**
   * @category Components
   */
  FontStyleSelectBox?: Partial<SubtitleSettingSelectBoxConfig>;
  /**
   * @category Components
   */
  FullscreenToggleButton?: Partial<ToggleButtonConfig>;
  /**
   * @category Components
   */
  HugePlaybackToggleButton?: Partial<PlaybackToggleButtonConfig>;
  /**
   * @category Components
   */
  HugeReplayButton?: Partial<ButtonConfig>;
  /**
   * @category Components
   */
  Icon?: Partial<ComponentConfig>;
  /**
   * @category Components
   */
  InteractiveContextMenuItem?: Partial<InteractiveContextMenuItemConfig>;
  /**
   * @category Components
   */
  InteractiveSettingsPanelItem?: Partial<SettingsPanelItemConfig>;
  /**
   * @category Components
   */
  ItemSelectionList?: Partial<ListSelectorConfig>;
  /**
   * @category Components
   */
  Label?: Partial<LabelConfig>;
  /**
   * @category Components
   */
  ListBox?: Partial<ListBoxConfig>;
  /**
   * @category Components
   */
  ListSelector?: Partial<ListSelectorConfig>;
  /**
   * @category Components
   */
  MetadataLabel?: Partial<MetadataLabelConfig>;
  /**
   * @category Components
   */
  PictureInPictureToggleButton?: Partial<ToggleButtonConfig>;
  /**
   * @category Components
   */
  PlayerContextMenu?: Partial<PlayerContextMenuConfig>;
  /**
   * @category Components
   */
  PlaybackSpeedSelectBox?: Partial<ListSelectorConfig>;
  /**
   * @category Components
   */
  PlaybackTimeLabel?: Partial<PlaybackTimeLabelConfig>;
  /**
   * @category Components
   */
  PlaybackToggleButton?: Partial<PlaybackToggleButtonConfig>;
  /**
   * @category Components
   */
  PlaybackToggleOverlay?: Partial<PlaybackToggleOverlayConfig>;
  /**
   * @category Components
   */
  PlayerInsightsPanel?: Partial<PlayerInsightsPanelConfig>;
  /**
   * @category Components
   */
  QuickSeekButton?: Partial<QuickSeekButtonConfig>;
  /**
   * @category Components
   */
  RecommendationItem?: Partial<RecommendationItemConfig>;
  /**
   * @category Components
   */
  RecommendationOverlay?: Partial<ContainerConfig>;
  /**
   * @category Components
   */
  ReplayButton?: Partial<ButtonConfig>;
  /**
   * @category Components
   */
  SeekBar?: Partial<SeekBarConfig>;
  /**
   * @category Components
   */
  SeekBarLabel?: Partial<SeekBarLabelConfig>;
  /**
   * @category Components
   */
  SelectBox?: Partial<ListSelectorConfig>;
  /**
   * @category Components
   */
  SettingsPanel?: Partial<SettingsPanelConfig>;
  /**
   * @category Components
   */
  SettingsPanelItem?: Partial<SettingsPanelItemConfig>;
  /**
   * @category Components
   */
  SettingsPanelPage?: Partial<SettingsPanelPageConfig>;
  /**
   * @category Components
   */
  SettingsPanelPageBackButton?: Partial<SettingsPanelPageNavigatorConfig>;
  /**
   * @category Components
   */
  SettingsPanelPageNavigatorButton?: Partial<SettingsPanelPageNavigatorConfig>;
  /**
   * @category Components
   */
  SettingsPanelPageOpenButton?: Partial<SettingsPanelPageNavigatorConfig>;
  /**
   * @category Components
   */
  SettingsPanelSelectOption?: Partial<SettingsPanelSelectOptionConfig>;
  /**
   * @category Components
   */
  SettingsPanelSeparator?: Partial<SettingsPanelSeparatorConfig>;
  /**
   * @category Components
   */
  SettingsToggleButton?: Partial<SettingsToggleButtonConfig>;
  /**
   * @category Components
   */
  SmallCenteredPlaybackToggleButton?: Partial<PlaybackToggleButtonConfig>;
  /**
   * @category Components
   */
  Spacer?: Partial<ComponentConfig>;
  /**
   * @category Components
   */
  SubtitleListBox?: Partial<SubtitleListBoxConfig>;
  /**
   * @category Components
   */
  SubtitleOverlay?: Partial<SubtitleOverlayConfig>;
  /**
   * @category Components
   */
  SubtitleSelectBox?: Partial<ListSelectorConfig>;
  /**
   * @category Components
   */
  SubtitleSettingSelectBox?: Partial<SubtitleSettingSelectBoxConfig>;
  /**
   * @category Components
   */
  SubtitleSettingsPanelPage?: Partial<SubtitleSettingsPanelPageConfig>;
  /**
   * @category Components
   */
  SubtitleSettingsResetButton?: Partial<ButtonConfig>;
  /**
   * @category Components
   */
  TitleBar?: Partial<TitleBarConfig>;
  /**
   * @category Components
   */
  ToggleButton?: Partial<ToggleButtonConfig>;
  /**
   * @category Components
   */
  TouchControlOverlay?: Partial<TouchControlOverlayConfig>;
  /**
   * @category Components
   */
  TvNoiseCanvas?: Partial<ComponentConfig>;
  /**
   * @category Components
   */
  UIContainer?: Partial<UIContainerConfig>;
  /**
   * @category Components
   */
  VideoQualitySelectBox?: Partial<ListSelectorConfig>;
  /**
   * @category Components
   */
  VolumeControlButton?: Partial<VolumeControlButtonConfig>;
  /**
   * @category Components
   */
  VolumeSlider?: Partial<VolumeSliderConfig>;
  /**
   * @category Components
   */
  VolumeToggleButton?: Partial<ToggleButtonConfig>;
  /**
   * @category Components
   */
  VRToggleButton?: Partial<ToggleButtonConfig>;
  /**
   * @category Components
   */
  Watermark?: Partial<WatermarkConfig>;
  /**
   * @category Components
   */
  WindowColorSelectBox?: Partial<SubtitleSettingSelectBoxConfig>;
  /**
   * @category Components
   */
  WindowOpacitySelectBox?: Partial<SubtitleSettingSelectBoxConfig>;
}
