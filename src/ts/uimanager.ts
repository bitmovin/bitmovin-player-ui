import {UIContainer} from './components/uicontainer';
import {DOM} from './dom';
import {Component, ComponentConfig} from './components/component';
import {Container} from './components/container';
import {PlaybackToggleButton} from './components/playbacktogglebutton';
import {FullscreenToggleButton} from './components/fullscreentogglebutton';
import {VRToggleButton} from './components/vrtogglebutton';
import {VolumeToggleButton} from './components/volumetogglebutton';
import {SeekBar} from './components/seekbar';
import {PlaybackTimeLabel, TimeLabelMode} from './components/playbacktimelabel';
import {ControlBar} from './components/controlbar';
import {NoArgs, EventDispatcher} from './eventdispatcher';
import {SettingsToggleButton} from './components/settingstogglebutton';
import {SettingsPanel, SettingsPanelItem} from './components/settingspanel';
import {VideoQualitySelectBox} from './components/videoqualityselectbox';
import {Watermark} from './components/watermark';
import {AudioQualitySelectBox} from './components/audioqualityselectbox';
import {AudioTrackSelectBox} from './components/audiotrackselectbox';
import {SeekBarLabel} from './components/seekbarlabel';
import {VolumeSlider} from './components/volumeslider';
import {SubtitleSelectBox} from './components/subtitleselectbox';
import {SubtitleOverlay} from './components/subtitleoverlay';
import {VolumeControlButton} from './components/volumecontrolbutton';
import {CastToggleButton} from './components/casttogglebutton';
import {CastStatusOverlay} from './components/caststatusoverlay';
import {ErrorMessageOverlay} from './components/errormessageoverlay';
import {TitleBar} from './components/titlebar';
import Player = bitmovin.player.Player;
import {RecommendationOverlay} from './components/recommendationoverlay';
import {AdMessageLabel} from './components/admessagelabel';
import {AdSkipButton} from './components/adskipbutton';
import {AdClickOverlay} from './components/adclickoverlay';
import EVENT = bitmovin.player.EVENT;
import PlayerEventCallback = bitmovin.player.PlayerEventCallback;
import AdStartedEvent = bitmovin.player.AdStartedEvent;
import {ArrayUtils} from './utils';
import {PlaybackSpeedSelectBox} from './components/playbackspeedselectbox';
import {BufferingOverlay} from './components/bufferingoverlay';
import {CastUIContainer} from './components/castuicontainer';
import {PlaybackToggleOverlay} from './components/playbacktoggleoverlay';
import {CloseButton} from './components/closebutton';
import {MetadataLabel, MetadataLabelContent} from './components/metadatalabel';
import {Label} from './components/label';
import PlayerEvent = bitmovin.player.PlayerEvent;
import {AirPlayToggleButton} from './components/airplaytogglebutton';

export interface UIRecommendationConfig {
  title: string;
  url: string;
  thumbnail?: string;
  duration?: number;
}

export interface TimelineMarker {
  time: number;
  title?: string;
}

export interface UIConfig {
  metadata?: {
    title?: string;
    description?: string;
    markers?: TimelineMarker[];
  };
  recommendations?: UIRecommendationConfig[];
}

/**
 * The context that will be passed to a {@link UIConditionResolver} to determine if it's conditions fulfil the context.
 */
export interface UIConditionContext {
  isAd: boolean;
  isAdWithUI: boolean;
  isFullscreen: boolean;
  isMobile: boolean;
  width: number;
  documentWidth: number;
  // TODO add platform (Android, iOS, Windows, Linux, MacOS)?
  // TODO add device type (phone, tablet, desktop)?
  // TODO add screen size?
}

/**
 * Resolves the conditions of its associated UI in a {@link UIVariant} upon a {@link UIConditionContext} and decides
 * if the UI should be displayed. If it returns true, the UI is a candidate for display; if it returns false, it will
 * not be displayed in the given context.
 */
export interface UIConditionResolver {
  (context: UIConditionContext): boolean;
}

/**
 * Associates a UI instance with an optional {@link UIConditionResolver} that determines if the UI should be displayed.
 */
export interface UIVariant {
  ui: UIContainer;
  condition?: UIConditionResolver;
}

export class UIManager {

  private player: Player;
  private playerElement: DOM;
  private uiVariants: UIVariant[];
  private uiInstanceManagers: InternalUIInstanceManager[];
  private currentUi: InternalUIInstanceManager;
  private config: UIConfig;
  private managerPlayerWrapper: PlayerWrapper;

