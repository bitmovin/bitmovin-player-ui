import {UIContainer} from './components/uicontainer';
import {DOM} from './dom';
import {Component, ComponentConfig} from './components/component';
import {Container} from './components/container';
import { SeekBar, SeekBarMarker } from './components/seekbar';
import {NoArgs, EventDispatcher, CancelEventArgs} from './eventdispatcher';
import {UIUtils} from './uiutils';
import {ArrayUtils} from './arrayutils';
import {BrowserUtils} from './browserutils';
import { TimelineMarker, UIConfig } from './uiconfig';
import { PlayerAPI, PlayerEventCallback, PlayerEventBase, PlayerEvent, AdEvent, LinearAd } from 'bitmovin-player';
import { VolumeController } from './volumecontroller';
import { i18n, CustomVocabulary, Vocabularies } from './localization/i18n';
import { FocusVisibilityTracker } from './focusvisibilitytracker';
import { isMobileV3PlayerAPI, MobileV3PlayerAPI, MobileV3PlayerEvent } from './mobilev3playerapi';
import { SpatialNavigation } from './spatialnavigation/spatialnavigation';
import { StorageUtils } from './storageutils';

export interface LocalizationConfig {
  /**
   * Sets the desired language, and falls back to 'en' if there is no vocabulary for the desired language. Setting it
   * to "auto" will enable language detection from the browser's locale.
   */
  language?: 'auto' | 'en' | 'de' | string;
  /**
   * A map of `language` to {@link CustomVocabulary} definitions. Can be used to overwrite default translations and add
   * custom strings or additional languages.
   */
  vocabularies?: Vocabularies;
}

export interface InternalUIConfig extends UIConfig {
  events: {
    /**
     * Fires when the configuration has been updated/changed.
     */
    onUpdated: EventDispatcher<UIManager, void>;
  };
  volumeController: VolumeController;
}

/**
 * The context that will be passed to a {@link UIConditionResolver} to determine if it's conditions fulfil the context.
 */
export interface UIConditionContext {
  /**
   * Tells if the player is loading or playing an ad.
   */
  isAd: boolean;
  /**
   * Tells if the current ad requires an external UI, if {@link #isAd} is true.
   */
  adRequiresUi: boolean;
  /**
   * Tells if the player is currently in fullscreen mode.
   */
  isFullscreen: boolean;
  /**
   * Tells if the UI is running in a mobile browser.
   */
  isMobile: boolean;
  /**
   * Tells if the player is in playing or paused state.
   */
  isPlaying: boolean;
  /**
   * The width of the player/UI element.
   */
  width: number;
  /**
   * The width of the document where the player/UI is embedded in.
   */
  documentWidth: number;
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
  spatialNavigation?: SpatialNavigation;
}

export interface ActiveUiChangedArgs extends NoArgs {
  /**
   * The previously active {@link UIInstanceManager} prior to the {@link UIManager} switching to a different UI variant.
   */
  previousUi: UIInstanceManager;
  /**
   * The currently active {@link UIInstanceManager}.
   */
  currentUi: UIInstanceManager;
}

export class UIManager {

  private player: PlayerAPI;
  private uiContainerElement: DOM;
  private uiVariants: UIVariant[];
  private uiInstanceManagers: InternalUIInstanceManager[];
  private currentUi: InternalUIInstanceManager;
  private config: InternalUIConfig; // Conjunction of provided uiConfig and sourceConfig from the player
  private managerPlayerWrapper: PlayerWrapper;
  private focusVisibilityTracker: FocusVisibilityTracker;

  private events = {
    onUiVariantResolve: new EventDispatcher<UIManager, UIConditionContext>(),
    onActiveUiChanged: new EventDispatcher<UIManager, ActiveUiChangedArgs>(),
  };

