import { SubtitleOverlay } from './components/subtitleoverlay';
import { SettingsPanelPage } from './components/settingspanelpage';
import { SettingsPanelItem } from './components/settingspanelitem';
import { VideoQualitySelectBox } from './components/videoqualityselectbox';
import { PlaybackSpeedSelectBox } from './components/playbackspeedselectbox';
import { AudioTrackSelectBox } from './components/audiotrackselectbox';
import { AudioQualitySelectBox } from './components/audioqualityselectbox';
import { SettingsPanel } from './components/settingspanel';
import { SubtitleSettingsPanelPage } from './components/subtitlesettings/subtitlesettingspanelpage';
import { SettingsPanelPageOpenButton } from './components/settingspanelpageopenbutton';
import { SubtitleSettingsLabel } from './components/subtitlesettings/subtitlesettingslabel';
import { SubtitleSelectBox } from './components/subtitleselectbox';
import { ControlBar } from './components/controlbar';
import { Container } from './components/container';
import { PlaybackTimeLabel, PlaybackTimeLabelMode } from './components/playbacktimelabel';
import { SeekBar } from './components/seekbar';
import { SeekBarLabel } from './components/seekbarlabel';
import { PlaybackToggleButton } from './components/playbacktogglebutton';
import { VolumeToggleButton } from './components/volumetogglebutton';
import { VolumeSlider } from './components/volumeslider';
import { Spacer } from './components/spacer';
import { PictureInPictureToggleButton } from './components/pictureinpicturetogglebutton';
import { AirPlayToggleButton } from './components/airplaytogglebutton';
import { CastToggleButton } from './components/casttogglebutton';
import { VRToggleButton } from './components/vrtogglebutton';
import { SettingsToggleButton } from './components/settingstogglebutton';
import { FullscreenToggleButton } from './components/fullscreentogglebutton';
import { UIContainer } from './components/uicontainer';
import { BufferingOverlay } from './components/bufferingoverlay';
import { PlaybackToggleOverlay } from './components/playbacktoggleoverlay';
import { CastStatusOverlay } from './components/caststatusoverlay';
import { TitleBar } from './components/titlebar';
import { RecommendationOverlay } from './components/recommendationoverlay';
import { Watermark } from './components/watermark';
import { ErrorMessageOverlay } from './components/errormessageoverlay';
import { AdClickOverlay } from './components/adclickoverlay';
import { AdMessageLabel } from './components/admessagelabel';
import { AdSkipButton } from './components/adskipbutton';
import { CloseButton } from './components/closebutton';
import { MetadataLabel, MetadataLabelContent } from './components/metadatalabel';
import { PlayerUtils } from './playerutils';
import { Label } from './components/label';
import { CastUIContainer } from './components/castuicontainer';
import { VolumeControlButton } from './components/volumecontrolbutton';
import { UIConditionContext, UIManager } from './uimanager';
import { UIConfig } from './uiconfig';
import { PlayerAPI } from 'bitmovin-player';

export namespace UIFactory {