  /**
   * Creates a UI manager with a single UI variant that will be permanently shown.
   * @param player the associated player of this UI
   * @param ui the UI to add to the player
   * @param config optional UI configuration
   */
  constructor(player: Player, ui: UIContainer, config?: UIConfig);
  /**
   * Creates a UI manager with a list of UI variants that will be dynamically selected and switched according to
   * the context of the UI.
   *
   * Every time the UI context changes, the conditions of the UI variants will be sequentially resolved and the first
   * UI, whose condition evaluates to true, will be selected and displayed. The last variant in the list might omit the
   * condition resolver and will be selected as default/fallback UI when all other conditions fail. If there is no
   * fallback UI and all conditions fail, no UI will be displayed.
   *
   * @param player the associated player of this UI
   * @param uiVariants a list of UI variants that will be dynamically switched
   * @param config optional UI configuration
   */
  constructor(player: Player, uiVariants: UIVariant[], config?: UIConfig);
  /**
   * Creates a UI Manager with a default player UI and an optional ads UI that is displayed during ad playback.
   * @param player the associated player of this UI
   * @param playerUi the default UI for the player
   * @param adsUi an ads UI to be displayed during ad playback, can be null
   * @param config optional UI configuration
   * @deprecated Will be removed with the next major player release. Use the constructor with UIVariant instead.
   */
  // TODO remove this constructor with next major player release (and simplify handling in constructor body)
  constructor(player: Player, playerUi: UIContainer, adsUi: UIContainer, config?: UIConfig);
  constructor(player: Player, playerUiOrUiVariants: UIContainer | UIVariant[],
              adsUiOrConfig: UIContainer | UIConfig = {}, config: UIConfig = {}) {
    if (playerUiOrUiVariants instanceof UIContainer) {
      // Deprecated or new single-UI constructor has been called, transform arguments to the new UIVariant[] signature
      let playerUi = <UIContainer>playerUiOrUiVariants;
      let adsUi = null;

      if (adsUiOrConfig instanceof UIContainer) {
        // The third parameter is also a UI, this is definitely a call to the deprecated constructor
        adsUi = <UIContainer>adsUiOrConfig;
      } else if (adsUiOrConfig != null) {
        // Since the third parameter cannot be a UI (covered by the preceding if), it can only be a UI config
        config = <UIConfig>adsUiOrConfig;
      }

      let uiVariants = [];

      // Add the ads UI if defined
      if (adsUi) {
        uiVariants.push({
          ui: adsUi,
          condition: function(context: UIConditionContext) {
            return context.isAdWithUI;
          },
        });
      }

      // Add the default player UI
      uiVariants.push({ ui: playerUi });

      this.uiVariants = uiVariants;
      this.config = config;
    }
    else {
      // Default constructor (UIVariant[]) has been called
      this.uiVariants = <UIVariant[]>playerUiOrUiVariants;
      this.config = <UIConfig>adsUiOrConfig;
    }

    this.player = player;
    this.managerPlayerWrapper = new PlayerWrapper(player);
    this.playerElement = new DOM(player.getFigure());

    // If no metadata is passed with the config, we take the metadata from the player config
    if (!this.config.metadata) {
      this.config.metadata = {
        title: player.getConfig().source ? player.getConfig().source.title : null,
        description: player.getConfig().source ? player.getConfig().source.description : null,
      };
    }

    // Create UI instance managers for the UI variants
    // The instance managers map to the corresponding UI variants by their array index
    this.uiInstanceManagers = [];
    let uiVariantsWithoutCondition = [];
    for (let uiVariant of this.uiVariants) {
      if (uiVariant.condition == null) {
        // Collect variants without conditions for error checking
        uiVariantsWithoutCondition.push(uiVariant);
      }
      // Create the instance manager for a UI variant
      this.uiInstanceManagers.push(new InternalUIInstanceManager(player, uiVariant.ui, this.config));
    }
    // Make sure that there is only one UI variant without a condition
    // It does not make sense to have multiple variants without condition, because only the first one in the list
    // (the one with the lowest index) will ever be selected.
    if (uiVariantsWithoutCondition.length > 1) {
      throw Error('Too many UIs without a condition: You cannot have more than one default UI');
    }
    // Make sure that the default UI variant, if defined, is at the end of the list (last index)
    // If it comes earlier, the variants with conditions that come afterwards will never be selected because the
    // default variant without a condition always evaluates to 'true'
    if (uiVariantsWithoutCondition.length > 0
      && uiVariantsWithoutCondition[0] != this.uiVariants[this.uiVariants.length - 1]) {
      throw Error('Invalid UI variant order: the default UI (without condition) must be at the end of the list');
    }

    let self = this;
    let adStartedEvent: AdStartedEvent = null; // keep the event stored here during ad playback

    // Dynamically select a UI variant that matches the current UI condition.
    let resolveUiVariant = function(event: PlayerEvent) {
      // Make sure that the ON_AD_STARTED event data is persisted through ad playback in case other events happen
      // in the meantime, e.g. player resize. We need to store this data because there is no other way to find out
      // ad details (e.g. the ad client) while an ad is playing.
      // Existing event data signals that an ad is currently active. We cannot use player.isAd() because it returns
      // true on ad start and also on ad end events, which is problematic.
      if (event != null) {
        switch (event.type) {
          // When the ad starts, we store the event data
          case player.EVENT.ON_AD_STARTED:
            adStartedEvent = <AdStartedEvent>event;
            break;
          // When the ad ends, we delete the event data
          case player.EVENT.ON_AD_FINISHED:
          case player.EVENT.ON_AD_SKIPPED:
          case player.EVENT.ON_AD_ERROR:
            adStartedEvent = null;
        }
      }

      // Detect if an ad has started
      let ad = adStartedEvent != null;
      let adWithUI = ad && adStartedEvent.clientType === 'vast';

      // Determine the current context for which the UI variant will be resolved
      let context: UIConditionContext = {
        isAd: ad,
        isAdWithUI: adWithUI,
        isFullscreen: self.player.isFullscreen(),
        isMobile: navigator.userAgent.match(/(Android|iPhone|iPad|iPod)/i) != null,
        width: self.playerElement.width(),
        documentWidth: document.body.clientWidth,
      };

      let nextUi: InternalUIInstanceManager = null;
      let uiVariantChanged = false;

      // Select new UI variant
      // If no variant condition is fulfilled, we switch to *no* UI
      for (let uiVariant of self.uiVariants) {
        if (uiVariant.condition == null || uiVariant.condition(context) === true) {
          nextUi = self.uiInstanceManagers[self.uiVariants.indexOf(uiVariant)];
          break;
        }
      }

      // Determine if the UI variant is changing
      if (nextUi !== self.currentUi) {
        uiVariantChanged = true;
        console.log('switched to ', nextUi ? nextUi.getUI() : 'none');
      }

      // Only if the UI variant is changing, we need to do some stuff. Else we just leave everything as-is.
      if (uiVariantChanged) {
        // Hide the currently active UI variant
        if (self.currentUi) {
          self.currentUi.getUI().hide();
        }

        // Assign the new UI variant as current UI
        self.currentUi = nextUi;

        // When we switch to a different UI instance, there's some additional stuff to manage. If we do not switch
        // to an instance, we're done here.
        if (self.currentUi != null) {
          // Add the UI to the DOM (and configure it) the first time it is selected
          if (!self.currentUi.isConfigured()) {
            self.addUi(self.currentUi);
          }

          // If this is an ad UI, we need to relay the saved ON_AD_STARTED event data so ad components can configure
          // themselves for the current ad.
          if (context.isAd) {
            /* Relay the ON_AD_STARTED event to the ads UI
             *
             * Because the ads UI is initialized in the ON_AD_STARTED handler, i.e. when the ON_AD_STARTED event has
             * already been fired, components in the ads UI that listen for the ON_AD_STARTED event never receive it.
             * Since this can break functionality of components that rely on this event, we relay the event to the
             * ads UI components with the following call.
             */
            self.currentUi.getPlayer().fireEventInUI(self.player.EVENT.ON_AD_STARTED, adStartedEvent);
          }

          self.currentUi.getUI().show();
        }
      }
    };

    // Listen to the following events to trigger UI variant resolution
    this.managerPlayerWrapper.getPlayer().addEventHandler(this.player.EVENT.ON_AD_STARTED, resolveUiVariant);
    this.managerPlayerWrapper.getPlayer().addEventHandler(this.player.EVENT.ON_AD_FINISHED, resolveUiVariant);
    this.managerPlayerWrapper.getPlayer().addEventHandler(this.player.EVENT.ON_AD_SKIPPED, resolveUiVariant);
    this.managerPlayerWrapper.getPlayer().addEventHandler(this.player.EVENT.ON_AD_ERROR, resolveUiVariant);
    this.managerPlayerWrapper.getPlayer().addEventHandler(this.player.EVENT.ON_PLAYER_RESIZE, resolveUiVariant);
    this.managerPlayerWrapper.getPlayer().addEventHandler(this.player.EVENT.ON_FULLSCREEN_ENTER, resolveUiVariant);
    this.managerPlayerWrapper.getPlayer().addEventHandler(this.player.EVENT.ON_FULLSCREEN_EXIT, resolveUiVariant);

    // Initialize the UI
    resolveUiVariant(null);
  }

