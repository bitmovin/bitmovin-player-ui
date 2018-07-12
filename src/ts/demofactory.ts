import {VRToggleButton} from './components/vrtogglebutton';
import {SubtitleSelectBox} from './components/subtitleselectbox';
import {SettingsToggleButton} from './components/settingstogglebutton';
import {VolumeSlider} from './components/volumeslider';
import {PlaybackTimeLabel, PlaybackTimeLabelMode} from './components/playbacktimelabel';
import {AirPlayToggleButton} from './components/airplaytogglebutton';
import {ErrorMessageOverlay} from './components/errormessageoverlay';
import {ControlBar} from './components/controlbar';
import {CastToggleButton} from './components/casttogglebutton';
import {FullscreenToggleButton} from './components/fullscreentogglebutton';
import {RecommendationOverlay} from './components/recommendationoverlay';
import {PlaybackSpeedSelectBox} from './components/playbackspeedselectbox';
import {AudioQualitySelectBox} from './components/audioqualityselectbox';
import {CastStatusOverlay} from './components/caststatusoverlay';
import {UIContainer} from './components/uicontainer';
import {Watermark} from './components/watermark';
import {SubtitleOverlay} from './components/subtitleoverlay';
import {SettingsPanel, SettingsPanelItem} from './components/settingspanel';
import {SeekBarLabel} from './components/seekbarlabel';
import {AudioTrackSelectBox} from './components/audiotrackselectbox';
import {PlaybackToggleOverlay} from './components/playbacktoggleoverlay';
import {PictureInPictureToggleButton} from './components/pictureinpicturetogglebutton';
import {Spacer} from './components/spacer';
import {Container} from './components/container';
import {VolumeToggleButton} from './components/volumetogglebutton';
import {PlaybackToggleButton} from './components/playbacktogglebutton';
import {SeekBar} from './components/seekbar';
import {VideoQualitySelectBox} from './components/videoqualityselectbox';
import {UIConditionContext, UIConfig, UIManager} from './uimanager';
import {TitleBar} from './components/titlebar';
import {BufferingOverlay} from './components/bufferingoverlay';
import PlayerAPI = bitmovin.PlayerAPI;

export namespace DemoFactory {

  export function buildDemoWithSeparateAudioSubtitlesButtons(player: PlayerAPI, config: UIConfig = {}): UIManager {
    // show smallScreen UI only on mobile/handheld devices
    let smallScreenSwitchWidth = 600;

    return new UIManager(player, [{
      ui: UIManager.Factory.modernSmallScreenAdsUI(),
      condition: (context: UIConditionContext) => {
        return context.isMobile && context.documentWidth < smallScreenSwitchWidth && context.isAdWithUI;
      },
    }, {
      ui: UIManager.Factory.modernAdsUI(),
      condition: (context: UIConditionContext) => {
        return context.isAdWithUI;
      },
    }, {
      ui: UIManager.Factory.modernSmallScreenUI(),
      condition: (context: UIConditionContext) => {
        return context.isMobile && context.documentWidth < smallScreenSwitchWidth;
      },
    }, {
      ui: modernUIWithSeparateAudioSubtitlesButtons(),
    }], config);
  }

  function modernUIWithSeparateAudioSubtitlesButtons() {
    let subtitleOverlay = new SubtitleOverlay();

    let settingsPanel = new SettingsPanel({
      components: [
        new SettingsPanelItem('Video Quality', new VideoQualitySelectBox()),
        new SettingsPanelItem('Speed', new PlaybackSpeedSelectBox()),
        new SettingsPanelItem('Audio Quality', new AudioQualitySelectBox()),
      ],
      hidden: true,
    });

    let controlBar = new ControlBar({
      components: [
        settingsPanel,
        new Container({
          components: [
            new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.CurrentTime, hideInLivePlayback: true }),
            new SeekBar({ label: new SeekBarLabel() }),
            new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.TotalTime, cssClasses: ['text-right'] }),
          ],
          cssClasses: ['controlbar-top'],
        }),
        new Container({
          components: [
            new PlaybackToggleButton(),
            new VolumeToggleButton(),
            new VolumeSlider(),
            new Spacer(),
            new PictureInPictureToggleButton(),
            new AirPlayToggleButton(),
            new CastToggleButton(),
            new VRToggleButton(),
            new AudioTrackSelectBox({
              cssClasses: ['my-audio-track-selection-demo'],
            }),
            new SubtitleSelectBox({
              cssClasses: ['my-subtitle-selection-demo'],
            }),
            new SettingsToggleButton({ settingsPanel: settingsPanel }),
            new FullscreenToggleButton(),
          ],
          cssClasses: ['controlbar-bottom'],
        }),
      ],
    });

    return new UIContainer({
      components: [
        subtitleOverlay,
        new BufferingOverlay(),
        new PlaybackToggleOverlay(),
        new CastStatusOverlay(),
        controlBar,
        new TitleBar(),
        new RecommendationOverlay(),
        new Watermark(),
        new ErrorMessageOverlay(),
      ],
      cssClasses: ['ui-skin-modern'],
    });
  }
}