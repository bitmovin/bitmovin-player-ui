export const version: string = '{{VERSION}}';
// Management
export * from './UIManager';
export * from './UIConfig';
// Factories
export { UIFactory } from './UIFactory';
// Utils
export { ArrayUtils } from './utils/ArrayUtils';
export { StringUtils } from './utils/StringUtils';
export { PlayerUtils } from './utils/PlayerUtils';
export { UIUtils } from './utils/UIUtils';
export { BrowserUtils } from './utils/BrowserUtils';
export { StorageUtils } from './utils/StorageUtils';
export { ErrorUtils } from './utils/ErrorUtils';
// Localization
export { i18n, I18n, Vocabulary, Vocabularies, CustomVocabulary, LocalizableText, Localizer } from './localization/i18n';
// Spatial Navigation
export { SpatialNavigation } from './spatialnavigation/SpatialNavigation';
export { NavigationGroup } from './spatialnavigation/NavigationGroup';
export { RootNavigationGroup } from './spatialnavigation/RootNavigationGroup';
export { ListNavigationGroup, ListOrientation } from './spatialnavigation/ListNavigationGroup';
// Components
export { Button, ButtonConfig } from './components/buttons/Button';
export { ControlBar, ControlBarConfig } from './components/ControlBar';
export { FullscreenToggleButton } from './components/buttons/FullscreenToggleButton';
export { HugePlaybackToggleButton } from './components/buttons/HugePlaybackToggleButton';
export { PlaybackTimeLabel, PlaybackTimeLabelConfig, PlaybackTimeLabelMode } from './components/labels/PlaybackTimeLabel';
export { PlaybackToggleButton, PlaybackToggleButtonConfig } from './components/buttons/PlaybackToggleButton';
export { SeekBar, SeekBarConfig, SeekPreviewEventArgs, SeekBarMarker } from './components/seekbar/SeekBar';
export { SelectBox } from './components/settings/SelectBox';
export { ItemSelectionList } from './components/lists/ItemSelectionList';
export { SettingsPanel, SettingsPanelConfig } from './components/settings/SettingsPanel';
export { SettingsToggleButton, SettingsToggleButtonConfig } from './components/settings/SettingsToggleButton';
export { ToggleButton, ToggleButtonConfig } from './components/buttons/ToggleButton';
export { VideoQualitySelectBox } from './components/settings/VideoQualitySelectBox';
export { VolumeToggleButton } from './components/buttons/VolumeToggleButton';
export { VRToggleButton } from './components/buttons/VRToggleButton';
export { Watermark, WatermarkConfig } from './components/Watermark';
export { UIContainer, UIContainerConfig } from './components/UIContainer';
export { Container, ContainerConfig } from './components/Container';
export { Label, LabelConfig } from './components/labels/Label';
export { AudioQualitySelectBox } from './components/settings/AudioQualitySelectBox';
export { AudioTrackSelectBox } from './components/settings/AudioTrackSelectBox';
export { CastStatusOverlay } from './components/overlays/CastStatusOverlay';
export { CastToggleButton } from './components/buttons/CastToggleButton';
export { Component, ComponentConfig, ComponentHoverChangedEventArgs } from './components/Component';
export { ErrorMessageOverlay, ErrorMessageOverlayConfig, ErrorMessageTranslator, ErrorMessageMap } from './components/overlays/ErrorMessageOverlay';
export { RecommendationOverlay } from './components/overlays/RecommendationOverlay';
export { SeekBarLabel, SeekBarLabelConfig } from './components/seekbar/SeekBarLabel';
export { SubtitleOverlay } from './components/overlays/SubtitleOverlay';
export { SubtitleSelectBox } from './components/settings/SubtitleSelectBox';
export { TitleBar, TitleBarConfig } from './components/TitleBar';
export { VolumeControlButton, VolumeControlButtonConfig } from './components/buttons/VolumeControlButton';
export { ClickOverlay, ClickOverlayConfig } from './components/overlays/ClickOverlay';
export { AdSkipButton, AdSkipButtonConfig } from './components/ads/AdSkipButton';
export { AdMessageLabel } from './components/ads/AdMessageLabel';
export { AdClickOverlay } from './components/ads/AdClickOverlay';
export { PlaybackSpeedSelectBox } from './components/settings/PlaybackSpeedSelectBox';
export { HugeReplayButton } from './components/buttons/HugeReplayButton';
export { BufferingOverlay, BufferingOverlayConfig } from './components/overlays/BufferingOverlay';
export { CastUIContainer } from './components/CastUIContainer';
export { PlaybackToggleOverlay, PlaybackToggleOverlayConfig } from './components/overlays/PlaybackToggleOverlay';
export { CloseButton, CloseButtonConfig } from './components/buttons/CloseButton';
export { MetadataLabel, MetadataLabelContent, MetadataLabelConfig } from './components/labels/MetadataLabel';
export { AirPlayToggleButton } from './components/buttons/AirPlayToggleButton';
export { VolumeSlider, VolumeSliderConfig } from './components/seekbar/VolumeSlider';
export { PictureInPictureToggleButton } from './components/buttons/PictureInPictureToggleButton';
export { Spacer } from './components/Spacer';
export { BackgroundColorSelectBox } from './components/settings/subtitlesettings/BackgroundColorSelectBox';
export { BackgroundOpacitySelectBox } from './components/settings/subtitlesettings/BackgroundOpacitySelectBox';
export { CharacterEdgeSelectBox } from './components/settings/subtitlesettings/CharacterEdgeSelectBox';
export { FontColorSelectBox } from './components/settings/subtitlesettings/FontColorSelectBox';
export { FontFamilySelectBox } from './components/settings/subtitlesettings/FontFamilySelectBox';
export { FontOpacitySelectBox } from './components/settings/subtitlesettings/FontOpacitySelectBox';
export { FontSizeSelectBox } from './components/settings/subtitlesettings/FontSizeSelectBox';
export { SubtitleSettingSelectBox } from './components/settings/subtitlesettings/SubtitleSettingSelectBox';
export { WindowColorSelectBox } from './components/settings/subtitlesettings/WindowColorSelectBox';
export { WindowOpacitySelectBox } from './components/settings/subtitlesettings/WindowOpacitySelectBox';
export { SubtitleSettingsResetButton } from './components/settings/subtitlesettings/SubtitleSettingsResetButton';
export { ListBox } from './components/lists/ListBox';
export { SubtitleListBox } from './components/lists/SubtitleListBox';
export { AudioTrackListBox } from './components/lists/AudioTrackListBox';
export { SettingsPanelPage } from './components/settings/SettingsPanelPage';
export { SettingsPanelPageBackButton } from './components/settings/SettingsPanelPageBackButton';
export { SettingsPanelPageOpenButton } from './components/settings/SettingsPanelPageOpenButton';
export { SubtitleSettingsPanelPage, SubtitleSettingsPanelPageConfig } from './components/settings/subtitlesettings/SubtitleSettingsPanelPage';
export { SettingsPanelItem } from './components/settings/SettingsPanelItem';
export { ReplayButton } from './components/buttons/ReplayButton';
export { QuickSeekButton, QuickSeekButtonConfig } from './components/buttons/QuickSeekButton';
export { ListSelector, ListSelectorConfig, ListItem, ListItemFilter, ListItemLabelTranslator } from './components/lists/ListSelector';
export { AdStatusOverlay } from './components/ads/AdStatusOverlay';

// Object.assign polyfill for ES5/IE9
// https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
if (typeof Object.assign !== 'function') {
  Object.assign = function(target: any) {
    'use strict';
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    target = Object(target);
    for (let index = 1; index < arguments.length; index++) {
      let source = arguments[index];
      if (source != null) {
        for (let key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
    }
    return target;
  };
}