  getConfig(): UIConfig {
    return this.config;
  }

  private addUi(ui: InternalUIInstanceManager): void {
    let dom = ui.getUI().getDomElement();
    ui.configureControls();
    /* Append the UI DOM after configuration to avoid CSS transitions at initialization
     * Example: Components are hidden during configuration and these hides may trigger CSS transitions that are
     * undesirable at this time. */
    this.playerElement.append(dom);
    ui.onConfigured.dispatch(ui.getUI());
  }

  private releaseUi(ui: InternalUIInstanceManager): void {
    ui.releaseControls();
    ui.getUI().getDomElement().remove();
    ui.clearEventHandlers();
  }

  release(): void {
    for (let uiInstanceManager of this.uiInstanceManagers) {
      this.releaseUi(uiInstanceManager);
    }
    this.managerPlayerWrapper.clearEventHandlers();
  }

  static Factory = class {

    static buildDefaultUI(player: Player, config: UIConfig = {}): UIManager {
      return UIManager.Factory.buildModernUI(player, config);
    }

    static buildDefaultSmallScreenUI(player: Player, config: UIConfig = {}): UIManager {
      return UIManager.Factory.buildModernSmallScreenUI(player, config);
    }

    static buildDefaultCastReceiverUI(player: Player, config: UIConfig = {}): UIManager {
      return UIManager.Factory.buildModernCastReceiverUI(player, config);
    }

    private static modernUI = function() {
      let settingsPanel = new SettingsPanel({
        components: [
          new SettingsPanelItem('Video Quality', new VideoQualitySelectBox()),
          new SettingsPanelItem('Speed', new PlaybackSpeedSelectBox()),
          new SettingsPanelItem('Audio Track', new AudioTrackSelectBox()),
          new SettingsPanelItem('Audio Quality', new AudioQualitySelectBox()),
          new SettingsPanelItem('Subtitles', new SubtitleSelectBox())
        ],
        hidden: true
      });

      let controlBar = new ControlBar({
        components: [
          settingsPanel,
          new Container({
            components: [
              new PlaybackTimeLabel({ timeLabelMode: TimeLabelMode.CurrentTime, hideInLivePlayback: true }),
              new SeekBar({ label: new SeekBarLabel() }),
              new PlaybackTimeLabel({ timeLabelMode: TimeLabelMode.TotalTime, cssClasses: ['text-right'] }),
            ],
            cssClasses: ['controlbar-top']
          }),
          new Container({
            components: [
              new PlaybackToggleButton(),
              new VolumeToggleButton(),
              new VolumeSlider(),
              new Component({ cssClass: 'spacer' }),
              new AirPlayToggleButton(),
              new CastToggleButton(),
              new VRToggleButton(),
              new SettingsToggleButton({ settingsPanel: settingsPanel }),
              new FullscreenToggleButton(),
            ],
            cssClasses: ['controlbar-bottom']
          }),
        ]
      });

      return new UIContainer({
        components: [
          new SubtitleOverlay(),
          new BufferingOverlay(),
          new PlaybackToggleOverlay(),
          new CastStatusOverlay(),
          controlBar,
          new TitleBar(),
          new RecommendationOverlay(),
          new Watermark(),
          new ErrorMessageOverlay()
        ], cssClasses: ['ui-skin-modern']
      });
    };

    private static modernAdsUI = function() {
      return new UIContainer({
        components: [
          new BufferingOverlay(),
          new AdClickOverlay(),
          new PlaybackToggleOverlay(),
          new Container({
            components: [
              new AdMessageLabel({ text: 'Ad: {remainingTime} secs' }),
              new AdSkipButton()
            ],
            cssClass: 'ui-ads-status'
          }),
          new ControlBar({
            components: [
              new Container({
                components: [
                  new PlaybackToggleButton(),
                  new VolumeToggleButton(),
                  new VolumeSlider(),
                  new Component({ cssClass: 'spacer' }),
                  new FullscreenToggleButton(),
                ],
                cssClasses: ['controlbar-bottom']
              }),
            ]
          })
        ], cssClasses: ['ui-skin-modern', 'ui-skin-ads']
      });
    };

    private static modernSmallScreenUI = function() {
      let settingsPanel = new SettingsPanel({
        components: [
          new SettingsPanelItem('Video Quality', new VideoQualitySelectBox()),
          new SettingsPanelItem('Speed', new PlaybackSpeedSelectBox()),
          new SettingsPanelItem('Audio Track', new AudioTrackSelectBox()),
          new SettingsPanelItem('Audio Quality', new AudioQualitySelectBox()),
          new SettingsPanelItem('Subtitles', new SubtitleSelectBox())
        ],
        hidden: true,
        hideDelay: -1,
      });
      settingsPanel.addComponent(new CloseButton({ target: settingsPanel }));

      let controlBar = new ControlBar({
        components: [
          new Container({
            components: [
              new PlaybackTimeLabel({ timeLabelMode: TimeLabelMode.CurrentTime, hideInLivePlayback: true }),
              new SeekBar({ label: new SeekBarLabel() }),
              new PlaybackTimeLabel({ timeLabelMode: TimeLabelMode.TotalTime, cssClasses: ['text-right'] }),
            ],
            cssClasses: ['controlbar-top']
          }),
        ]
      });

      return new UIContainer({
        components: [
          new SubtitleOverlay(),
          new BufferingOverlay(),
          new PlaybackToggleOverlay(),
          new CastStatusOverlay(),
          controlBar,
          new TitleBar({
            components: [
              new MetadataLabel({ content: MetadataLabelContent.Title }),
              new CastToggleButton(),
              new VRToggleButton(),
              new SettingsToggleButton({ settingsPanel: settingsPanel }),
              new FullscreenToggleButton(),
            ]
          }),
          settingsPanel,
          new RecommendationOverlay(),
          new Watermark(),
          new ErrorMessageOverlay()
        ], cssClasses: ['ui-skin-modern', 'ui-skin-smallscreen']
      });
    };

    private static modernSmallScreenAdsUI = function() {
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
            ]
          }),
          new Container({
            components: [
              new AdMessageLabel({ text: 'Ad: {remainingTime} secs' }),
              new AdSkipButton()
            ],
            cssClass: 'ui-ads-status'
          }),
        ], cssClasses: ['ui-skin-modern', 'ui-skin-ads', 'ui-skin-smallscreen']
      });
    };

    private static modernCastReceiverUI = function() {
      let controlBar = new ControlBar({
        components: [
          new Container({
            components: [
              new PlaybackTimeLabel({ timeLabelMode: TimeLabelMode.CurrentTime, hideInLivePlayback: true }),
              new SeekBar({ label: new SeekBarLabel() }),
              new PlaybackTimeLabel({ timeLabelMode: TimeLabelMode.TotalTime, cssClasses: ['text-right'] }),
            ],
            cssClasses: ['controlbar-top']
          }),
        ]
      });

      return new CastUIContainer({
        components: [
          new SubtitleOverlay(),
          new BufferingOverlay(),
          new PlaybackToggleOverlay(),
          new Watermark(),
          controlBar,
          new TitleBar(),
          new ErrorMessageOverlay()
        ], cssClasses: ['ui-skin-modern', 'ui-skin-cast-receiver']
      });
    };

    static buildModernUI(player: Player, config: UIConfig = {}): UIManager {
      // show smallScreen UI only on mobile/handheld devices
      let smallScreenSwitchWidth = 600;

      return new UIManager(player, [{
        ui: UIManager.Factory.modernSmallScreenAdsUI(),
        condition: function(context: UIConditionContext) {
          return context.isMobile && context.documentWidth < smallScreenSwitchWidth && context.isAdWithUI;
        }
      }, {
        ui: UIManager.Factory.modernAdsUI(),
        condition: function(context: UIConditionContext) {
          return context.isAdWithUI;
        }
      }, {
        ui: UIManager.Factory.modernSmallScreenUI(),
        condition: function(context: UIConditionContext) {
          return context.isMobile && context.documentWidth < smallScreenSwitchWidth;
        }
      }, {
        ui: UIManager.Factory.modernUI()
      }], config);
    }

    static buildModernSmallScreenUI(player: Player, config: UIConfig = {}): UIManager {
      return new UIManager(player, [{
        ui: UIManager.Factory.modernSmallScreenAdsUI(),
        condition: function(context: UIConditionContext) {
          return context.isAdWithUI;
        }
      }, {
        ui: UIManager.Factory.modernSmallScreenUI()
      }], config);
    }

    static buildModernCastReceiverUI(player: Player, config: UIConfig = {}): UIManager {
      return new UIManager(player, UIManager.Factory.modernCastReceiverUI(), config);
    }

    private static legacyUI = function() {
      let settingsPanel = new SettingsPanel({
        components: [
          new SettingsPanelItem('Video Quality', new VideoQualitySelectBox()),
          new SettingsPanelItem('Audio Track', new AudioTrackSelectBox()),
          new SettingsPanelItem('Audio Quality', new AudioQualitySelectBox()),
          new SettingsPanelItem('Subtitles', new SubtitleSelectBox())
        ],
        hidden: true
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
          new FullscreenToggleButton()
        ]
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
          new ErrorMessageOverlay()
        ], cssClasses: ['ui-skin-legacy']
      });
    };

    private static legacyAdsUI = function() {
      return new UIContainer({
        components: [
          new AdClickOverlay(),
          new ControlBar({
            components: [
              new PlaybackToggleButton(),
              new AdMessageLabel(),
              new VolumeControlButton(),
              new FullscreenToggleButton()
            ]
          }),
          new AdSkipButton()
        ], cssClasses: ['ui-skin-legacy', 'ui-skin-ads']
      });
    };

    private static legacyCastReceiverUI = function() {
      let controlBar = new ControlBar({
        components: [
          new SeekBar(),
          new PlaybackTimeLabel(),
        ]
      });

      return new UIContainer({
        components: [
          new SubtitleOverlay(),
          new PlaybackToggleOverlay(),
          new Watermark(),
          controlBar,
          new TitleBar(),
          new ErrorMessageOverlay()
        ], cssClasses: ['ui-skin-legacy', 'ui-skin-cast-receiver']
      });
    };

    private static legacyTestUI = function() {
      let settingsPanel = new SettingsPanel({
        components: [
          new SettingsPanelItem('Video Quality', new VideoQualitySelectBox()),
          new SettingsPanelItem('Audio Track', new AudioTrackSelectBox()),
          new SettingsPanelItem('Audio Quality', new AudioQualitySelectBox()),
          new SettingsPanelItem('Subtitles', new SubtitleSelectBox())
        ],
        hidden: true
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
          new FullscreenToggleButton()
        ]
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
          new ErrorMessageOverlay()
        ], cssClasses: ['ui-skin-legacy']
      });
    };

    static buildLegacyUI(player: Player, config: UIConfig = {}): UIManager {
      return new UIManager(player, [{
        ui: UIManager.Factory.legacyAdsUI(),
        condition: function(context: UIConditionContext) {
          return context.isAdWithUI;
        }
      }, {
        ui: UIManager.Factory.legacyUI()
      }], config);
    }

    static buildLegacyCastReceiverUI(player: Player, config: UIConfig = {}): UIManager {
      return new UIManager(player, UIManager.Factory.legacyCastReceiverUI(), config);
    }

    static buildLegacyTestUI(player: Player, config: UIConfig = {}): UIManager {
      return new UIManager(player, UIManager.Factory.legacyTestUI(), config);
    }
  };
}

