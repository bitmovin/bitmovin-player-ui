import { SubtitleOverlay } from './components/overlays/SubtitleOverlay';
import { SettingsPanelPage } from './components/settings/SettingsPanelPage';
import { VideoQualitySelectBox } from './components/settings/VideoQualitySelectBox';
import { PlaybackSpeedSelectBox } from './components/settings/PlaybackSpeedSelectBox';
import { AudioTrackSelectBox } from './components/settings/AudioTrackSelectBox';
import { AudioQualitySelectBox } from './components/settings/AudioQualitySelectBox';
import { SettingsPanel, SettingsPanelConfig } from './components/settings/SettingsPanel';
import { SubtitleSettingsPanelPage } from './components/settings/subtitlesettings/SubtitleSettingsPanelPage';
import { SettingsPanelPageOpenButton } from './components/settings/SettingsPanelPageOpenButton';
import { SubtitleSelectBox } from './components/settings/SubtitleSelectBox';
import { ControlBar } from './components/ControlBar';
import { Container, ContainerConfig } from './components/Container';
import { AdCounterLabel } from './components/ads/AdCounterLabel';
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
import { AdControlBar } from './components/ads/AdControlBar';
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
import { SettingsPanelNavigationGroup } from './spatialnavigation/SettingsPanelNavigationGroup';
import { EcoModeContainer } from './components/EcoModeContainer';
import { DynamicSettingsPanelItem } from './components/settings/DynamicSettingsPanelItem';
import { TouchControlOverlay } from './components/overlays/TouchControlOverlay';
import { AdStatusOverlay } from './components/ads/AdStatusOverlay';
import { DismissClickOverlay } from './components/overlays/DismissClickOverlay';
import { AdMessageLabel } from './components/ads/AdMessageLabel';
import { FocusableContainer } from './spatialnavigation/FocusableContainer';
import { BrowserUtils } from './utils/BrowserUtils';
import { RecommendationOverlayNavigationGroup } from './spatialnavigation/RecommendationOverlayNavigationGroup';

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
    const smallScreenSwitchWidth = 800;

    return new UIManager(
      player,
      [
        {
          ui: emptyStateUILayout(),
          condition: context => {
            return !context.isSourceLoaded;
          },
        },
        {
          ui: smallScreenAdsUILayout(),
          condition: (context: UIConditionContext) => {
            return context.documentWidth < smallScreenSwitchWidth && context.isAd && context.adRequiresUi;
          },
        },
        {
          ui: smallScreenUILayout(),
          condition: (context: UIConditionContext) => {
            return !context.isAd && !context.adRequiresUi && context.documentWidth < smallScreenSwitchWidth;
          },
        },
        {
          ...tvAdsUILayout(),
          condition: (context: UIConditionContext) => {
            return context.isTv && context.isAd && context.adRequiresUi;
          },
        },
        {
          ...tvUILayout(),
          condition: (context: UIConditionContext) => {
            return context.isTv && !context.isAd && !context.adRequiresUi;
          },
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
          ...tvAdsUILayout(),
          condition: (context: UIConditionContext) => {
            return context.isAd && context.adRequiresUi;
          },
        },
        {
          ...tvUILayout(),
          condition: (context: UIConditionContext) => {
            return !context.isAd && !context.adRequiresUi;
          },
        },
      ],
      config,
    );
  }

  /**
   * Builds a simple UI which only contains the subtitle overlay, and elements required to support programmatic
   * subtitle styling (e.g. using `uiManager.getSubtitleSettingsManager().fontSize.value = '150'`).
   *
   * This UI has no visible UI elements and only serves the purpose of displaying subtitles. Subtitles need to be
   * enabled programmatically via the Player API.
   *
   * @param player The player instance used to build the UI
   * @param config The UIConfig object
   */
  export function buildSubtitleUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
    return new UIManager(player, subtitleUi(), config);
  }
}