  /**
   * Creates a UI manager with a single UI variant that will be permanently shown.
   * @param player the associated player of this UI
   * @param ui the UI to add to the player
   * @param uiconfig optional UI configuration
   */
  constructor(player: PlayerAPI, ui: UIContainer, uiconfig?: UIConfig);
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
   * @param uiconfig optional UI configuration
   */
  constructor(player: PlayerAPI, uiVariants: UIVariant[], uiconfig?: UIConfig);
  constructor(player: PlayerAPI, playerUiOrUiVariants: UIContainer | UIVariant[], uiconfig: UIConfig = {}) {
    if (playerUiOrUiVariants instanceof UIContainer) {
      // Single-UI constructor has been called, transform arguments to UIVariant[] signature
      let playerUi = <UIContainer>playerUiOrUiVariants;
      let uiVariants = [];

      // Add the default player UI
      uiVariants.push({ ui: playerUi });

      this.uiVariants = uiVariants;
    }
    else {
      // Default constructor (UIVariant[]) has been called
      this.uiVariants = <UIVariant[]>playerUiOrUiVariants;
    }

    StorageUtils.resolveStorageAccess(uiconfig);
    this.player = player;
    this.managerPlayerWrapper = new PlayerWrapper(player);

    // ensure that at least the metadata object does exist in the uiconfig
    uiconfig.metadata = uiconfig.metadata ? uiconfig.metadata : {};

    this.config = {
      playbackSpeedSelectionEnabled: true, // Switch on speed selector by default
      autoUiVariantResolve: true, // Switch on auto UI resolving by default
      disableAutoHideWhenHovered: false, // Disable auto hide when UI is hovered
      enableSeekPreview: true,
      ...uiconfig,
      events: {
        onUpdated: new EventDispatcher<UIManager, void>(),
      },
      volumeController: new VolumeController(this.managerPlayerWrapper.getPlayer()),
    };

    /**
     * Gathers configuration data from the UI config and player source config and creates a merged UI config
     * that is used throughout the UI instance.
     */
    const updateConfig = () => {
      const playerSourceConfig = player.getSource() || {};
      this.config.metadata = JSON.parse(JSON.stringify(uiconfig.metadata || {}));

      // Extract the UI-related config properties from the source config
      const playerSourceUiConfig: UIConfig = {
        metadata: {
          // TODO move metadata into source.metadata namespace in player v8
          title: playerSourceConfig.title,
          description: playerSourceConfig.description,
          markers: (playerSourceConfig as any).markers,
        },
        recommendations: (playerSourceConfig as any).recommendations,
      };

      // Player source config takes precedence over the UI config, because the config in the source is attached
      // to a source which changes with every player.load, whereas the UI config stays the same for the whole
      // lifetime of the player instance.
      this.config.metadata.title = playerSourceUiConfig.metadata.title || uiconfig.metadata.title;
      this.config.metadata.description = playerSourceUiConfig.metadata.description || uiconfig.metadata.description;
      this.config.metadata.markers = playerSourceUiConfig.metadata.markers || uiconfig.metadata.markers || [];
      this.config.recommendations = playerSourceUiConfig.recommendations || uiconfig.recommendations || [];
    };

    updateConfig();

    // Update the source configuration when a new source is loaded and dispatch onUpdated
    const updateSource = () => {
      updateConfig();
      this.config.events.onUpdated.dispatch(this);
    };

    const wrappedPlayer = this.managerPlayerWrapper.getPlayer();

    wrappedPlayer.on(this.player.exports.PlayerEvent.SourceLoaded, updateSource);

    // The PlaylistTransition event is only available on Mobile v3 for now.
    // This event is fired when a new source becomes active in the player.
    if (isMobileV3PlayerAPI(wrappedPlayer)) {
      wrappedPlayer.on(MobileV3PlayerEvent.PlaylistTransition, updateSource);
    }

    if (uiconfig.container) {
      // Unfortunately "uiContainerElement = new DOM(config.container)" will not accept the container with
      // string|HTMLElement type directly, although it accepts both types, so we need to spit these two cases up here.
      // TODO check in upcoming TS versions if the container can be passed in directly, or fix the constructor
      this.uiContainerElement = uiconfig.container instanceof HTMLElement ?
        new DOM(uiconfig.container) : new DOM(uiconfig.container);
    } else {
      this.uiContainerElement = new DOM(player.getContainer());
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
      this.uiInstanceManagers.push(new InternalUIInstanceManager(
        player,
        uiVariant.ui,
        this.config,
        uiVariant.spatialNavigation,
      ));
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
      && uiVariantsWithoutCondition[0] !== this.uiVariants[this.uiVariants.length - 1]) {
      throw Error('Invalid UI variant order: the default UI (without condition) must be at the end of the list');
    }

    let adStartedEvent: AdEvent = null; // keep the event stored here during ad playback

    // Dynamically select a UI variant that matches the current UI condition.
    let resolveUiVariant = (event: PlayerEventBase) => {
      // Make sure that the AdStarted event data is persisted through ad playback in case other events happen
      // in the meantime, e.g. player resize. We need to store this data because there is no other way to find out
      // ad details while an ad is playing (in v8.0 at least; from v8.1 there will be ads.getActiveAd()).
      // Existing event data signals that an ad is currently active (instead of ads.isLinearAdActive()).
      if (event != null) {
        switch (event.type) {
          // The ads UI is shown upon the first AdStarted event. Subsequent AdStarted events within an ad break
          // will not change the condition context and thus not lead to undesired UI variant resolving.
          // The ads UI is shown upon AdStarted instead of AdBreakStarted because there can be a loading delay
          // between these two events in the player, and the AdBreakStarted event does not carry any metadata to
          // initialize the ads UI, so it would be rendered in an uninitialized state for a certain amount of time.
          // TODO show ads UI upon AdBreakStarted and display loading overlay between AdBreakStarted and first AdStarted
          // TODO display loading overlay between AdFinished and next AdStarted
          case player.exports.PlayerEvent.AdStarted:
            adStartedEvent = event as AdEvent;
            break;
          // The ads UI is hidden only when the ad break is finished, i.e. not on AdFinished events. This way we keep
          // the ads UI variant active throughout an ad break, as reacting to AdFinished would lead to undesired UI
          // variant switching between two ads in an ad break, e.g. ads UI -> AdFinished -> content UI ->
          // AdStarted -> ads UI.
          case player.exports.PlayerEvent.AdBreakFinished:
            adStartedEvent = null;
            // When switching to a variant for the first time, a config.events.onUpdated event is fired to trigger a UI
            // update of the new variant, because most components subscribe to this event to update themselves. When
            // switching to the ads UI on the first AdStarted, all UI variants update themselves with the ad data, so
            // when switching back to the "normal" UI it will carry properties of the ad instead of the main content.
            // We thus fire this event here to force an UI update with the properties of the main content. This is
            // basically a hack because the config.events.onUpdated event is abused in many places and not just used
            // for config updates (e.g. adding a marker to the seekbar).
            // TODO introduce an event that is fired when the playback content is updated, a switch to/from ads
            this.config.events.onUpdated.dispatch(this);
            break;
          // When a new source is loaded during ad playback, there will be no Ad(Break)Finished event
          case player.exports.PlayerEvent.SourceLoaded:
          case player.exports.PlayerEvent.SourceUnloaded:
            adStartedEvent = null;
            break;
        }
      }

      // Detect if an ad has started
      let isAd = adStartedEvent != null;
      let adRequiresUi = false;
      if (isAd) {
        let ad = adStartedEvent.ad;
        // for now only linear ads can request a UI
        if (ad.isLinear) {
          let linearAd = ad as LinearAd;
          adRequiresUi = linearAd.uiConfig && linearAd.uiConfig.requestsUi || false;
        }
      }

      if (adRequiresUi) {
        // we dispatch onUpdated event because if there are multiple adBreaks for same position
        // `Play` and `Playing` events will not be dispatched which will cause `PlaybackButton` state
        // to be out of sync
        this.config.events.onUpdated.dispatch(this);
      }

      this.resolveUiVariant({
        isAd: isAd,
        adRequiresUi: adRequiresUi,
      }, (context) => {
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
          this.currentUi.getWrappedPlayer().fireEventInUI(this.player.exports.PlayerEvent.AdStarted, adStartedEvent);
        }
      });
    };