export interface SeekPreviewArgs extends NoArgs {
  /**
   * The timeline position in percent where the event originates from.
   */
  position: number;
  /**
   * The timeline marker associated with the current position, if existing.
   */
  marker?: TimelineMarker;
}

/**
 * Encapsulates functionality to manage a UI instance. Used by the {@link UIManager} to manage multiple UI instances.
 */
export class UIInstanceManager {
  private playerWrapper: PlayerWrapper;
  private ui: UIContainer;
  private config: UIConfig;

  private events = {
    onConfigured: new EventDispatcher<UIContainer, NoArgs>(),
    onSeek: new EventDispatcher<SeekBar, NoArgs>(),
    onSeekPreview: new EventDispatcher<SeekBar, SeekPreviewArgs>(),
    onSeeked: new EventDispatcher<SeekBar, NoArgs>(),
    onComponentShow: new EventDispatcher<Component<ComponentConfig>, NoArgs>(),
    onComponentHide: new EventDispatcher<Component<ComponentConfig>, NoArgs>(),
    onControlsShow: new EventDispatcher<UIContainer, NoArgs>(),
    onControlsHide: new EventDispatcher<UIContainer, NoArgs>(),
  };

  constructor(player: Player, ui: UIContainer, config: UIConfig = {}) {
    this.playerWrapper = new PlayerWrapper(player);
    this.ui = ui;
    this.config = config;
  }

