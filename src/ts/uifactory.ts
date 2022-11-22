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
import { UIConditionContext, UIManager } from './uimanager';
import { UIConfig } from './uiconfig';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from './localization/i18n';
import { SubtitleListBox } from './components/subtitlelistbox';
import { AudioTrackListBox } from './main';
import { SpatialNavigation } from './spatialnavigation/spatialnavigation';
import { RootNavigationGroup } from './spatialnavigation/rootnavigationgroup';
import { NavigationGroup } from './spatialnavigation/navigationgroup';
import { ReplayButton } from './components/replaybutton';
import { NextButton } from './components/nextbutton';

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

  export function modernUI() {
    let subtitleOverlay = new SubtitleOverlay();

    let mainSettingsPanelPage = new SettingsPanelPage({
      components: [
        new SettingsPanelItem(i18n.getLocalizer('settings.video.quality'), new VideoQualitySelectBox()),
        new SettingsPanelItem(i18n.getLocalizer('speed'), new PlaybackSpeedSelectBox()),
        new SettingsPanelItem(i18n.getLocalizer('settings.audio.track'), new AudioTrackSelectBox()),
        new SettingsPanelItem(i18n.getLocalizer('settings.audio.quality'), new AudioQualitySelectBox()),
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

    const subtitleSelectBox = new SubtitleSelectBox();

    let subtitleSettingsOpenButton = new SettingsPanelPageOpenButton({
      targetPage: subtitleSettingsPanelPage,
      container: settingsPanel,
      ariaLabel: i18n.getLocalizer('settings.subtitles'),
      text: i18n.getLocalizer('open'),
    });

    mainSettingsPanelPage.addComponent(
      new SettingsPanelItem(
        new SubtitleSettingsLabel({
          text: i18n.getLocalizer('settings.subtitles'),
          opener: subtitleSettingsOpenButton,
        }),
        subtitleSelectBox,
        {
          role: 'menubar',
        },
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
      hideDelay: 2000,
      hidePlayerStateExceptions: [
        PlayerUtils.PlayerState.Prepared,
        PlayerUtils.PlayerState.Paused,
        PlayerUtils.PlayerState.Finished,
      ],
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
            new AdMessageLabel({ text: i18n.getLocalizer('ads.remainingTime')}),
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
      cssClasses: ['ui-skin-ads'],
      hideDelay: 2000,
      hidePlayerStateExceptions: [
        PlayerUtils.PlayerState.Prepared,
        PlayerUtils.PlayerState.Paused,
        PlayerUtils.PlayerState.Finished,
      ],
    });
  }

  export function modernSmallScreenUI() {
    let subtitleOverlay = new SubtitleOverlay();

    let mainSettingsPanelPage = new SettingsPanelPage({
      components: [
        new SettingsPanelItem(i18n.getLocalizer('settings.video.quality'), new VideoQualitySelectBox()),
        new SettingsPanelItem(i18n.getLocalizer('speed'), new PlaybackSpeedSelectBox()),
        new SettingsPanelItem(i18n.getLocalizer('settings.audio.track'), new AudioTrackSelectBox()),
        new SettingsPanelItem(i18n.getLocalizer('settings.audio.quality'), new AudioQualitySelectBox()),
      ],
    });

    let settingsPanel = new SettingsPanel({
      components: [
        mainSettingsPanelPage,
      ],
      hidden: true,
      pageTransitionAnimation: false,
      hideDelay: -1,
    });

    let subtitleSettingsPanelPage = new SubtitleSettingsPanelPage({
      settingsPanel: settingsPanel,
      overlay: subtitleOverlay,
    });

    let subtitleSettingsOpenButton = new SettingsPanelPageOpenButton({
      targetPage: subtitleSettingsPanelPage,
      container: settingsPanel,
      ariaLabel: i18n.getLocalizer('settings.subtitles'),
      text: i18n.getLocalizer('open'),
    });

    const subtitleSelectBox = new SubtitleSelectBox();

    mainSettingsPanelPage.addComponent(
      new SettingsPanelItem(
        new SubtitleSettingsLabel({
          text: i18n.getLocalizer('settings.subtitles'),
          opener: subtitleSettingsOpenButton,
        }),
        subtitleSelectBox,
        {
          role: 'menubar',
        },
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
      cssClasses: ['ui-skin-smallscreen'],
      hideDelay: 2000,
      hidePlayerStateExceptions: [
        PlayerUtils.PlayerState.Prepared,
        PlayerUtils.PlayerState.Paused,
        PlayerUtils.PlayerState.Finished,
      ],
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
      cssClasses: ['ui-skin-ads', 'ui-skin-smallscreen'],
      hideDelay: 2000,
      hidePlayerStateExceptions: [
        PlayerUtils.PlayerState.Prepared,
        PlayerUtils.PlayerState.Paused,
        PlayerUtils.PlayerState.Finished,
      ],
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
      cssClasses: ['ui-skin-cast-receiver'],
      hideDelay: 2000,
      hidePlayerStateExceptions: [
        PlayerUtils.PlayerState.Prepared,
        PlayerUtils.PlayerState.Paused,
        PlayerUtils.PlayerState.Finished,
      ],
    });
  }

  export function buildModernUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
    // show smallScreen UI only on mobile/handheld devices
    let smallScreenSwitchWidth = 600;

    return new UIManager(player, [{
      ui: modernSmallScreenAdsUI(),
      condition: (context: UIConditionContext) => {
        return context.isMobile && context.documentWidth < smallScreenSwitchWidth && context.isAd
          && context.adRequiresUi;
      },
    }, {
      ui: modernAdsUI(),
      condition: (context: UIConditionContext) => {
        return context.isAd && context.adRequiresUi;
      },
    }, {
      ui: modernSmallScreenUI(),
      condition: (context: UIConditionContext) => {
        return !context.isAd && !context.adRequiresUi && context.isMobile
          && context.documentWidth < smallScreenSwitchWidth;
      },
    }, {
      ui: modernUI(),
      condition: (context: UIConditionContext) => {
        return !context.isAd && !context.adRequiresUi;
      },
    }], config);
  }

  export function buildModernSmallScreenUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
    return new UIManager(player, [{
      ui: modernSmallScreenAdsUI(),
      condition: (context: UIConditionContext) => {
        return context.isAd && context.adRequiresUi;
      },
    }, {
      ui: modernSmallScreenUI(),
      condition: (context: UIConditionContext) => {
        return !context.isAd && !context.adRequiresUi;
      },
    }], config);
  }

  export function buildModernCastReceiverUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
    return new UIManager(player, modernCastReceiverUI(), config);
  }

  export function buildModernTvUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
        return new UIManager(player, [{
          ...modernTvUI(),
        }], config);
  }

  export function modernTvUI() {
    const subtitleListBox = new SubtitleListBox();
    const subtitleListPanel = new SettingsPanel({
      components: [
        new SettingsPanelPage({
          components: [
            new SettingsPanelItem(null, subtitleListBox),
          ],
        }),
      ],
      hidden: true,
    });

    const audioTrackListBox = new AudioTrackListBox();
    const audioTrackListPanel = new SettingsPanel({
      components: [
        new SettingsPanelPage({
          components: [
            new SettingsPanelItem(null, audioTrackListBox),
          ],
        }),
      ],
      hidden: true,
    });

    const seekBar = new SeekBar({ label: new SeekBarLabel() });
    const playbackToggleOverlay = new PlaybackToggleOverlay();
    const subtitleToggleButton = new SettingsToggleButton({
      settingsPanel: subtitleListPanel,
      autoHideWhenNoActiveSettings: true,
      cssClass: 'ui-subtitlesettingstogglebutton',
      text: i18n.getLocalizer('settings.subtitles'),
    });
    const audioToggleButton = new SettingsToggleButton({
      settingsPanel: audioTrackListPanel,
      autoHideWhenNoActiveSettings: true,
      cssClass: 'ui-audiotracksettingstogglebutton',
      ariaLabel: i18n.getLocalizer('settings.audio.track'),
      text: i18n.getLocalizer('settings.audio.track'),
    });
    const uiContainer = new UIContainer({
      components: [
        new SubtitleOverlay(),
        new BufferingOverlay(),
        playbackToggleOverlay,
        new ControlBar({
          components: [
            new Container({
              components: [
                new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.CurrentTime, hideInLivePlayback: true }),
                seekBar,
                new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.RemainingTime, cssClasses: ['text-right'] }),
              ],
              cssClasses: ['controlbar-top'],
            }),
          ],
        }),
        new TitleBar({
          components: [
            new Container({
              components: [
                new MetadataLabel({ content: MetadataLabelContent.Title }),
                subtitleToggleButton,
                audioToggleButton,
              ],
              cssClasses: ['ui-titlebar-top'],
            }),
            new Container({
              components: [
                new MetadataLabel({ content: MetadataLabelContent.Description }),
                subtitleListPanel,
                audioTrackListPanel,
              ],
              cssClasses: ['ui-titlebar-bottom'],
            }),
          ],
        }),
        new RecommendationOverlay(),
        new ErrorMessageOverlay(),
      ],
      cssClasses: ['ui-skin-tv'],
      hideDelay: 2000,
      hidePlayerStateExceptions: [
        PlayerUtils.PlayerState.Prepared,
        PlayerUtils.PlayerState.Paused,
        PlayerUtils.PlayerState.Finished,
      ],
    });

    const spatialNavigation = new SpatialNavigation(
      new RootNavigationGroup(uiContainer, playbackToggleOverlay, seekBar, audioToggleButton, subtitleToggleButton),
      new NavigationGroup(subtitleListPanel, subtitleListBox),
      new NavigationGroup(audioTrackListPanel, audioTrackListBox),
    );

    return {
      ui: uiContainer,
      spatialNavigation: spatialNavigation,
    };
  }

  export function buildNetflixTvUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
    return new UIManager(player, [{
      ...netflixTvUI(),
    }], config);
  }

  export function netflixTvUI() {

  const uiContainer = new UIContainer({
    cssClasses: ['ui-skin-tv-netflix'],
    hideDelay: 2000,
    hidePlayerStateExceptions: [
      PlayerUtils.PlayerState.Prepared,
      PlayerUtils.PlayerState.Paused,
      PlayerUtils.PlayerState.Idle,
      PlayerUtils.PlayerState.Finished,
    ],
    // userInteractionEventSource: 
  });


  const closeButton = new CloseButton({ target: uiContainer });
  const seekBar = new SeekBar({ label: new SeekBarLabel });
  const playbackToggleButton = new PlaybackToggleButton()
  const replayButton = new ReplayButton()
  const nextButton = new NextButton()

  const uiComponents = new UIContainer({
    components: [
      new ControlBar({
        components: [
          new Container({
            components: [
              playbackToggleButton,
              new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.CurrentTime, hideInLivePlayback: true }),
              seekBar,
              new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.RemainingTime, cssClasses: ['text-right'] }),
            ],
            cssClasses: ['controlbar-top'],
          }),
        ],
      }),
      new TitleBar({
        components: [
          new Container({
            components: [
              closeButton,
              replayButton,
              nextButton,
              new MetadataLabel({ content: MetadataLabelContent.Title }),
            ],
            cssClasses: ['ui-titlebar-top'],
          }),
          new Container({
            components: [
              new MetadataLabel({ content: MetadataLabelContent.Description }),
            ],
            cssClasses: ['ui-titlebar-bottom'],
          }),
        ],
      }),
      new RecommendationOverlay(),
      new ErrorMessageOverlay(),
    ],
  });

  uiContainer.addComponent(uiComponents);

  const spatialNavigation = new SpatialNavigation(
    new RootNavigationGroup(uiContainer, seekBar, nextButton, replayButton, closeButton),
  );

  return {
    ui: uiContainer,
    spatialNavigation: spatialNavigation,
  };
  }

  export function buildDisneyPlusTvUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
    return new UIManager(player, [{ ...disneyPlusTvUI() }], config);
  }

  export function disneyPlusTvUI() {
    let subtitleOverlay = new SubtitleOverlay();

    let mainSettingsPanelPage = new SettingsPanelPage({
      components: [
        new SettingsPanelItem(i18n.getLocalizer('settings.audio.track'), new AudioTrackSelectBox()),
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

    const subtitleSelectBox = new SubtitleSelectBox();

    let subtitleSettingsOpenButton = new SettingsPanelPageOpenButton({
      targetPage: subtitleSettingsPanelPage,
      container: settingsPanel,
      ariaLabel: i18n.getLocalizer('settings.subtitles'),
      text: i18n.getLocalizer('open'),
    });

    mainSettingsPanelPage.addComponent(
      new SettingsPanelItem(
        new SubtitleSettingsLabel({
          text: i18n.getLocalizer('settings.subtitles'),
          opener: subtitleSettingsOpenButton,
        }),
        subtitleSelectBox,
        {
          role: 'menubar',
        },
      ));

    settingsPanel.addComponent(subtitleSettingsPanelPage);

    const replayButton = new ReplayButton();
    const playbackToggleButton = new PlaybackToggleButton();
    const settingsToggleButton = new SettingsToggleButton({ settingsPanel: settingsPanel });
    const seekBar = new SeekBar({ label: new SeekBarLabel() });

    let controlBar = new ControlBar({
      components: [
        settingsPanel,
        new Container({
          components: [
            seekBar,
            new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.TotalTime, cssClasses: ['text-right'] }),
          ],
          cssClasses: ['controlbar-top'],
        }),
        new Container({
          components: [
            new Spacer(),
            replayButton,
            playbackToggleButton,
            new Spacer(),
            settingsToggleButton,
          ],
          cssClasses: ['controlbar-bottom'],
        }),
      ],
    });

    const uiContainer = new UIContainer({
      components: [
        subtitleOverlay,
        new BufferingOverlay(),
        controlBar,
        new TitleBar(),
        new RecommendationOverlay(),
        new ErrorMessageOverlay(),
      ],
      hideDelay: 2000,
      hidePlayerStateExceptions: [
        PlayerUtils.PlayerState.Prepared,
        PlayerUtils.PlayerState.Paused,
        PlayerUtils.PlayerState.Finished,
        PlayerUtils.PlayerState.Idle,
      ],
      cssClasses: ['ui-skin-tv-disneyplus'],
    });

    const spatialNavigation = new SpatialNavigation(
      new RootNavigationGroup(uiContainer, seekBar, replayButton, playbackToggleButton, settingsToggleButton),
    );

    return {
      ui: uiContainer,
      spatialNavigation: spatialNavigation
    };
  }

  export function buildYoutubeTvUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
    return new UIManager(player, [{
      ...youtubeTvUI(),
    }], config);
  }

  export function youtubeTvUI() {

  const uiContainer = new UIContainer({
    cssClasses: ['ui-skin-tv-youtube'],
    hideDelay: 2000,
    hidePlayerStateExceptions: [
      PlayerUtils.PlayerState.Prepared,
      PlayerUtils.PlayerState.Paused,
      PlayerUtils.PlayerState.Idle,
      PlayerUtils.PlayerState.Finished,
    ],
    // userInteractionEventSource: 
  });

  const subtitleListBox = new SubtitleListBox();
  const subtitleListPanel = new SettingsPanel({
    components: [
      new SettingsPanelPage({
        components: [
          new SettingsPanelItem(null, subtitleListBox),
        ],
      }),
    ],
    hidden: false,
  });

  const audioTrackListBox = new AudioTrackListBox();
  const audioTrackListPanel = new SettingsPanel({
    components: [
      new SettingsPanelPage({
        components: [
          new SettingsPanelItem(null, audioTrackListBox),
        ],
      }),
    ],
    hidden: true,
  });

  const closeButton = new CloseButton({ target: uiContainer });

  const seekBar = new SeekBar({ label: new SeekBarLabel });

  const subtitleToggleButton = new SettingsToggleButton({
    settingsPanel: subtitleListPanel,
    autoHideWhenNoActiveSettings: true,
    cssClass: 'ui-subtitlesettingstogglebutton',
    text: i18n.getLocalizer('settings.subtitles'),
  });
  const audioToggleButton = new SettingsToggleButton({
    settingsPanel: audioTrackListPanel,
    autoHideWhenNoActiveSettings: true,
    cssClass: 'ui-audiotracksettingstogglebutton',
    ariaLabel: i18n.getLocalizer('settings.audio.track'),
    text: i18n.getLocalizer('settings.audio.track'),
  });

  const playbackToggleButton = new PlaybackToggleButton()
  const replayButton = new ReplayButton()
  const nextButton = new NextButton()

  const uiComponents = new UIContainer({
    components: [
      new SubtitleOverlay(),
      new BufferingOverlay(),
      // playbackToggleOverlay,
      new ControlBar({
        components: [
          new Container({
            components: [
              playbackToggleButton,
              new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.CurrentTime, hideInLivePlayback: true }),
              seekBar,
              new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.RemainingTime, cssClasses: ['text-right'] }),
            ],
            cssClasses: ['controlbar-top'],
          }),
        ],
      }),
      new TitleBar({
        components: [
          new Container({
            components: [
              closeButton,
              replayButton,
              nextButton,
              new MetadataLabel({ content: MetadataLabelContent.Title }),
            ],
            cssClasses: ['ui-titlebar-top'],
          }),
          new Container({
            components: [
              subtitleListPanel,
              audioTrackListPanel,
              new MetadataLabel({ content: MetadataLabelContent.Description }),
            ],
            cssClasses: ['ui-titlebar-bottom'],
          }),
        ],
      }),
      new RecommendationOverlay(),
      new ErrorMessageOverlay(),
    ],
  });

  uiContainer.addComponent(uiComponents);

  const spatialNavigation = new SpatialNavigation(
    new RootNavigationGroup(uiContainer, seekBar, nextButton, replayButton, closeButton),
  );

  return {
    ui: uiContainer,
    spatialNavigation: spatialNavigation,
  };
  }
}