    // Listen to the following events to trigger UI variant resolution
    if (this.config.autoUiVariantResolve) {
      this.managerPlayerWrapper.getPlayer().on(this.player.exports.PlayerEvent.SourceLoaded, resolveUiVariant);
      this.managerPlayerWrapper.getPlayer().on(this.player.exports.PlayerEvent.SourceUnloaded, resolveUiVariant);
      this.managerPlayerWrapper.getPlayer().on(this.player.exports.PlayerEvent.Play, resolveUiVariant);
      this.managerPlayerWrapper.getPlayer().on(this.player.exports.PlayerEvent.Paused, resolveUiVariant);
      this.managerPlayerWrapper.getPlayer().on(this.player.exports.PlayerEvent.AdStarted, resolveUiVariant);
      this.managerPlayerWrapper.getPlayer().on(this.player.exports.PlayerEvent.AdBreakFinished, resolveUiVariant);
      this.managerPlayerWrapper.getPlayer().on(this.player.exports.PlayerEvent.PlayerResized, resolveUiVariant);
      this.managerPlayerWrapper.getPlayer().on(this.player.exports.PlayerEvent.ViewModeChanged, resolveUiVariant);
    }

    this.focusVisibilityTracker = new FocusVisibilityTracker('{{PREFIX}}');