  getConfig(): UIConfig {
    return this.config;
  }

  getUI(): UIContainer {
    return this.ui;
  }

  getPlayer(): WrappedPlayer {
    return this.playerWrapper.getPlayer();
  }

  /**
   * Fires when the UI is fully configured and added to the DOM.
   * @returns {EventDispatcher}
   */
  get onConfigured(): EventDispatcher<UIContainer, NoArgs> {
    return this.events.onConfigured;
  }

  /**
   * Fires when a seek starts.
   * @returns {EventDispatcher}
   */
  get onSeek(): EventDispatcher<SeekBar, NoArgs> {
    return this.events.onSeek;
  }

  /**
   * Fires when the seek timeline is scrubbed.
   * @returns {EventDispatcher}
   */
  get onSeekPreview(): EventDispatcher<SeekBar, SeekPreviewArgs> {
    return this.events.onSeekPreview;
  }

  /**
   * Fires when a seek is finished.
   * @returns {EventDispatcher}
   */
  get onSeeked(): EventDispatcher<SeekBar, NoArgs> {
    return this.events.onSeeked;
  }

  /**
   * Fires when a component is showing.
   * @returns {EventDispatcher}
   */
  get onComponentShow(): EventDispatcher<Component<ComponentConfig>, NoArgs> {
    return this.events.onComponentShow;
  }

