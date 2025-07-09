import { SubtitleOverlay } from './components/overlays/SubtitleOverlay';
import { SettingsPanelPage } from './components/settings/SettingsPanelPage';
import { SettingsPanelItem } from './components/settings/SettingsPanelItem';
import { VideoQualitySelectBox } from './components/settings/VideoQualitySelectBox';
import { PlaybackSpeedSelectBox } from './components/settings/PlaybackSpeedSelectBox';
import { AudioTrackSelectBox } from './components/settings/AudioTrackSelectBox';
import { AudioQualitySelectBox } from './components/settings/AudioQualitySelectBox';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { SubtitleSettingsPanelPage } from './components/settings/subtitlesettings/SubtitleSettingsPanelPage';
import { SettingsPanelPageOpenButton } from './components/settings/SettingsPanelPageOpenButton';
import { SubtitleSelectBox } from './components/settings/SubtitleSelectBox';
import { ControlBar } from './components/ControlBar';
import { Container, ContainerConfig } from './components/Container';
import { PlaybackTimeLabel, PlaybackTimeLabelMode } from './components/labels/PlaybackTimeLabel';
import { SeekBar } from './components/seekbar/SeekBar';
import { SeekBarLabel } from './components/seekbar/SeekBarLabel';
import { PlaybackToggleButton } from './components/buttons/PlaybackToggleButton';
import { VolumeToggleButton } from './components/buttons/VolumeToggleButton';
import { VolumeSlider } from './components/seekbar/VolumeSlider';
import { Spacer } from './components/Spacer';
import { PictureInPictureToggleButton } from './components/buttons/PictureInPictureToggleButton';
import { AirPlayToggleButton } from './components/buttons/AirPlayToggleButton';
import { CastToggleButton } from './components/buttons/CastToggleButton';
import { VRToggleButton } from './components/buttons/VRToggleButton';
import { SettingsToggleButton } from './components/settings/SettingsToggleButton';
import { FullscreenToggleButton } from './components/buttons/FullscreenToggleButton';
import { UIContainer } from './components/UIContainer';
import { BufferingOverlay } from './components/overlays/BufferingOverlay';
import { PlaybackToggleOverlay } from './components/overlays/PlaybackToggleOverlay';
import { CastStatusOverlay } from './components/overlays/CastStatusOverlay';
import { TitleBar } from './components/TitleBar';
import { RecommendationOverlay } from './components/overlays/RecommendationOverlay';
import { Watermark } from './components/Watermark';
import { ErrorMessageOverlay } from './components/overlays/ErrorMessageOverlay';
import { AdClickOverlay } from './components/ads/AdClickOverlay';
import { MetadataLabel, MetadataLabelContent } from './components/labels/MetadataLabel';
import { PlayerUtils } from './utils/PlayerUtils';
import { CastUIContainer } from './components/CastUIContainer';
import { UIConditionContext, UIManager } from './UIManager';
import { UIConfig } from './UIConfig';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from './localization/i18n';
import { SubtitleListBox } from './components/lists/SubtitleListBox';
import { AudioTrackListBox } from './components/lists/AudioTrackListBox';
import { SpatialNavigation } from './spatialnavigation/SpatialNavigation';
import { RootNavigationGroup } from './spatialnavigation/RootNavigationGroup';
import { ListNavigationGroup, ListOrientation } from './spatialnavigation/ListNavigationGroup';
import { EcoModeContainer } from './components/EcoModeContainer';
import { DynamicSettingsPanelItem } from './components/settings/DynamicSettingsPanelItem';
import { TouchControlOverlay } from './components/overlays/TouchControlOverlay';
import { AdStatusOverlay } from './components/ads/AdStatusOverlay';
import { DismissClickOverlay } from './components/overlays/DismissClickOverlay';

/**
 * Provides factory methods to create Bitmovin provided UIs.
 */
export namespace UIFactory {
  /**
   * Builds a fully featured UI with all Bitmovin provided variants.
   * The UI will automatically switch between the different variants based on the current context.
   *
   * This UI includes variants for:
   * - Default UI (without additional context checks)
   * - Ads
   * - Small Screens (e.g. mobile devices)
   * - Small Screen Ads
   * - TVs
   * - Cast Receivers
   *
   * @param player The player instance used to build the UI
   * @param config The UIConfig object
   */
  export function buildUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
    // show smallScreen UI only on mobile/handheld devices
    let smallScreenSwitchWidth = 600;