function subtitleUi(): UIContainer {
  const subtitleOverlay = new SubtitleOverlay();

  // Subtitle styling only works if a `SubtitleSettingsPanelPage` (with the corresponding Subtitle Settings elements)
  // are in the UI tree.
  const settingsPanel = new SettingsPanel({
    components: [],
    hidden: true,
  });
  const subtitleSettingsPanelPage = new SubtitleSettingsPanelPage({
    settingsPanel: settingsPanel,
    overlay: subtitleOverlay,
  });
  settingsPanel.addComponent(subtitleSettingsPanelPage);

  // Create a custom UI structure with only the SubtitleOverlay (and the hidden SettingsPanel to enable UI customizations)
  return new UIContainer({
    components: [subtitleOverlay, settingsPanel],
  });
}

function uiLayout(config: UIConfig) {
  const subtitleOverlay = new SubtitleOverlay();

  const settingsPanel = buildDefaultSettingsPanel(subtitleOverlay, undefined, config.ecoMode != undefined);
  const controlBar = new ControlBar({
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

  const conditionalComponents = [config.includeWatermark ? new Watermark() : null].filter(e => e);

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
    hidePlayerStateExceptions: [
      PlayerUtils.PlayerState.Prepared,
      PlayerUtils.PlayerState.Paused,
      PlayerUtils.PlayerState.Finished,
    ],
  });
}

function adsUILayout() {
  const controlBar = new AdControlBar({
    components: [
      new Container({
        components: [
          new AdCounterLabel(),
          new SeekBar({ label: new SeekBarLabel() }),
          new PlaybackTimeLabel({
            timeLabelMode: PlaybackTimeLabelMode.RemainingTime,
            cssClasses: ['text-right'],
          }),
        ],
        cssClasses: ['ad-controlbar-top'],
      }),
      new Container({
        components: [new PlaybackToggleButton(), new VolumeToggleButton(), new Spacer(), new FullscreenToggleButton()],
        cssClasses: ['ad-controlbar-bottom'],
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
      new TitleBar({
        components: [
          new Container({
            components: [new AdMessageLabel()],
            cssClasses: ['ui-titlebar-top'],
          }),
        ],
        keepHiddenWithoutMetadata: true,
      }),
      new ErrorMessageOverlay(),
    ],
    hidePlayerStateExceptions: [
      PlayerUtils.PlayerState.Prepared,
      PlayerUtils.PlayerState.Paused,
      PlayerUtils.PlayerState.Finished,
    ],
    cssClasses: ['ui-ads'],
  });
}

function smallScreenUILayout() {
  const subtitleOverlay = new SubtitleOverlay();

  const settingsPanel = buildDefaultSettingsPanel(subtitleOverlay, -1);

  const controlBar = new ControlBar({
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
      new CastStatusOverlay(),
      // Use the touch overlay on mobile devices and the regular playback toggle overlay on desktop browsers
      BrowserUtils.isMobile ? new TouchControlOverlay() : new PlaybackToggleOverlay(),
      new RecommendationOverlay(),
      controlBar,
      new TitleBar({
        components: [
          new Container({
            components: [
              new MetadataLabel({ content: MetadataLabelContent.Title }),
              new Spacer(),
              new CastToggleButton(),
              new AirPlayToggleButton(),
              new VRToggleButton(),
            ],
            cssClasses: ['titlebar-row'],
          }),
        ],
      }),
      new DismissClickOverlay({ target: settingsPanel }),
      settingsPanel,
      new ErrorMessageOverlay(),
    ],
    cssClasses: ['ui-smallscreen'],
    hidePlayerStateExceptions: [
      PlayerUtils.PlayerState.Prepared,
      PlayerUtils.PlayerState.Paused,
      PlayerUtils.PlayerState.Finished,
    ],
  });
}

function smallScreenAdsUILayout() {
  const controlBar = new AdControlBar({
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
        cssClasses: ['ad-controlbar-top'],
      }),
      new Container({
        components: [new PlaybackToggleButton(), new VolumeToggleButton(), new Spacer(), new FullscreenToggleButton()],
        cssClasses: ['ad-controlbar-bottom'],
      }),
    ],
  });

  return new UIContainer({
    components: [
      new BufferingOverlay(),
      new AdClickOverlay(),
      new PlaybackToggleOverlay(),
      controlBar,
      new TitleBar({
        components: [
          new Container({
            components: [new AdMessageLabel()],
            cssClasses: ['ui-titlebar-top'],
          }),
        ],
        keepHiddenWithoutMetadata: true,
      }),
      new AdStatusOverlay(),
      new ErrorMessageOverlay(),
    ],
    hidePlayerStateExceptions: [
      PlayerUtils.PlayerState.Prepared,
      PlayerUtils.PlayerState.Paused,
      PlayerUtils.PlayerState.Finished,
    ],
    cssClasses: ['ui-smallscreen', 'ui-ads'],
  });
}