    // Initialize the UI
    resolveUiVariant(null);
  }

  /**
   * Exposes i18n.getLocalizer() function
   * @returns {I18nApi.getLocalizer()}
   */
  static localize<V extends CustomVocabulary<Record<string, string>>>(key: keyof V) {
    return i18n.getLocalizer(key);
  }

  /**
   * Provide configuration to support Custom UI languages
   * default language: 'en'
   */
  static setLocalizationConfig(localizationConfig: LocalizationConfig) {
    i18n.setConfig(localizationConfig);
  }

  getConfig(): UIConfig {
    return this.config;
  }

  /**
   * Returns the list of UI variants as passed into the constructor of {@link UIManager}.
   * @returns {UIVariant[]} the list of available UI variants
   */
  getUiVariants(): UIVariant[] {
    return this.uiVariants;
  }

  /**
   * Switches to a UI variant from the list returned by {@link getUiVariants}.
   * @param {UIVariant} uiVariant the UI variant to switch to
   * @param {() => void} onShow a callback that is executed just before the new UI variant is shown
   */
  switchToUiVariant(uiVariant: UIVariant, onShow?: () => void): void {
    let uiVariantIndex = this.uiVariants.indexOf(uiVariant);

    const previousUi = this.currentUi;
    const nextUi: InternalUIInstanceManager = this.uiInstanceManagers[uiVariantIndex];
    // Determine if the UI variant is changing
    // Only if the UI variant is changing, we need to do some stuff. Else we just leave everything as-is.
    if (nextUi === this.currentUi) {
      return;
      // console.log('switched from ', this.currentUi ? this.currentUi.getUI() : 'none',
      //   ' to ', nextUi ? nextUi.getUI() : 'none');
    }

    // Hide the currently active UI variant
    if (this.currentUi) {
      this.currentUi.getUI().hide();
    }

    // Assign the new UI variant as current UI
    this.currentUi = nextUi;

    // When we switch to a different UI instance, there's some additional stuff to manage. If we do not switch
    // to an instance, we're done here.
    if (this.currentUi == null) {
      return;
    }
    // Add the UI to the DOM (and configure it) the first time it is selected
    if (!this.currentUi.isConfigured()) {
      this.addUi(this.currentUi);
      // ensure that the internal state is ready for the upcoming show call
      if (!this.currentUi.getUI().isHidden()) {
        this.currentUi.getUI().hide();
      }
    }
    if (onShow) {
      onShow();
    }
    this.currentUi.getUI().show();
    this.events.onActiveUiChanged.dispatch(this, { previousUi, currentUi: nextUi });
  }

  /**
   * Triggers a UI variant switch as triggered by events when automatic switching is enabled. It allows to overwrite
   * properties of the {@link UIConditionContext}.
   * @param {Partial<UIConditionContext>} context an optional set of properties that overwrite properties of the
   *   automatically determined context
   * @param {(context: UIConditionContext) => void} onShow a callback that is executed just before the new UI variant
   *   is shown (if a switch is happening)
   */
  resolveUiVariant(context: Partial<UIConditionContext> = {}, onShow?: (context: UIConditionContext) => void): void {
    // Determine the current context for which the UI variant will be resolved
    const defaultContext: UIConditionContext = {
      isAd: false,
      adRequiresUi: false,
      isFullscreen: this.player.getViewMode() === this.player.exports.ViewMode.Fullscreen,
      isMobile: BrowserUtils.isMobile,
      isPlaying: this.player.isPlaying(),
      width: this.uiContainerElement.width(),
      documentWidth: document.body.clientWidth,
    };

    // Overwrite properties of the default context with passed in context properties
    const switchingContext = { ...defaultContext, ...context };

    // Fire the event and allow modification of the context before it is used to resolve the UI variant
    this.events.onUiVariantResolve.dispatch(this, switchingContext);

    let nextUiVariant: UIVariant = null;

    // Select new UI variant
    // If no variant condition is fulfilled, we switch to *no* UI
    for (let uiVariant of this.uiVariants) {
      const matchesCondition = uiVariant.condition == null || uiVariant.condition(switchingContext) === true;
      if (nextUiVariant == null && matchesCondition) {
        nextUiVariant = uiVariant;
      } else {
        // hide all UIs besides the one which should be active
        uiVariant.ui.hide();
      }
    }

    this.switchToUiVariant(nextUiVariant, () => {
      if (onShow) {
        onShow(switchingContext);
      }
    });
  }

  private addUi(ui: InternalUIInstanceManager): void {
    let dom = ui.getUI().getDomElement();
    let player = ui.getWrappedPlayer();

    ui.configureControls();
    /* Append the UI DOM after configuration to avoid CSS transitions at initialization
     * Example: Components are hidden during configuration and these hides may trigger CSS transitions that are
     * undesirable at this time. */
    this.uiContainerElement.append(dom);

    // When the UI is loaded after a source was loaded, we need to tell the components to initialize themselves
    if (player.getSource()) {
      this.config.events.onUpdated.dispatch(this);
    }

    // Fire onConfigured after UI DOM elements are successfully added. When fired immediately, the DOM elements
    // might not be fully configured and e.g. do not have a size.
    // https://swizec.com/blog/how-to-properly-wait-for-dom-elements-to-show-up-in-modern-browsers/swizec/6663
    if (window.requestAnimationFrame) {
      requestAnimationFrame(() => { ui.onConfigured.dispatch(ui.getUI()); });
    } else {
      // IE9 fallback
      setTimeout(() => { ui.onConfigured.dispatch(ui.getUI()); }, 0);
    }
  }

  private releaseUi(ui: InternalUIInstanceManager): void {
    ui.releaseControls();

    const uiContainer = ui.getUI();
    if (uiContainer.hasDomElement()) {
      uiContainer.getDomElement().remove();
    }

    ui.clearEventHandlers();
  }

  release(): void {
    for (let uiInstanceManager of this.uiInstanceManagers) {
      this.releaseUi(uiInstanceManager);
    }
    this.managerPlayerWrapper.clearEventHandlers();
    this.focusVisibilityTracker.release();
  }

  /**
   * Fires just before UI variants are about to be resolved and the UI variant is possibly switched. It is fired when
   * the switch is triggered from an automatic switch and when calling {@link resolveUiVariant}.
   * Can be used to modify the {@link UIConditionContext} before resolving is done.
   * @returns {EventDispatcher<UIManager, UIConditionContext>}
   */
  get onUiVariantResolve(): EventDispatcher<UIManager, UIConditionContext> {
    return this.events.onUiVariantResolve;
  }

  /**
   * Fires after the UIManager has switched to a different UI variant.
   * @returns {EventDispatcher<UIManager, ActiveUiChangedArgs>}
   */
  get onActiveUiChanged(): EventDispatcher<UIManager, ActiveUiChangedArgs> {
    return this.events.onActiveUiChanged;
  }

  /**
   * The current active {@link UIInstanceManager}.
   */
  get activeUi(): UIInstanceManager {
    return this.currentUi;
  }

  /**
   * Returns the list of all added markers in undefined order.
   */
  getTimelineMarkers(): TimelineMarker[] {
    return this.config.metadata.markers;
  }

  /**
   * Adds a marker to the timeline. Does not check for duplicates/overlaps at the `time`.
   */
  addTimelineMarker(timelineMarker: TimelineMarker): void {
    this.config.metadata.markers.push(timelineMarker);
    this.config.events.onUpdated.dispatch(this);
  }

  /**
   * Removes a marker from the timeline (by reference) and returns `true` if the marker has
   * been part of the timeline and successfully removed, or `false` if the marker could not
   * be found and thus not removed.
   */
  removeTimelineMarker(timelineMarker: TimelineMarker): boolean {
    if (ArrayUtils.remove(this.config.metadata.markers, timelineMarker) === timelineMarker) {
      this.config.events.onUpdated.dispatch(this);
      return true;
    }

    return false;
  }
}

