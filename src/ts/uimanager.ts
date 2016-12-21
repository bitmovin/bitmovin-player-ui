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
import {HugePlaybackToggleButton} from './components/hugeplaybacktogglebutton';
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

export interface UIRecommendationConfig {
  title: string;
  url: string;
  thumbnail?: string;
  duration?: number;
}

export interface UIConfig {
  metadata?: {
    title?: string
  };
  recommendations?: UIRecommendationConfig[];
}

export class UIManager {

  private player: Player;
  private playerElement: DOM;
  private playerUi: UIContainer;
  private adsUi: UIContainer;
  private config: UIConfig;

  private managerPlayerWrapper: PlayerWrapper;
  private uiPlayerWrappers: PlayerWrapper[] = [];

  private events = {
    /**
     * Fires when the mouse enters the UI area.
     */
    onMouseEnter   : new EventDispatcher<Component<ComponentConfig>, NoArgs>(),
    /**
     * Fires when the mouse moves inside the UI area.
     */
    onMouseMove    : new EventDispatcher<Component<ComponentConfig>, NoArgs>(),
    /**
     * Fires when the mouse leaves the UI area.
     */
    onMouseLeave   : new EventDispatcher<Component<ComponentConfig>, NoArgs>(),
    /**
     * Fires when a seek starts.
     */
    onSeek         : new EventDispatcher<SeekBar, NoArgs>(),
    /**
     * Fires when the seek timeline is scrubbed.
     */
    onSeekPreview  : new EventDispatcher<SeekBar, number>(),
    /**
     * Fires when a seek is finished.
     */
    onSeeked       : new EventDispatcher<SeekBar, NoArgs>(),
    /**
     * Fires when a component is showing.
     */
    onComponentShow: new EventDispatcher<Component<ComponentConfig>, NoArgs>(),
    /**
     * Fires when a component is hiding.
     */
    onComponentHide: new EventDispatcher<Component<ComponentConfig>, NoArgs>(),
  };