  /**
   * Fires when a component is hiding.
   * @returns {EventDispatcher}
   */
  get onComponentHide(): EventDispatcher<Component<ComponentConfig>, NoArgs> {
    return this.events.onComponentHide;
  }

  /**
   * Fires when the UI controls are showing.
   * @returns {EventDispatcher}
   */
  get onControlsShow(): EventDispatcher<UIContainer, NoArgs> {
    return this.events.onControlsShow;
  }

  /**
   * Fires when the UI controls are hiding.
   * @returns {EventDispatcher}
   */
  get onControlsHide(): EventDispatcher<UIContainer, NoArgs> {
    return this.events.onControlsHide;
  }

  protected clearEventHandlers(): void {
    this.playerWrapper.clearEventHandlers();

    let events = <any>this.events; // avoid TS7017
    for (let event in events) {
      let dispatcher = <EventDispatcher<Object, Object>>events[event];
      dispatcher.unsubscribeAll();
    }
  }
}

/**
 * Extends the {@link UIInstanceManager} for internal use in the {@link UIManager} and provides access to functionality
 * that components receiving a reference to the {@link UIInstanceManager} should not have access to.
 */
class InternalUIInstanceManager extends UIInstanceManager {

  private configured: boolean;
  private released: boolean;

  configureControls(): void {
    this.configureControlsTree(this.getUI());
    this.configured = true;
  }

