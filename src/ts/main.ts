export const version: string = '{{VERSION}}';
// Management
export * from './uimanager';
export * from './uiconfig';
// Factories
export { UIFactory } from './uifactory';
export { DemoFactory } from './demofactory';
// Utils
export { ArrayUtils } from './arrayutils';
export { StringUtils } from './stringutils';
export { PlayerUtils } from './playerutils';
export { UIUtils } from './uiutils';
export { BrowserUtils } from './browserutils';
export { StorageUtils } from './storageutils';
export { ErrorUtils } from './errorutils';
// Localization
export { i18n, I18n, Vocabulary, Vocabularies, CustomVocabulary, LocalizableText, Localizer } from './localization/i18n';
// Spatial Navigation
export { SpatialNavigation } from './spatialnavigation/spatialnavigation';
export { NavigationGroup } from './spatialnavigation/navigationgroup';
export { RootNavigationGroup } from './spatialnavigation/rootnavigationgroup';
export { ListNavigationGroup, ListOrientation } from './spatialnavigation/ListNavigationGroup';
// Components
export { Button, ButtonConfig } from './components/button';
export { ControlBar, ControlBarConfig } from './components/controlbar';
export { FullscreenToggleButton } from './components/fullscreentogglebutton';
export { HugePlaybackToggleButton } from './components/hugeplaybacktogglebutton';
export { PlaybackTimeLabel, PlaybackTimeLabelConfig, PlaybackTimeLabelMode } from './components/playbacktimelabel';
export { PlaybackToggleButton, PlaybackToggleButtonConfig } from './components/playbacktogglebutton';
export { SeekBar, SeekBarConfig, SeekPreviewEventArgs, SeekBarMarker } from './components/seekbar';
export { SelectBox } from './components/selectbox';
export { ItemSelectionList } from './components/itemselectionlist';
export { SettingsPanel, SettingsPanelConfig } from './components/settingspanel';
export { SettingsToggleButton, SettingsToggleButtonConfig } from './components/settingstogglebutton';
export { ToggleButton, ToggleButtonConfig } from './components/togglebutton';
export { VideoQualitySelectBox } from './components/videoqualityselectbox';
export { VolumeToggleButton } from './components/volumetogglebutton';
export { VRToggleButton } from './components/vrtogglebutton';
export { Watermark, WatermarkConfig } from './components/watermark';
export { UIContainer, UIContainerConfig } from './components/uicontainer';
export { Container, ContainerConfig } from './components/container';
export { Label, LabelConfig } from './components/label';
export { AudioQualitySelectBox } from './components/audioqualityselectbox';
export { AudioTrackSelectBox } from './components/audiotrackselectbox';
export { CastStatusOverlay } from './components/caststatusoverlay';
export { CastToggleButton } from './components/casttogglebutton';
export { Component, ComponentConfig, ComponentHoverChangedEventArgs } from './components/component';
export { ErrorMessageOverlay, ErrorMessageOverlayConfig, ErrorMessageTranslator, ErrorMessageMap } from './components/errormessageoverlay';
export { RecommendationOverlay } from './components/recommendationoverlay';
export { SeekBarLabel, SeekBarLabelConfig } from './components/seekbarlabel';
export { SubtitleOverlay } from './components/subtitleoverlay';
export { SubtitleSelectBox } from './components/subtitleselectbox';
export { TitleBar, TitleBarConfig } from './components/titlebar';
export { VolumeControlButton, VolumeControlButtonConfig } from './components/volumecontrolbutton';
export { ClickOverlay, ClickOverlayConfig } from './components/clickoverlay';
export { AdSkipButton, AdSkipButtonConfig } from './components/adskipbutton';
export { AdMessageLabel } from './components/admessagelabel';
export { AdClickOverlay } from './components/adclickoverlay';
export { PlaybackSpeedSelectBox } from './components/playbackspeedselectbox';
export { HugeReplayButton } from './components/hugereplaybutton';
export { BufferingOverlay, BufferingOverlayConfig } from './components/bufferingoverlay';
export { CastUIContainer } from './components/castuicontainer';
export { PlaybackToggleOverlay, PlaybackToggleOverlayConfig } from './components/playbacktoggleoverlay';
export { CloseButton, CloseButtonConfig } from './components/closebutton';
export { MetadataLabel, MetadataLabelContent, MetadataLabelConfig } from './components/metadatalabel';
export { AirPlayToggleButton } from './components/airplaytogglebutton';
export { VolumeSlider, VolumeSliderConfig } from './components/volumeslider';
export { PictureInPictureToggleButton } from './components/pictureinpicturetogglebutton';
export { Spacer } from './components/spacer';
export { BackgroundColorSelectBox } from './components/subtitlesettings/backgroundcolorselectbox';
export { BackgroundOpacitySelectBox } from './components/subtitlesettings/backgroundopacityselectbox';
export { CharacterEdgeSelectBox } from './components/subtitlesettings/characteredgeselectbox';
export { FontColorSelectBox } from './components/subtitlesettings/fontcolorselectbox';
export { FontFamilySelectBox } from './components/subtitlesettings/fontfamilyselectbox';
export { FontOpacitySelectBox } from './components/subtitlesettings/fontopacityselectbox';
export { FontSizeSelectBox } from './components/subtitlesettings/fontsizeselectbox';
export { SubtitleSettingSelectBox } from './components/subtitlesettings/subtitlesettingselectbox';
export { SubtitleSettingsLabel } from './components/subtitlesettings/subtitlesettingslabel';
export { WindowColorSelectBox } from './components/subtitlesettings/windowcolorselectbox';
export { WindowOpacitySelectBox } from './components/subtitlesettings/windowopacityselectbox';
export { SubtitleSettingsResetButton } from './components/subtitlesettings/subtitlesettingsresetbutton';
export { ListBox } from './components/listbox';
export { SubtitleListBox } from './components/subtitlelistbox';
export { AudioTrackListBox } from './components/audiotracklistbox';
export { SettingsPanelPage } from './components/settingspanelpage';
export { SettingsPanelPageBackButton } from './components/settingspanelpagebackbutton';
export { SettingsPanelPageOpenButton } from './components/settingspanelpageopenbutton';
export { SubtitleSettingsPanelPage, SubtitleSettingsPanelPageConfig } from './components/subtitlesettings/subtitlesettingspanelpage';
export { SettingsPanelItem } from './components/settingspanelitem';
export { ReplayButton } from './components/replaybutton';
export { QuickSeekButton, QuickSeekButtonConfig } from './components/quickseekbutton';
export { ListSelector, ListSelectorConfig, ListItem, ListItemFilter, ListItemLabelTranslator } from './components/listselector';

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
