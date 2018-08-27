/// <reference path='player.d.ts' />
import {UIManager, UIInstanceManager} from './uimanager';
import {Button} from './components/button';
import {ControlBar} from './components/controlbar';
import {FullscreenToggleButton} from './components/fullscreentogglebutton';
import {HugePlaybackToggleButton} from './components/hugeplaybacktogglebutton';
import {PlaybackTimeLabel, PlaybackTimeLabelMode} from './components/playbacktimelabel';
import {PlaybackToggleButton} from './components/playbacktogglebutton';
import {SeekBar} from './components/seekbar';
import {SelectBox} from './components/selectbox';
import {ItemSelectionList} from './components/itemselectionlist';
import {SettingsPanel, SettingsPanelItem} from './components/settingspanel';
import {SettingsToggleButton} from './components/settingstogglebutton';
import {ToggleButton} from './components/togglebutton';
import {VideoQualitySelectBox} from './components/videoqualityselectbox';
import {VolumeToggleButton} from './components/volumetogglebutton';
import {VRToggleButton} from './components/vrtogglebutton';
import {Watermark} from './components/watermark';
import {UIContainer} from './components/uicontainer';
import {Container} from './components/container';
import {Label} from './components/label';
import {AudioQualitySelectBox} from './components/audioqualityselectbox';
import {AudioTrackSelectBox} from './components/audiotrackselectbox';
import {CastStatusOverlay} from './components/caststatusoverlay';
import {CastToggleButton} from './components/casttogglebutton';
import {Component} from './components/component';
import {ErrorMessageOverlay} from './components/errormessageoverlay';
import {RecommendationOverlay} from './components/recommendationoverlay';
import {SeekBarLabel} from './components/seekbarlabel';
import {SubtitleOverlay} from './components/subtitleoverlay';
import {SubtitleSelectBox} from './components/subtitleselectbox';
import {TitleBar} from './components/titlebar';
import {VolumeControlButton} from './components/volumecontrolbutton';
import {ClickOverlay} from './components/clickoverlay';
import {AdSkipButton} from './components/adskipbutton';
import {AdMessageLabel} from './components/admessagelabel';
import {AdClickOverlay} from './components/adclickoverlay';
import {PlaybackSpeedSelectBox} from './components/playbackspeedselectbox';
import {HugeReplayButton} from './components/hugereplaybutton';
import {BufferingOverlay} from './components/bufferingoverlay';
import {CastUIContainer} from './components/castuicontainer';
import {PlaybackToggleOverlay} from './components/playbacktoggleoverlay';
import {CloseButton} from './components/closebutton';
import {MetadataLabel, MetadataLabelContent} from './components/metadatalabel';
import {AirPlayToggleButton} from './components/airplaytogglebutton';
import {VolumeSlider} from './components/volumeslider';
import {PictureInPictureToggleButton} from './components/pictureinpicturetogglebutton';
import {Spacer} from './components/spacer';
import {BackgroundColorSelectBox} from './components/subtitlesettings/backgroundcolorselectbox';
import {BackgroundOpacitySelectBox} from './components/subtitlesettings/backgroundopacityselectbox';
import {CharacterEdgeSelectBox} from './components/subtitlesettings/characteredgeselectbox';
import {FontColorSelectBox} from './components/subtitlesettings/fontcolorselectbox';
import {FontFamilySelectBox} from './components/subtitlesettings/fontfamilyselectbox';
import {FontOpacitySelectBox} from './components/subtitlesettings/fontopacityselectbox';
import {FontSizeSelectBox} from './components/subtitlesettings/fontsizeselectbox';
import {SubtitleSettingsButton} from './components/subtitlesettings/subtitlesettingsbutton';
import {SubtitleSettingsCloseButton} from './components/subtitlesettings/subtitlesettingsclosebutton';
import {SubtitleSettingSelectBox} from './components/subtitlesettings/subtitlesettingselectbox';
import {SubtitleSettingsLabel} from './components/subtitlesettings/subtitlesettingslabel';
import {SubtitleSettingsOpenButton} from './components/subtitlesettings/subtitlesettingsopenbutton';
import {SubtitleSettingsPanel} from './components/subtitlesettings/subtitlesettingspanel';
import {WindowColorSelectBox} from './components/subtitlesettings/windowcolorselectbox';
import {WindowOpacitySelectBox} from './components/subtitlesettings/windowopacityselectbox';
import {ArrayUtils} from './arrayutils';
import {StringUtils} from './stringutils';
import {PlayerUtils} from './playerutils';
import {UIUtils} from './uiutils';
import {BrowserUtils} from './browserutils';
import {StorageUtils} from './storageutils';
import {SubtitleSettingsResetButton} from './components/subtitlesettings/subtitlesettingsresetbutton';
import {ListBox} from './components/listbox';
import {DemoFactory} from './demofactory';
import {SubtitleListBox} from './components/subtitlelistbox';
import {AudioTrackListBox} from './components/audiotracklistbox';
import {ErrorUtils} from './errorutils';

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

const playerui = {
  version: '{{VERSION}}',
  // Management
  UIManager,
  UIInstanceManager,
  // Utils
  ArrayUtils,
  StringUtils,
  PlayerUtils,
  UIUtils,
  BrowserUtils,
  StorageUtils,
  ErrorUtils,
  // Components
  AdClickOverlay,
  AdMessageLabel,
  AdSkipButton,
  AirPlayToggleButton,
  AudioQualitySelectBox,
  AudioTrackSelectBox,
  BufferingOverlay,
  Button,
  CastStatusOverlay,
  CastToggleButton,
  CastUIContainer,
  ClickOverlay,
  CloseButton,
  Component,
  Container,
  ControlBar,
  DemoFactory,
  ErrorMessageOverlay,
  FullscreenToggleButton,
  HugePlaybackToggleButton,
  HugeReplayButton,
  Label,
  ListBox,
  MetadataLabel,
  MetadataLabelContent,
  PictureInPictureToggleButton,
  PlaybackSpeedSelectBox,
  PlaybackTimeLabel,
  PlaybackTimeLabelMode,
  PlaybackToggleButton,
  PlaybackToggleOverlay,
  RecommendationOverlay,
  SeekBar,
  SeekBarLabel,
  SelectBox,
  ItemSelectionList,
  SettingsPanel,
  SettingsPanelItem,
  SettingsToggleButton,
  Spacer,
  SubtitleOverlay,
  SubtitleSelectBox,
  TitleBar,
  ToggleButton,
  UIContainer,
  VideoQualitySelectBox,
  VolumeControlButton,
  VolumeSlider,
  VolumeToggleButton,
  VRToggleButton,
  Watermark,
  SubtitleListBox,
  AudioTrackListBox,
  // Subtitle related components
  subtitlesettings: {
    BackgroundColorSelectBox,
    BackgroundOpacitySelectBox,
    CharacterEdgeSelectBox,
    FontColorSelectBox,
    FontFamilySelectBox,
    FontOpacitySelectBox,
    FontSizeSelectBox,
    SubtitleSettingsButton,
    SubtitleSettingsCloseButton,
    SubtitleSettingSelectBox,
    SubtitleSettingsLabel,
    SubtitleSettingsOpenButton,
    SubtitleSettingsPanel,
    WindowColorSelectBox,
    WindowOpacitySelectBox,
    SubtitleSettingsResetButton,
  },
};

// Export UI as UMD module
// This goes together with the Browserify "--standalone bitmovin.playerui" config option (in the gulpfile)
declare const module: any;
module.exports = playerui;