export interface SeekPreviewArgs extends NoArgs {
  /**
   * The timeline position in percent where the event originates from.
   */
  position: number;
  /**
   * The timeline marker associated with the current position, if existing.
   */
  marker?: SeekBarMarker;
}

/**
 * Encapsulates functionality to manage a UI instance. Used by the {@link UIManager} to manage multiple UI instances.
 */
export class UIInstanceManager {
  private playerWrapper: PlayerWrapper;
  private ui: UIContainer;
  private config: InternalUIConfig;
  protected spatialNavigation?: SpatialNavigation;

  private events = {
    onConfigured: new EventDispatcher<UIContainer, NoArgs>(),
    onSeek: new EventDispatcher<SeekBar, NoArgs>(),
    onSeekPreview: new EventDispatcher<SeekBar, SeekPreviewArgs>(),
    onSeeked: new EventDispatcher<SeekBar, NoArgs>(),
    onComponentShow: new EventDispatcher<Component<ComponentConfig>, NoArgs>(),
    onComponentHide: new EventDispatcher<Component<ComponentConfig>, NoArgs>(),
    onControlsShow: new EventDispatcher<UIContainer, NoArgs>(),
    onPreviewControlsHide: new EventDispatcher<UIContainer, CancelEventArgs>(),
    onControlsHide: new EventDispatcher<UIContainer, NoArgs>(),
    onRelease: new EventDispatcher<UIContainer, NoArgs>(),
  };