  export function buildDefaultUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
    return UIFactory.buildModernUI(player, config);
  }

  export function buildDefaultSmallScreenUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
    return UIFactory.buildModernSmallScreenUI(player, config);
  }

  export function buildDefaultCastReceiverUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
    return UIFactory.buildModernCastReceiverUI(player, config);
  }

  function modernUI() {
    let subtitleOverlay = new SubtitleOverlay();

    let mainSettingsPanelPage = new SettingsPanelPage({
      components: [
        new SettingsPanelItem('Video Quality', new VideoQualitySelectBox()),
        new SettingsPanelItem('Speed', new PlaybackSpeedSelectBox()),
        new SettingsPanelItem('Audio Track', new AudioTrackSelectBox()),
        new SettingsPanelItem('Audio Quality', new AudioQualitySelectBox()),
      ],
    });

    let settingsPanel = new SettingsPanel({
      components: [
        mainSettingsPanelPage,
      ],
      hidden: true,
    });

    let subtitleSettingsPanelPage = new SubtitleSettingsPanelPage({
      settingsPanel: settingsPanel,
      overlay: subtitleOverlay,
    });

    let subtitleSettingsOpenButton = new SettingsPanelPageOpenButton({
      targetPage: subtitleSettingsPanelPage,
      container: settingsPanel,
      text: 'open',
    });

    mainSettingsPanelPage.addComponent(
      new SettingsPanelItem(
        new SubtitleSettingsLabel({text: 'Subtitles', opener: subtitleSettingsOpenButton}),
        new SubtitleSelectBox()
      ));

    settingsPanel.addComponent(subtitleSettingsPanelPage);

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

  export function modernAdsUI() {
    return new UIContainer({
      components: [
        new BufferingOverlay(),
        new AdClickOverlay(),
        new PlaybackToggleOverlay(),
        new Container({
          components: [
            new AdMessageLabel({ text: 'Ad: {remainingTime} secs' }),
            new AdSkipButton(),
          ],
          cssClass: 'ui-ads-status',
        }),
        new ControlBar({
          components: [
            new Container({
              components: [
                new PlaybackToggleButton(),
                new VolumeToggleButton(),
                new VolumeSlider(),
                new Spacer(),
                new FullscreenToggleButton(),
              ],
              cssClasses: ['controlbar-bottom'],
            }),
          ],
        }),
      ],
      cssClasses: ['ui-skin-modern', 'ui-skin-ads'],
    });
  }

  export function modernSmallScreenUI() {
    let subtitleOverlay = new SubtitleOverlay();

    let mainSettingsPanelPage = new SettingsPanelPage({
      components: [
        new SettingsPanelItem('Video Quality', new VideoQualitySelectBox()),
        new SettingsPanelItem('Speed', new PlaybackSpeedSelectBox()),
        new SettingsPanelItem('Audio Track', new AudioTrackSelectBox()),
        new SettingsPanelItem('Audio Quality', new AudioQualitySelectBox()),
      ],
    });

    let settingsPanel = new SettingsPanel({
      components: [
        mainSettingsPanelPage,
      ],
      hidden: true,
      pageTransitionAnimation: false,
    });

    let subtitleSettingsPanelPage = new SubtitleSettingsPanelPage({
      settingsPanel: settingsPanel,
      overlay: subtitleOverlay,
    });

    let subtitleSettingsOpenButton = new SettingsPanelPageOpenButton({
      targetPage: subtitleSettingsPanelPage,
      container: settingsPanel,
      text: 'open',
    });

    mainSettingsPanelPage.addComponent(
      new SettingsPanelItem(
        new SubtitleSettingsLabel({text: 'Subtitles', opener: subtitleSettingsOpenButton}),
        new SubtitleSelectBox()
      ));

    settingsPanel.addComponent(subtitleSettingsPanelPage);

    settingsPanel.addComponent(new CloseButton({ target: settingsPanel }));
    subtitleSettingsPanelPage.addComponent(new CloseButton({ target: settingsPanel }));

    let controlBar = new ControlBar({
      components: [
        new Container({
          components: [
            new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.CurrentTime, hideInLivePlayback: true }),
            new SeekBar({ label: new SeekBarLabel() }),
            new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.TotalTime, cssClasses: ['text-right'] }),
          ],
          cssClasses: ['controlbar-top'],
        }),
      ],
    });

    return new UIContainer({
      components: [
        subtitleOverlay,
        new BufferingOverlay(),
        new CastStatusOverlay(),
        new PlaybackToggleOverlay(),
        new RecommendationOverlay(),
        controlBar,
        new TitleBar({
          components: [
            new MetadataLabel({ content: MetadataLabelContent.Title }),
            new CastToggleButton(),
            new VRToggleButton(),
            new PictureInPictureToggleButton(),
            new AirPlayToggleButton(),
            new VolumeToggleButton(),
            new SettingsToggleButton({ settingsPanel: settingsPanel }),
            new FullscreenToggleButton(),
          ],
        }),
        settingsPanel,
        new Watermark(),
        new ErrorMessageOverlay(),
      ],
      cssClasses: ['ui-skin-modern', 'ui-skin-smallscreen'],
      hidePlayerStateExceptions: [PlayerUtils.PlayerState.Finished],
    });
  }

  export function modernSmallScreenAdsUI() {
    return new UIContainer({
      components: [
        new BufferingOverlay(),
        new AdClickOverlay(),
        new PlaybackToggleOverlay(),
        new TitleBar({
          components: [
            // dummy label with no content to move buttons to the right
            new Label({ cssClass: 'label-metadata-title' }),
            new FullscreenToggleButton(),
          ],
        }),
        new Container({
          components: [
            new AdMessageLabel({ text: 'Ad: {remainingTime} secs' }),
            new AdSkipButton(),
          ],
          cssClass: 'ui-ads-status',
        }),
      ],
      cssClasses: ['ui-skin-modern', 'ui-skin-ads', 'ui-skin-smallscreen'],
    });
  }

  export function modernCastReceiverUI() {
    let controlBar = new ControlBar({
      components: [
        new Container({
          components: [
            new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.CurrentTime, hideInLivePlayback: true }),
            new SeekBar({ smoothPlaybackPositionUpdateIntervalMs: -1 }),
            new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.TotalTime, cssClasses: ['text-right'] }),
          ],
          cssClasses: ['controlbar-top'],
        }),
      ],
    });

    return new CastUIContainer({
      components: [
        new SubtitleOverlay(),
        new BufferingOverlay(),
        new PlaybackToggleOverlay(),
        new Watermark(),
        controlBar,
        new TitleBar({ keepHiddenWithoutMetadata: true }),
        new ErrorMessageOverlay(),
      ],
      cssClasses: ['ui-skin-modern', 'ui-skin-cast-receiver'],
    });
  }

  export function buildModernUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
    // show smallScreen UI only on mobile/handheld devices
    let smallScreenSwitchWidth = 600;

    return new UIManager(player, [{
      ui: modernSmallScreenAdsUI(),
      condition: (context: UIConditionContext) => {
        return context.isMobile && context.documentWidth < smallScreenSwitchWidth && context.isAd
          && context.adClientType === 'vast';
      },
    }, {
      ui: modernAdsUI(),
      condition: (context: UIConditionContext) => {
        return context.isAd && context.adClientType === 'vast';
      },
    }, {
      ui: modernSmallScreenUI(),
      condition: (context: UIConditionContext) => {
        return context.isMobile && context.documentWidth < smallScreenSwitchWidth;
      },
    }, {
      ui: modernUI(),
    }], config);
  }

  export function buildModernSmallScreenUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
    return new UIManager(player, [{
      ui: modernSmallScreenAdsUI(),
      condition: (context: UIConditionContext) => {
        return context.isAd && context.adClientType === 'vast';
      },
    }, {
      ui: modernSmallScreenUI(),
    }], config);
  }

  export function buildModernCastReceiverUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
    return new UIManager(player, modernCastReceiverUI(), config);
  }

  function legacyUI() {
    let settingsPanel = new SettingsPanel({
      components: [
        new SettingsPanelItem('Video Quality', new VideoQualitySelectBox()),
        new SettingsPanelItem('Audio Track', new AudioTrackSelectBox()),
        new SettingsPanelItem('Audio Quality', new AudioQualitySelectBox()),
        new SettingsPanelItem('Subtitles', new SubtitleSelectBox()),
      ],
      hidden: true,
    });

    let controlBar = new ControlBar({
      components: [
        settingsPanel,
        new PlaybackToggleButton(),
        new SeekBar({ label: new SeekBarLabel() }),
        new PlaybackTimeLabel(),
        new VRToggleButton(),
        new VolumeControlButton(),
        new SettingsToggleButton({ settingsPanel: settingsPanel }),
        new CastToggleButton(),
        new FullscreenToggleButton(),
      ],
    });

    return new UIContainer({
      components: [
        new SubtitleOverlay(),
        new CastStatusOverlay(),
        new PlaybackToggleOverlay(),
        new Watermark(),
        new RecommendationOverlay(),
        controlBar,
        new TitleBar(),
        new ErrorMessageOverlay(),
      ],
      cssClasses: ['ui-skin-legacy'],
    });
  }

  function legacyAdsUI() {
    return new UIContainer({
      components: [
        new AdClickOverlay(),
        new ControlBar({
          components: [
            new PlaybackToggleButton(),
            new AdMessageLabel(),
            new VolumeControlButton(),
            new FullscreenToggleButton(),
          ],
        }),
        new AdSkipButton(),
      ],
      cssClasses: ['ui-skin-legacy', 'ui-skin-ads'],
    });
  }

  function legacyCastReceiverUI() {
    let controlBar = new ControlBar({
      components: [
        new SeekBar(),
        new PlaybackTimeLabel(),
      ],
    });

    return new UIContainer({
      components: [
        new SubtitleOverlay(),
        new PlaybackToggleOverlay(),
        new Watermark(),
        controlBar,
        new TitleBar(),
        new ErrorMessageOverlay(),
      ],
      cssClasses: ['ui-skin-legacy', 'ui-skin-cast-receiver'],
    });
  }

  function legacyTestUI() {
    let settingsPanel = new SettingsPanel({
      components: [
        new SettingsPanelItem('Video Quality', new VideoQualitySelectBox()),
        new SettingsPanelItem('Audio Track', new AudioTrackSelectBox()),
        new SettingsPanelItem('Audio Quality', new AudioQualitySelectBox()),
        new SettingsPanelItem('Subtitles', new SubtitleSelectBox()),
      ],
      hidden: true,
    });

    let controlBar = new ControlBar({
      components: [settingsPanel,
        new PlaybackToggleButton(),
        new SeekBar({ label: new SeekBarLabel() }),
        new PlaybackTimeLabel(),
        new VRToggleButton(),
        new VolumeToggleButton(),
        new VolumeSlider(),
        new VolumeControlButton(),
        new VolumeControlButton({ vertical: false }),
        new SettingsToggleButton({ settingsPanel: settingsPanel }),
        new CastToggleButton(),
        new FullscreenToggleButton(),
      ],
    });

    return new UIContainer({
      components: [
        new SubtitleOverlay(),
        new CastStatusOverlay(),
        new PlaybackToggleOverlay(),
        new Watermark(),
        new RecommendationOverlay(),
        controlBar,
        new TitleBar(),
        new ErrorMessageOverlay(),
      ],
      cssClasses: ['ui-skin-legacy'],
    });
  }

  export function buildLegacyUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
    return new UIManager(player, [{
      ui: legacyAdsUI(),
      condition: (context: UIConditionContext) => {
        return context.isAd && context.adClientType === 'vast';
      },
    }, {
      ui: legacyUI(),
    }], config);
  }

  export function buildLegacyCastReceiverUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
    return new UIManager(player, legacyCastReceiverUI(), config);
  }

  export function buildLegacyTestUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
    return new UIManager(player, legacyTestUI(), config);
  }
}