function castReceiverUILayout(config: UIConfig) {
  const controlBar = new ControlBar({
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

  const conditionalComponents = [config.includeWatermark ? new Watermark() : null].filter(e => e);

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
    hidePlayerStateExceptions: [
      PlayerUtils.PlayerState.Prepared,
      PlayerUtils.PlayerState.Paused,
      PlayerUtils.PlayerState.Finished,
    ],
  });
}

function tvUILayout() {
  const seekBar = new SeekBar({ label: new SeekBarLabel() });
  const subtitleOverlay = new SubtitleOverlay();
  const settingsPanel = buildDefaultSettingsPanel(subtitleOverlay, 5000);

  const subtitleListBox = new SubtitleListBox(i18n.getLocalizer('settings.subtitles'));
  const subtitleListBoxOpenButton = new SettingsToggleButton({
    settingsPanel: subtitleListBox,
    autoHideWhenNoActiveSettings: true,
    cssClass: 'ui-subtitle-list-box-toggle-button',
    text: i18n.getLocalizer('settings.subtitles'),
  });

  const audioListBox = new AudioTrackListBox(i18n.getLocalizer('settings.audio.track'));
  const audioListBoxToggleButton = new SettingsToggleButton({
    settingsPanel: audioListBox,
    autoHideWhenNoActiveSettings: true,
    cssClass: 'ui-audio-track-list-box-toggle-button',
    text: i18n.getLocalizer('settings.audio.track'),
  });

  const titleBar = new TitleBar({
    components: [
      new Container({
        components: [new MetadataLabel({ content: MetadataLabelContent.Title })],
        cssClasses: ['ui-titlebar-top'],
      }),
      new Container({
        components: [new MetadataLabel({ content: MetadataLabelContent.Description })],
        cssClasses: ['ui-titlebar-bottom'],
      }),
    ],
  });

  const playbackToggleButton = new PlaybackToggleButton();
  const bottomControlBar = new Container({
    components: [
      playbackToggleButton,
      new Spacer(),
      subtitleListBoxOpenButton,
      audioListBoxToggleButton,
      new SettingsToggleButton({ settingsPanel: settingsPanel }),
    ],
    cssClasses: ['controlbar-bottom'],
  });
  const controlBar = new ControlBar({
    components: [
      new Container({
        components: [
          new PlaybackTimeLabel({
            timeLabelMode: PlaybackTimeLabelMode.CurrentTime,
            hideInLivePlayback: true,
          }),
          seekBar,
          new PlaybackTimeLabel({
            timeLabelMode: PlaybackTimeLabelMode.TotalTime,
            cssClasses: ['text-right'],
          }),
        ],
        cssClasses: ['controlbar-top'],
      }),
      bottomControlBar,
    ],
  });

  const playbackToggleOverlay = new PlaybackToggleOverlay();
  const recommendationOverlay = new RecommendationOverlay();
  const uiContainer = new UIContainer({
    components: [
      subtitleOverlay,
      new BufferingOverlay(),
      playbackToggleOverlay,
      controlBar,
      titleBar,
      settingsPanel,
      subtitleListBox,
      audioListBox,
      recommendationOverlay,
      new ErrorMessageOverlay(),
    ],
    cssClasses: ['ui-tv'],
    hidePlayerStateExceptions: [
      PlayerUtils.PlayerState.Prepared,
      PlayerUtils.PlayerState.Paused,
      PlayerUtils.PlayerState.Finished,
    ],
  });

  const spatialNavigation = new SpatialNavigation(
    new RootNavigationGroup(
      uiContainer,
      playbackToggleOverlay,
      seekBar,
      new FocusableContainer(bottomControlBar, playbackToggleButton),
    ),
    new SettingsPanelNavigationGroup(settingsPanel, { closeOnSelect: false }),
    new SettingsPanelNavigationGroup(subtitleListBox),
    new SettingsPanelNavigationGroup(audioListBox),
    new RecommendationOverlayNavigationGroup(recommendationOverlay),
  );

  return {
    ui: uiContainer,
    spatialNavigation: spatialNavigation,
  };
}