  constructor(player: PlayerAPI, ui: UIContainer, config: InternalUIConfig, spatialNavigation?: SpatialNavigation) {
    this.playerWrapper = new PlayerWrapper(player);
    this.ui = ui;
    this.config = config;
    this.spatialNavigation = spatialNavigation;
  }

  getConfig(): InternalUIConfig {
    return this.config;
  }

  getUI(): UIContainer {
    return this.ui;
  }

  getPlayer(): PlayerAPI {
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
   * Fires before the UI controls are hiding to check if they are allowed to hide.
   * @returns {EventDispatcher}
   */
  get onPreviewControlsHide(): EventDispatcher<UIContainer, CancelEventArgs> {
    return this.events.onPreviewControlsHide;
  }

  /**
   * Fires when the UI controls are hiding.
   * @returns {EventDispatcher}
   */
  get onControlsHide(): EventDispatcher<UIContainer, NoArgs> {
    return this.events.onControlsHide;
  }

  /**
   * Fires when the UI controls are released.
   * @returns {EventDispatcher}
   */
  get onRelease(): EventDispatcher<UIContainer, NoArgs> {
    return this.events.onRelease;
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

  getWrappedPlayer(): WrappedPlayer {
    // TODO find a non-hacky way to provide the WrappedPlayer to the UIManager without exporting it
    // getPlayer() actually returns the WrappedPlayer but its return type is set to Player so the WrappedPlayer does
    // not need to be exported
    return <WrappedPlayer>this.getPlayer();
  }

  configureControls(): void {
    this.configureControlsTree(this.getUI());
    this.configured = true;
  }

  isConfigured(): boolean {
    return this.configured;
  }

  private configureControlsTree(component: Component<ComponentConfig>) {
    let configuredComponents: Component<ComponentConfig>[] = [];

    UIUtils.traverseTree(component, (component) => {
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
      component.configure(this.getPlayer(), this);
      configuredComponents.push(component);
    });
  }

  releaseControls(): void {
    // Do not call release methods if the components have never been configured; this can result in exceptions
    if (this.configured) {
      this.onRelease.dispatch(this.getUI());
      this.releaseControlsTree(this.getUI());
      this.configured = false;
    }
    this.spatialNavigation?.release();
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
export interface WrappedPlayer extends PlayerAPI {
  /**
   * Fires an event on the player that targets all handlers in the UI but never enters the real player.
   * @param event the event to fire
   * @param data data to send with the event
   */
  fireEventInUI(event: PlayerEvent, data: {}): void;
}

/**
 * Wraps the player to track event handlers and provide a simple method to remove all registered event
 * handlers from the player.
 */
export class PlayerWrapper {

  private player: PlayerAPI;
  private wrapper: WrappedPlayer;

  private eventHandlers: { [eventType: string]: PlayerEventCallback[]; } = {};

  constructor(player: PlayerAPI) {
    this.player = player;

    // Collect all members of the player (public API methods and properties of the player)
    const objectProtoPropertyNames = Object.getOwnPropertyNames(Object.getPrototypeOf({}));
    const namesToIgnore = ['constructor', ...objectProtoPropertyNames];
    const members = getAllPropertyNames(player).filter(name => namesToIgnore.indexOf(name) === -1);
    // Split the members into methods and properties
    let methods = <any[]>[];
    let properties = <any[]>[];

    for (let member of members) {
      if (typeof (<any>player)[member] === 'function') {
        methods.push(member);
      } else {
        properties.push(member);
      }
    }

    // Create wrapper object
    let wrapper = <any>{};

    // Add function wrappers for all API methods that do nothing but calling the base method on the player
    for (let method of methods) {
      wrapper[method] = function() {
        // console.log('called ' + member); // track method calls on the player
        return (<any>player)[method].apply(player, arguments);
      };
    }

    // Add all public properties of the player to the wrapper
    for (let property of properties) {
      // Get an eventually existing property descriptor to differentiate between plain properties and properties with
      // getters/setters.
      const propertyDescriptor = ((target: PlayerAPI) => {
        while (target) {
          const propertyDescriptor = Object.getOwnPropertyDescriptor(target, property);
          if (propertyDescriptor) {
            return propertyDescriptor;
          }
          // Check if the PropertyDescriptor exists on a child prototype in case we have an inheritance of the player
          target = Object.getPrototypeOf(target);
        }
      })(player);

      // If the property has getters/setters, wrap them accordingly...
      if (propertyDescriptor && (propertyDescriptor.get || propertyDescriptor.set)) {
        Object.defineProperty(wrapper, property, {
          get: () => propertyDescriptor.get.call(player),
          set: (value: any) => propertyDescriptor.set.call(player, value),
        });
      }
      // ... else just transfer the property to the wrapper
      else {
        wrapper[property] = (<any>player)[property];
      }
    }

    // Explicitly add a wrapper method for 'on' that adds added event handlers to the event list
    wrapper.on = (eventType: PlayerEvent, callback: PlayerEventCallback) => {
      player.on(eventType, callback);

      if (!this.eventHandlers[eventType]) {
        this.eventHandlers[eventType] = [];
      }

      this.eventHandlers[eventType].push(callback);

      return wrapper;
    };

    // Explicitly add a wrapper method for 'off' that removes removed event handlers from the event list
    wrapper.off = (eventType: PlayerEvent, callback: PlayerEventCallback) => {
      player.off(eventType, callback);

      if (this.eventHandlers[eventType]) {
        ArrayUtils.remove(this.eventHandlers[eventType], callback);
      }

      return wrapper;
    };

    wrapper.fireEventInUI = (event: PlayerEvent, data: {}) => {
      if (this.eventHandlers[event]) { // check if there are handlers for this event registered
        // Extend the data object with default values to convert it to a {@link PlayerEventBase} object.
        let playerEventData = <PlayerEventBase>Object.assign({}, {
          timestamp: Date.now(),
          type: event,
          // Add a marker property so the UI can detect UI-internal player events
          uiSourced: true,
        }, data);

        // Execute the registered callbacks
        for (let callback of this.eventHandlers[event]) {
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
    try {
      // Call the player API to check if the instance is still valid or already destroyed.
      // This can be any call throwing the PlayerAPINotAvailableError when the player instance is destroyed.
      this.player.getSource();
    } catch (error) {
      if (error instanceof this.player.exports.PlayerAPINotAvailableError) {
        // We have detected that the player instance is already destroyed, so we clear the event handlers to avoid
        // event handler unsubscription attempts (which would result in PlayerAPINotAvailableError errors).
        this.eventHandlers = {};
      }
    }

    for (let eventType in this.eventHandlers) {
      for (let callback of this.eventHandlers[eventType]) {
        this.player.off(eventType as PlayerEvent, callback);
      }
    }
  }
}

function getAllPropertyNames(target: Object): string[] {
  let names: string[] = [];

  while (target) {
    const newNames = Object.getOwnPropertyNames(target).filter(name => names.indexOf(name) === -1);
    names = names.concat(newNames);
    // go up prototype chain
    target = Object.getPrototypeOf(target);
  }

  return names;
}