    return new UIManager(
      player,
      [
        {
          ui: emptyStateUILayout(),
          condition: (context) => {
            return !context.isSourceLoaded;
          },
        },
        {
          ui: smallScreenAdsUILayout(),
          condition: (context: UIConditionContext) => {
            return (
              context.isMobile && context.documentWidth < smallScreenSwitchWidth && context.isAd && context.adRequiresUi
            );
          },
        },
        {
          ui: smallScreenUILayout(),
          condition: (context: UIConditionContext) => {
            return (
              !context.isAd &&
              !context.adRequiresUi &&
              context.isMobile &&
              context.documentWidth < smallScreenSwitchWidth
            );
          },
        },
        {
          ...tvUILayout(),
          condition: (context: UIConditionContext) => {
            return context.isTv && !context.isAd;
          }
        },
        {
          ...tvUILayout(),
          condition: (context: UIConditionContext) => {
            return context.isTv && context.isAd && context.adRequiresUi;
          }
        },
        {
          ui: adsUILayout(),
          condition: (context: UIConditionContext) => {
            return context.isAd && context.adRequiresUi;
          },
        },
        {
          ui: uiLayout(config),
          condition: (context: UIConditionContext) => {
            return !context.isAd && !context.adRequiresUi;
          },
        },
      ],
      config,
    );
  }

  /**
   * Builds a UI for small screens (e.g. mobile devices) only.
   * This UI is optimized for small screens and touch input.
   *
   * This UI includes variants for:
   * - Small Screens (e.g. mobile devices)
   * - Small Screen Ads
   *
   * @param player The player instance used to build the UI
   * @param config The UIConfig object
   */
  export function buildSmallScreenUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
    return new UIManager(
      player,
      [
        {
          ui: smallScreenAdsUILayout(),
          condition: (context: UIConditionContext) => {
            return context.isAd && context.adRequiresUi;
          },
        },
        {
          ui: smallScreenUILayout(),
          condition: (context: UIConditionContext) => {
            return !context.isAd && !context.adRequiresUi;
          },
        },
      ],
      config,
    );
  }

  /**
   * Builds a UI which is used on cast receivers.
   *
   * This UI includes variants for:
   * - Cast Receivers
   *
   * @param player The player instance used to build the UI
   * @param config The UIConfig object
   */
  export function buildCastReceiverUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
    return new UIManager(player, castReceiverUILayout(config), config);
  }

  /**
   * Builds a UI which is used on TVs.
   *
   * This UI includes variants for:
   * - TVs
   *
   * @param player The player instance used to build the UI
   * @param config The UIConfig object
   */
  export function buildTvUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
    return new UIManager(
      player,
      [
        {
          ...tvUILayout(),
        },
      ],
      config,
    );
  }
}