function tvAdsUILayout() {
  const playbackToggleOverlay = new PlaybackToggleOverlay();
  const adStatusOverlay = new AdStatusOverlay();
  const uiContainer = new UIContainer({
    components: [
      new BufferingOverlay(),
      new AdClickOverlay(),
      playbackToggleOverlay,
      adStatusOverlay,
      new AdControlBar({
        components: [
          new Container({
            components: [
              new AdCounterLabel(),
              new SeekBar({ label: new SeekBarLabel() }),
              new PlaybackTimeLabel({
                timeLabelMode: PlaybackTimeLabelMode.RemainingTime,
                cssClasses: ['text-right'],
              }),
            ],
            cssClasses: ['ad-controlbar-top'],
          }),
        ],
      }),
      new TitleBar({
        components: [
          new Container({
            components: [new AdMessageLabel()],
            cssClasses: ['ui-titlebar-top'],
          }),
        ],
        keepHiddenWithoutMetadata: true,
      }),
      new ErrorMessageOverlay(),
    ],
    cssClasses: ['ui-tv', 'ui-ads'],
    hidePlayerStateExceptions: [
      PlayerUtils.PlayerState.Prepared,
      PlayerUtils.PlayerState.Paused,
      PlayerUtils.PlayerState.Finished,
    ],
  });

  const spatialNavigation = new SpatialNavigation(
    new RootNavigationGroup(uiContainer, playbackToggleOverlay, adStatusOverlay.adSkipButton),
  );

  return {
    ui: uiContainer,
    spatialNavigation: spatialNavigation,
  };
}

/**
 * Used for the initial startup phase of the UI. Only contains basic components.
 */
function emptyStateUILayout() {
  return new UIContainer({
    components: [new BufferingOverlay(), new PlaybackToggleOverlay(), new ErrorMessageOverlay()],
    cssClasses: ['ui', 'ui-empty-state'],
  });
}

function buildDefaultSettingsPanel(
  subtitleOverlay: SubtitleOverlay,
  hideDelay: number | undefined = undefined,
  enableEcoMode: boolean = false,
): SettingsPanel<SettingsPanelConfig> {
  const settingsPanelConfig: SettingsPanelConfig = {
    components: [],
    hidden: true,
    pageTransitionAnimation: true,
  };

  if (hideDelay != undefined) {
    settingsPanelConfig.hideDelay = hideDelay;
  }

  const settingsPanel = new SettingsPanel(settingsPanelConfig);
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

  if (enableEcoMode) {
    const ecoModeContainer = new EcoModeContainer();

    ecoModeContainer.setOnToggleCallback(() => {
      // forces the browser to re-calculate the height of the settings panel when adding/removing elements
      settingsPanel.getDomElement().css({ width: '', height: '' });
    });

    components.unshift(ecoModeContainer);
  }

  const mainSettingsPanelPage = new SettingsPanelPage({
    components,
  });

  settingsPanel.addComponent(mainSettingsPanelPage);

  const subtitleSettingsPanelPage = new SubtitleSettingsPanelPage({
    settingsPanel: settingsPanel,
    overlay: subtitleOverlay,
    useDynamicSettingsPanelItem: true,
  });

  const subtitleSettingsOpenButton = new SettingsPanelPageOpenButton({
    targetPage: subtitleSettingsPanelPage,
    container: settingsPanel,
    ariaLabel: i18n.getLocalizer('settings.subtitles'),
    text: i18n.getLocalizer('settings.subtitles.options'),
  });

  const subtitleSelectBox = new SubtitleSelectBox();
  const subtitleSelectItem = new DynamicSettingsPanelItem({
    label: i18n.getLocalizer('settings.subtitles'),
    backNavigationRightComponent: subtitleSettingsOpenButton,
    settingComponent: subtitleSelectBox,
    container: settingsPanel,
  });
  mainSettingsPanelPage.addComponent(subtitleSelectItem);
  settingsPanel.addComponent(subtitleSettingsPanelPage);

  return settingsPanel;
}