  isConfigured(): boolean {
    return this.configured;
  }

  private configureControlsTree(component: Component<ComponentConfig>) {
    let self = this;
    let configuredComponents: Component<ComponentConfig>[] = [];

    // Define the actual recursive function within this function body so we can use local variables
    // (e.g. the configuredComponents array).
    let recursiveTreeWalker = function(component: Component<ComponentConfig>) {
      // First, check if we have already configured a component, and throw an error if we did. Multiple configuration
      // of the same component leads to unexpected UI behavior. Also, a component that is in the UI tree multiple
      // times hints at a wrong UI structure.
      // We could just skip configuration in such a case and not throw an exception, but enforcing a clean UI tree
      // seems like the better choice.
      for (let configuredComponent of configuredComponents) {
        if (configuredComponent === component) {
          // Write the component to the console to simplify identification of the culprit
          // (e.g. by inspecting the config)
          if (console) {
            console.error('Circular reference in UI tree', component);
          }

          // Additionally throw an error, because this case must not happen and leads to unexpected UI behavior.
          throw Error('Circular reference in UI tree: ' + component.constructor.name);
        }
      }

      component.initialize();
      component.configure(self.getPlayer(), self);
      configuredComponents.push(component);

      // If the current component is a container, visit it's children
      if (component instanceof Container) {
        for (let childComponent of component.getComponents()) {
          recursiveTreeWalker(childComponent);
        }
      }
    };

    // Walk and configure the component tree
    recursiveTreeWalker(component);
  }