function uiLayout(config: UIConfig) {
  let subtitleOverlay = new SubtitleOverlay();

  let mainSettingsPanelPage: SettingsPanelPage;

  let settingsPanel = new SettingsPanel({
    components: [],
    hidden: true,
    pageTransitionAnimation: true,
  });

  const components: Container<ContainerConfig>[] = [
    new DynamicSettingsPanelItem({
      label: i18n.getLocalizer('settings.video.quality'),
      settingComponent: new VideoQualitySelectBox(),
      container: settingsPanel,
    }),
    new DynamicSettingsPanelItem({
      label: i18n.getLocalizer('speed'),
      settingComponent: new PlaybackSpeedSelectBox(),
      container: settingsPanel,
    }),
    new DynamicSettingsPanelItem({
      label: i18n.getLocalizer('settings.audio.track'),
      settingComponent: new AudioTrackSelectBox(),
      container: settingsPanel,
    }),
    new DynamicSettingsPanelItem({
      label: i18n.getLocalizer('settings.audio.quality'),
      settingComponent: new AudioQualitySelectBox(),
      container: settingsPanel,
    }),
  ];

  if (config.ecoMode) {
    const ecoModeContainer = new EcoModeContainer();

    ecoModeContainer.setOnToggleCallback(() => {
      // forces the browser to re-calculate the height of the settings panel when adding/removing elements
      settingsPanel.getDomElement().css({ width: '', height: '' });
    });

    components.unshift(ecoModeContainer);
  }

  mainSettingsPanelPage = new SettingsPanelPage({
    components,
  });

  settingsPanel.addComponent(mainSettingsPanelPage);

  let subtitleSettingsPanelPage = new SubtitleSettingsPanelPage({
    settingsPanel: settingsPanel,
    overlay: subtitleOverlay,
    useDynamicSettingsPanelItem: true,
  });

  let subtitleSettingsOpenButton = new SettingsPanelPageOpenButton({
    targetPage: subtitleSettingsPanelPage,
    container: settingsPanel,
    ariaLabel: i18n.getLocalizer('settings.subtitles'),
    text: i18n.getLocalizer('settings.subtitles.options'),
  });

  const subtitleSelectBox = new SubtitleSelectBox();
  let subtitleSelectItem = new DynamicSettingsPanelItem({
    label: i18n.getLocalizer('settings.subtitles'),
    backNavigationRightComponent: subtitleSettingsOpenButton,
    settingComponent: subtitleSelectBox,
    container: settingsPanel,
  });
  mainSettingsPanelPage.addComponent(subtitleSelectItem);
  settingsPanel.addComponent(subtitleSettingsPanelPage);

  let controlBar = new ControlBar({
    components: [
      new Container({
        components: [
          new PlaybackTimeLabel({
            timeLabelMode: PlaybackTimeLabelMode.CurrentTime,
            hideInLivePlayback: true,
          }),
          new SeekBar({ label: new SeekBarLabel() }),
          new PlaybackTimeLabel({
            timeLabelMode: PlaybackTimeLabelMode.TotalTime,
            cssClasses: ['text-right'],
          }),
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

  const conditionalComponents = [
    config.includeWatermark ? new Watermark() : null,
  ].filter((e) => e);

  return new UIContainer({
    components: [
      subtitleOverlay,
      new BufferingOverlay(),
      new PlaybackToggleOverlay(),
      new CastStatusOverlay(),
      controlBar,
      new TitleBar(),
      new RecommendationOverlay(),
      ...conditionalComponents,
      new DismissClickOverlay({ target: settingsPanel }),
      settingsPanel,
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

function adsUILayout() {
  let controlBar = new ControlBar({
    components: [
      new Container({
        components: [
          new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.CurrentTime }),
          new SeekBar({ label: new SeekBarLabel() }),
          new PlaybackTimeLabel({
            timeLabelMode: PlaybackTimeLabelMode.TotalTime,
            cssClasses: ['text-right'],
          }),
        ],
        cssClasses: ['controlbar-top'],
      }),
      new Container({
        components: [
          new PlaybackToggleButton(),
          new VolumeToggleButton(),
          new Spacer(),
          new FullscreenToggleButton(),
        ],
        cssClasses: ['controlbar-bottom'],
      }),
    ],
  });

  return new UIContainer({
    components: [
      new BufferingOverlay(),
      new AdClickOverlay(),
      new PlaybackToggleOverlay(),
      new AdStatusOverlay(),
      controlBar,
      new ErrorMessageOverlay(),
    ],
    hideDelay: 2000,
    hidePlayerStateExceptions: [
      PlayerUtils.PlayerState.Prepared,
      PlayerUtils.PlayerState.Paused,
      PlayerUtils.PlayerState.Finished,
    ],
    cssClasses: ['ui-ads'],
  });
}

function smallScreenUILayout() {
  let subtitleOverlay = new SubtitleOverlay();

  let settingsPanel = new SettingsPanel({
    components: [],
    hidden: true,
    pageTransitionAnimation: true,
    hideDelay: -1,
  });

  let mainSettingsPanelPage = new SettingsPanelPage({
    components: [
      new DynamicSettingsPanelItem({
        label: i18n.getLocalizer('settings.video.quality'),
        settingComponent: new VideoQualitySelectBox(),
        container: settingsPanel,
      }),
      new DynamicSettingsPanelItem({
        label: i18n.getLocalizer('speed'),
        settingComponent: new PlaybackSpeedSelectBox(),
        container: settingsPanel,
      }),
      new DynamicSettingsPanelItem({
        label: i18n.getLocalizer('settings.audio.track'),
        settingComponent: new AudioTrackSelectBox() ,
        container: settingsPanel,
      }),
      new DynamicSettingsPanelItem({
        label: i18n.getLocalizer('settings.audio.quality'),
        settingComponent: new AudioQualitySelectBox(),
        container: settingsPanel,
      }),
    ],
  });

  settingsPanel.addComponent(mainSettingsPanelPage);

  let subtitleSettingsPanelPage = new SubtitleSettingsPanelPage({
    settingsPanel: settingsPanel,
    overlay: subtitleOverlay,
    useDynamicSettingsPanelItem: true,
  });

  let subtitleSettingsOpenButton = new SettingsPanelPageOpenButton({
    targetPage: subtitleSettingsPanelPage,
    container: settingsPanel,
    ariaLabel: i18n.getLocalizer('settings.subtitles'),
    text: i18n.getLocalizer('settings.subtitles.options'),
  });

  const subtitleSelectBox = new SubtitleSelectBox();
  let subtitleSelectItem = new DynamicSettingsPanelItem({
    label: i18n.getLocalizer('settings.subtitles'),
    backNavigationRightComponent: subtitleSettingsOpenButton,
    settingComponent: subtitleSelectBox,
    role: 'menubar',
    container: settingsPanel,
  });
  mainSettingsPanelPage.addComponent(subtitleSelectItem);
  settingsPanel.addComponent(subtitleSettingsPanelPage);

  let controlBar = new ControlBar({
    components: [
      new Container({
        components: [
          new PlaybackTimeLabel({
            timeLabelMode: PlaybackTimeLabelMode.CurrentTime,
            hideInLivePlayback: true,
          }),
          new SeekBar({ label: new SeekBarLabel() }),
          new PlaybackTimeLabel({
            timeLabelMode: PlaybackTimeLabelMode.TotalTime,
            cssClasses: ['text-right'],
          }),
        ],
        cssClasses: ['controlbar-top'],
      }),
      new Container({
        components: [
          new PlaybackToggleButton(),
          new VolumeToggleButton(),
          new Spacer(),
          new SettingsToggleButton({ settingsPanel: settingsPanel }),
          // new SubtitleToggleButton(subtitleSelectItem, subtitleSelectBox),
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
      new CastStatusOverlay(),
      new TouchControlOverlay(),
      new RecommendationOverlay(),
      controlBar,
      new TitleBar({
        components: [
          new MetadataLabel({ content: MetadataLabelContent.Title }),
          new CastToggleButton(),
          new AirPlayToggleButton(),
          new VRToggleButton(),
        ],
      }),
      new DismissClickOverlay({ target: settingsPanel }),
      settingsPanel,
      new ErrorMessageOverlay(),
    ],
    cssClasses: ['ui-smallscreen'],
    hideDelay: 2000,
    hidePlayerStateExceptions: [
      PlayerUtils.PlayerState.Prepared,
      PlayerUtils.PlayerState.Paused,
      PlayerUtils.PlayerState.Finished,
    ],
  });
}

function smallScreenAdsUILayout() {
  let controlBar = new ControlBar({
    components: [
      new Container({
        components: [
          new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.CurrentTime }),
          new SeekBar({ label: new SeekBarLabel() }),
          new PlaybackTimeLabel({
            timeLabelMode: PlaybackTimeLabelMode.TotalTime,
            cssClasses: ['text-right'],
          }),
        ],
        cssClasses: ['controlbar-top'],
      }),
      new Container({
        components: [
          new PlaybackToggleButton(),
          new VolumeToggleButton(),
          new Spacer(),
          new FullscreenToggleButton(),
        ],
        cssClasses: ['controlbar-bottom'],
      }),
    ],
  });

  return new UIContainer({
    components: [
      new BufferingOverlay(),
      new AdClickOverlay(),
      new PlaybackToggleOverlay(),
      controlBar,
      new AdStatusOverlay(),
      new ErrorMessageOverlay(),
    ],
    hideDelay: 2000,
    hidePlayerStateExceptions: [
      PlayerUtils.PlayerState.Prepared,
      PlayerUtils.PlayerState.Paused,
      PlayerUtils.PlayerState.Finished,
    ],
    cssClasses: ['ui-smallscreen', 'ui-ads'],
  });
}

function castReceiverUILayout(config: UIConfig) {
  let controlBar = new ControlBar({
    components: [
      new Container({
        components: [
          new PlaybackTimeLabel({
            timeLabelMode: PlaybackTimeLabelMode.CurrentTime,
            hideInLivePlayback: true,
          }),
          new SeekBar({ smoothPlaybackPositionUpdateIntervalMs: -1 }),
          new PlaybackTimeLabel({
            timeLabelMode: PlaybackTimeLabelMode.TotalTime,
            cssClasses: ['text-right'],
          }),
        ],
        cssClasses: ['controlbar-top'],
      }),
    ],
  });

  const conditionalComponents = [
    config.includeWatermark ? new Watermark() : null,
  ].filter((e) => e);

  return new CastUIContainer({
    components: [
      new SubtitleOverlay(),
      new BufferingOverlay(),
      new PlaybackToggleOverlay(),
      controlBar,
      new TitleBar({ keepHiddenWithoutMetadata: true }),
      ...conditionalComponents,
      new ErrorMessageOverlay(),
    ],
    cssClasses: ['ui-cast-receiver'],
    hideDelay: 2000,
    hidePlayerStateExceptions: [
      PlayerUtils.PlayerState.Prepared,
      PlayerUtils.PlayerState.Paused,
      PlayerUtils.PlayerState.Finished,
    ],
  });
}

function tvUILayout() {
  const subtitleListBox = new SubtitleListBox();
  const audioTrackListBox = new AudioTrackListBox();

  const seekBar = new SeekBar({ label: new SeekBarLabel() });
  const playbackToggleOverlay = new PlaybackToggleOverlay();
  const subtitleToggleButton = new SettingsToggleButton({
    settingsPanel: subtitleListBox,
    autoHideWhenNoActiveSettings: true,
    cssClass: 'ui-subtitlesettingstogglebutton',
    text: i18n.getLocalizer('settings.subtitles'),
  });
  const audioToggleButton = new SettingsToggleButton({
    settingsPanel: audioTrackListBox,
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
              new PlaybackTimeLabel({
                timeLabelMode: PlaybackTimeLabelMode.CurrentTime,
                hideInLivePlayback: true,
              }),
              seekBar,
              new PlaybackTimeLabel({
                timeLabelMode: PlaybackTimeLabelMode.RemainingTime,
                cssClasses: ['text-right'],
              }),
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
              subtitleListBox,
              audioTrackListBox,
            ],
            cssClasses: ['ui-titlebar-bottom'],
          }),
        ],
      }),
      new RecommendationOverlay(),
      new ErrorMessageOverlay(),
    ],
    cssClasses: ['ui-tv'],
    hideDelay: 2000,
    hidePlayerStateExceptions: [
      PlayerUtils.PlayerState.Prepared,
      PlayerUtils.PlayerState.Paused,
      PlayerUtils.PlayerState.Finished,
    ],
  });

  const spatialNavigation = new SpatialNavigation(
    new RootNavigationGroup(uiContainer, playbackToggleOverlay, seekBar, audioToggleButton, subtitleToggleButton),
    new ListNavigationGroup(ListOrientation.Vertical, subtitleListBox),
    new ListNavigationGroup(ListOrientation.Vertical, audioTrackListBox),
  );

  return {
    ui: uiContainer,
    spatialNavigation: spatialNavigation,
  };
}

function tvAdsUILayout() {
  // TODO: implement once we have a design for TV ads
  return tvUILayout();
}

/**
 * Used for the initial startup phase of the UI. Only contains basic components.
 */
function emptyStateUILayout() {
  return new UIContainer({
    components: [
      new BufferingOverlay(),
      new PlaybackToggleOverlay(),
      new ErrorMessageOverlay(),
    ],
    cssClasses: ['ui', 'ui-empty-state'],
  });
}