  constructor(player: Player, playerUi: UIContainer, adsUi: UIContainer, config: UIConfig = {}) {
    this.player   = player;
    this.playerUi = playerUi;
    this.adsUi    = adsUi;
    this.config   = config;

    if (!config.metadata) {
      config.metadata = {
        title: player.getConfig().source ? player.getConfig().source.title : null
      };
    }

    this.managerPlayerWrapper = new PlayerWrapper(player);

    this.playerElement = new DOM(player.getFigure());

    // Add UI elements to player
    this.addUi(playerUi);

    // Ads UI
    if (adsUi) {
      this.addUi(adsUi);
      adsUi.hide();

      let enterAdsUi = function(event: AdStartedEvent) {
        playerUi.hide();

        // Display the ads UI (only for VAST ads, other clients bring their own UI)
        if (event.clientType === 'vast') {
          adsUi.show();
        }
      };

      let exitAdsUi = function() {
        adsUi.hide();
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

  private configureControls(component: Component<ComponentConfig>) {
    let playerWrapper = this.uiPlayerWrappers[<any>component];

    component.initialize();
    component.configure(playerWrapper.getPlayer(), this);

    if (component instanceof Container) {
      for (let childComponent of component.getComponents()) {
        this.configureControls(childComponent);
      }
    }
  }

  get onMouseEnter(): EventDispatcher<Component<ComponentConfig>, NoArgs> {
    return this.events.onMouseEnter;
  }

  get onMouseMove(): EventDispatcher<Component<ComponentConfig>, NoArgs> {
    return this.events.onMouseMove;
  }

  get onMouseLeave(): EventDispatcher<Component<ComponentConfig>, NoArgs> {
    return this.events.onMouseLeave;
  }

  get onSeek(): EventDispatcher<SeekBar, NoArgs> {
    return this.events.onSeek;
  }

  get onSeekPreview(): EventDispatcher<SeekBar, number> {
    return this.events.onSeekPreview;
  }

  get onSeeked(): EventDispatcher<SeekBar, NoArgs> {
    return this.events.onSeeked;
  }

  get onComponentShow(): EventDispatcher<Component<ComponentConfig>, NoArgs> {
    return this.events.onComponentShow;
  }

  get onComponentHide(): EventDispatcher<Component<ComponentConfig>, NoArgs> {
    return this.events.onComponentHide;
  }

  private addUi(ui: UIContainer): void {
    this.playerElement.append(ui.getDomElement());
    this.uiPlayerWrappers[<any>ui] = new PlayerWrapper(this.player);
    this.configureControls(ui);
  }

  private releaseUi(ui: UIContainer): void {
    ui.getDomElement().remove();
    this.uiPlayerWrappers[<any>ui].clearEventHandlers();
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

    static buildModernUI(player: Player, config: UIConfig = {}): UIManager {
      let settingsPanel = new SettingsPanel({
        components: [
          new SettingsPanelItem('Video Quality', new VideoQualitySelectBox()),
          new SettingsPanelItem('Speed', new PlaybackSpeedSelectBox()),
          new SettingsPanelItem('Audio Track', new AudioTrackSelectBox()),
          new SettingsPanelItem('Audio Quality', new AudioQualitySelectBox()),
          new SettingsPanelItem('Subtitles', new SubtitleSelectBox())
        ],
        hidden    : true
      });

      let controlBar = new ControlBar({
        components: [
          settingsPanel,
          new Container({
            components: [
              new PlaybackTimeLabel({timeLabelMode: TimeLabelMode.CurrentTime, hideInLivePlayback: true}),
              new SeekBar({label: new SeekBarLabel()}),
              new PlaybackTimeLabel({timeLabelMode: TimeLabelMode.TotalTime, cssClasses: ['text-right']}),
            ],
            cssClasses: ['controlbar-top']
          }),
          new Container({
            components: [
              new PlaybackToggleButton(),
              new VolumeToggleButton(),
              new VolumeSlider(),
              new Component({cssClass: 'spacer'}),
              new CastToggleButton(),
              new VRToggleButton(),
              new SettingsToggleButton({settingsPanel: settingsPanel}),
              new FullscreenToggleButton(),
            ],
            cssClasses: ['controlbar-bottom']
          }),
        ]
      });

      let ui = new UIContainer({
        components   : [
          new SubtitleOverlay(),
          new CastStatusOverlay(),
          new HugePlaybackToggleButton(),
          controlBar,
          new TitleBar(),
          new RecommendationOverlay(),
          new Watermark(),
          new ErrorMessageOverlay()
        ], cssClasses: ['ui-skin-modern']
      });

      let adsUi = new UIContainer({
        components   : [
          new AdClickOverlay(),
          new Container({
            components: [
              new AdMessageLabel({text: 'Ad: {remainingTime} secs'}),
              new AdSkipButton()
            ],
            cssClass  : 'ui-ads-status'
          }),
          new ControlBar({
            components: [
              new Container({
                components: [
                  new PlaybackToggleButton(),
                  new VolumeToggleButton(),
                  new VolumeSlider(),
                  new Component({cssClass: 'spacer'}),
                  new FullscreenToggleButton(),
                ],
                cssClasses: ['controlbar-bottom']
              }),
            ]
          })
        ], cssClasses: ['ui-skin-modern ads']
      });

      return new UIManager(player, ui, adsUi, config);
    }

    static buildModernCastReceiverUI(player: Player, config: UIConfig = {}): UIManager {
      let controlBar = new ControlBar({
        components: [
          new Container({
            components: [
              new PlaybackTimeLabel({timeLabelMode: TimeLabelMode.CurrentTime, hideInLivePlayback: true}),
              new SeekBar({label: new SeekBarLabel()}),
              new PlaybackTimeLabel({timeLabelMode: TimeLabelMode.TotalTime, cssClasses: ['text-right']}),
            ],
            cssClasses: ['controlbar-top']
          }),
        ]
      });

      let ui = new UIContainer({
        components   : [
          new SubtitleOverlay(),
          new HugePlaybackToggleButton(),
          new Watermark(),
          controlBar,
          new TitleBar(),
          new ErrorMessageOverlay()
        ], cssClasses: ['ui-skin-modern ui-skin-modern-cast-receiver']
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
        hidden    : true
      });

      let controlBar = new ControlBar({
        components: [
          settingsPanel,
          new PlaybackToggleButton(),
          new SeekBar({label: new SeekBarLabel()}),
          new PlaybackTimeLabel(),
          new VRToggleButton(),
          new VolumeControlButton(),
          new SettingsToggleButton({settingsPanel: settingsPanel}),
          new CastToggleButton(),
          new FullscreenToggleButton()
        ]
      });

      let ui = new UIContainer({
        components   : [
          new SubtitleOverlay(),
          new CastStatusOverlay(),
          new HugePlaybackToggleButton(),
          new Watermark(),
          new RecommendationOverlay(),
          controlBar,
          new TitleBar(),
          new ErrorMessageOverlay()
        ], cssClasses: ['ui-skin-legacy']
      });

      let adsUi = new UIContainer({
        components   : [
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
        ], cssClasses: ['ui-skin-legacy ads']
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
        components   : [
          new SubtitleOverlay(),
          new HugePlaybackToggleButton(),
          new Watermark(),
          controlBar,
          new TitleBar(),
          new ErrorMessageOverlay()
        ], cssClasses: ['ui-skin-legacy ui-skin-legacy-cast-receiver']
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
        hidden    : true
      });

      let controlBar = new ControlBar({
        components: [settingsPanel,
          new PlaybackToggleButton(),
          new SeekBar({label: new SeekBarLabel()}),
          new PlaybackTimeLabel(),
          new VRToggleButton(),
          new VolumeToggleButton(),
          new VolumeSlider(),
          new VolumeControlButton(),
          new VolumeControlButton({vertical: false}),
          new SettingsToggleButton({settingsPanel: settingsPanel}),
          new CastToggleButton(),
          new FullscreenToggleButton()
        ]
      });

      let ui = new UIContainer({
        components   : [
          new SubtitleOverlay(),
          new CastStatusOverlay(),
          new HugePlaybackToggleButton(),
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

/**
 * Wraps the player to track event handlers and provide a simple method to remove all registered event
 * handlers from the player.
 */
class PlayerWrapper {

  private player: Player;
  private wrapper: Player;

  private eventHandlers: {[eventType: string]: PlayerEventCallback[];} = {};

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

    this.wrapper = <Player>wrapper;
  }

  /**
   * Returns a wrapped player object that can be used on place of the normal player object.
   * @returns {Player} a wrapped player
   */
  getPlayer(): Player {
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