  releaseControls(): void {
    // Do not call release methods if the components have never been configured; this can result in exceptions
    if (this.configured) {
      this.releaseControlsTree(this.getUI());
      this.configured = false;
    }
    this.released = true;
  }

  isReleased(): boolean {
    return this.released;
  }

  private releaseControlsTree(component: Component<ComponentConfig>) {
    component.release();

    if (component instanceof Container) {
      for (let childComponent of component.getComponents()) {
        this.releaseControlsTree(childComponent);
      }
    }
  }

  clearEventHandlers(): void {
    super.clearEventHandlers();
  }
}

/**
 * Extended interface of the {@link Player} for use in the UI.
 */
interface WrappedPlayer extends Player {
  /**
   * Fires an event on the player that targets all handlers in the UI but never enters the real player.
   * @param event the event to fire
   * @param data data to send with the event
   */
  fireEventInUI(event: EVENT, data: {}): void;
}

/**
 * Wraps the player to track event handlers and provide a simple method to remove all registered event
 * handlers from the player.
 */
class PlayerWrapper {

  private player: Player;
  private wrapper: WrappedPlayer;

  private eventHandlers: { [eventType: string]: PlayerEventCallback[]; } = {};

  constructor(player: Player) {
    this.player = player;

    let self = this;

    // Collect all public API methods of the player
    let methods = <any[]>[];
    for (let member in player) {
      if (typeof (<any>player)[member] === 'function') {
        methods.push(member);
      }
    }

    // Create wrapper object and add function wrappers for all API methods that do nothing but calling the base method
    // on the player
    let wrapper = <any>{};
    for (let member of methods) {
      wrapper[member] = function() {
        // console.log('called ' + member); // track method calls on the player
        return (<any>player)[member].apply(player, arguments);
      };
    }

    // Collect all public properties of the player and add it to the wrapper
    for (let member in player) {
      if (typeof (<any>player)[member] !== 'function') {
        wrapper[member] = (<any>player)[member];
      }
    }

    // Explicitly add a wrapper method for 'addEventHandler' that adds added event handlers to the event list
    wrapper.addEventHandler = function(eventType: EVENT, callback: PlayerEventCallback): Player {
      player.addEventHandler(eventType, callback);

      if (!self.eventHandlers[eventType]) {
        self.eventHandlers[eventType] = [];
      }

      self.eventHandlers[eventType].push(callback);

      return wrapper;
    };

    // Explicitly add a wrapper method for 'removeEventHandler' that removes removed event handlers from the event list
    wrapper.removeEventHandler = function(eventType: EVENT, callback: PlayerEventCallback): Player {
      player.removeEventHandler(eventType, callback);

      if (self.eventHandlers[eventType]) {
        ArrayUtils.remove(self.eventHandlers[eventType], callback);
      }

      return wrapper;
    };

    wrapper.fireEventInUI = function(event: EVENT, data: {}): void {
      if (self.eventHandlers[event]) { // check if there are handlers for this event registered
        // Extend the data object with default values to convert it to a {@link PlayerEvent} object.
        let playerEventData = <PlayerEvent>Object.assign({}, {
          timestamp: Date.now(),
          type: event,
          // Add a marker property so the UI can detect UI-internal player events
          uiSourced: true,
        }, data);

        // Execute the registered callbacks
        for (let callback of self.eventHandlers[event]) {
          callback(playerEventData);
        }
      }
    };

    this.wrapper = <WrappedPlayer>wrapper;
  }

  /**
   * Returns a wrapped player object that can be used on place of the normal player object.
   * @returns {WrappedPlayer} a wrapped player
   */
  getPlayer(): WrappedPlayer {
    return this.wrapper;
  }

  /**
   * Clears all registered event handlers from the player that were added through the wrapped player.
   */
  clearEventHandlers(): void {
    for (let eventType in this.eventHandlers) {
      for (let callback of this.eventHandlers[eventType]) {
        this.player.removeEventHandler(eventType, callback);
      }
    }
  }
}
