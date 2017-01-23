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

export class UIManager {

  private player: Player;
  private playerElement: DOM;
  private playerUi: InternalUIInstanceManager;
  private adsUi: InternalUIInstanceManager;
  private config: UIConfig;
  private managerPlayerWrapper: PlayerWrapper;

  constructor(player: Player, playerUi: UIContainer, adsUi: UIContainer, config: UIConfig = {}) {
    this.player = player;
    this.config = config;

    if (!config.metadata) {
      config.metadata = {
        title: player.getConfig().source ? player.getConfig().source.title : null,
        description: player.getConfig().source ? player.getConfig().source.description : null,
      };
    }

    this.playerUi = new InternalUIInstanceManager(player, playerUi, config);

    this.managerPlayerWrapper = new PlayerWrapper(player);

    this.playerElement = new DOM(player.getFigure());

    // Add UI elements to player
    this.addUi(this.playerUi);

    let self = this;

    // Ads UI
    if (adsUi) {
      this.adsUi = new InternalUIInstanceManager(player, adsUi, config);
      let adsUiAdded = false;

      let enterAdsUi = function(event: AdStartedEvent) {
        playerUi.hide();

        // Display the ads UI (only for VAST ads, other clients bring their own UI)
        if (event.clientType === 'vast') {
          // Add ads UI when it is needed for the first time
          if (!adsUiAdded) {
            self.addUi(self.adsUi);
            adsUiAdded = true;

            /* Relay the ON_AD_STARTED event to the ads UI
             *
             * Because the ads UI is initialized in the ON_AD_STARTED handler, i.e. when the ON_AD_STARTED event has
             * already been fired, components in the ads UI that listen for the ON_AD_STARTED event never receive it.
             * Since this can break functionality of components that rely on this event, we relay the event to the
             * ads UI components with the following call.
             */
            self.adsUi.getPlayer().fireEventInUI(bitmovin.player.EVENT.ON_AD_STARTED, event);
          }

          adsUi.show();
        }
      };

      let exitAdsUi = function() {
        if (adsUiAdded) {
          adsUi.hide();
        }
        playerUi.show();
      };

      // React to ad events from the player
      this.managerPlayerWrapper.getPlayer().addEventHandler(EVENT.ON_AD_STARTED, enterAdsUi);
      this.managerPlayerWrapper.getPlayer().addEventHandler(EVENT.ON_AD_FINISHED, exitAdsUi);
      this.managerPlayerWrapper.getPlayer().addEventHandler(EVENT.ON_AD_SKIPPED, exitAdsUi);
      this.managerPlayerWrapper.getPlayer().addEventHandler(EVENT.ON_AD_ERROR, exitAdsUi);
    }
  }

  getConfig(): UIConfig {
    return this.config;
  }

  private configureControls(component: Component<ComponentConfig>, manager: UIInstanceManager) {
    component.initialize();
    component.configure(manager.getPlayer(), manager);

    if (component instanceof Container) {
      for (let childComponent of component.getComponents()) {
        this.configureControls(childComponent, manager);
      }
    }
  }

  private addUi(ui: InternalUIInstanceManager): void {
    let dom = ui.getUI().getDomElement();
    this.configureControls(ui.getUI(), ui);
    /* Append the UI DOM after configuration to avoid CSS transitions at initialization
     * Example: Components are hidden during configuration and these hides may trigger CSS transitions that are
     * undesirable at this time. */
    this.playerElement.append(dom);
  }

  private releaseUi(ui: InternalUIInstanceManager): void {
    ui.getUI().getDomElement().remove();
    ui.clearEventHandlers();
  }

  release(): void {
    this.releaseUi(this.playerUi);
    if (this.adsUi) {
      this.releaseUi(this.adsUi);
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

    static buildModernUI(player: Player, config: UIConfig = {}): UIManager {
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

      let ui = new UIContainer({
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

      let adsUi = new UIContainer({
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

      return new UIManager(player, ui, adsUi, config);
    }

    static buildModernSmallScreenUI(player: Player, config: UIConfig = {}): UIManager {
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

      let ui = new UIContainer({
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

      let adsUi = new UIContainer({
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

      return new UIManager(player, ui, adsUi, config);
    }

    static buildModernCastReceiverUI(player: Player, config: UIConfig = {}): UIManager {
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

      let ui = new CastUIContainer({
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

      return new UIManager(player, ui, null, config);
    }

    static buildLegacyUI(player: Player, config: UIConfig = {}): UIManager {
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

      let ui = new UIContainer({
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

      let adsUi = new UIContainer({
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

      return new UIManager(player, ui, adsUi, config);
    }

    static buildLegacyCastReceiverUI(player: Player, config: UIConfig = {}): UIManager {
      let controlBar = new ControlBar({
        components: [
          new SeekBar(),
          new PlaybackTimeLabel(),
        ]
      });

      let ui = new UIContainer({
        components: [
          new SubtitleOverlay(),
          new PlaybackToggleOverlay(),
          new Watermark(),
          controlBar,
          new TitleBar(),
          new ErrorMessageOverlay()
        ], cssClasses: ['ui-skin-legacy', 'ui-skin-cast-receiver']
      });

      return new UIManager(player, ui, null, config);
    }

    static buildLegacyTestUI(player: Player, config: UIConfig = {}): UIManager {
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

      let ui = new UIContainer({
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

      return new UIManager(player, ui, null, config);
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