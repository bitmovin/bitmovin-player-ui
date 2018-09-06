import {ContainerConfig, Container} from './container';
import {UIInstanceManager} from '../uimanager';
import {DOM} from '../dom';
import {Timeout} from '../timeout';
import {PlayerUtils} from '../playerutils';
import { CancelEventArgs, EventDispatcher } from '../eventdispatcher';
import { PlayerAPI, PlayerResizedEvent } from 'bitmovin-player';

/**
 * Configuration interface for a {@link UIContainer}.
 */
export interface UIContainerConfig extends ContainerConfig {
  /**
   * The delay in milliseconds after which the control bar will be hidden when there is no user interaction.
   * Set to -1 for the UI to be always shown.
   * Default: 5 seconds (5000)
   */
  hideDelay?: number;
  hidePlayerStateExceptions?: PlayerUtils.PlayerState[];
}

/**
 * The base container that contains all of the UI. The UIContainer is passed to the {@link UIManager} to build and
 * setup the UI.
 */
export class UIContainer extends Container<UIContainerConfig> {

  private static readonly STATE_PREFIX = 'player-state-';

  private static readonly FULLSCREEN = 'fullscreen';
  private static readonly BUFFERING = 'buffering';
  private static readonly REMOTE_CONTROL = 'remote-control';
  private static readonly CONTROLS_SHOWN = 'controls-shown';
  private static readonly CONTROLS_HIDDEN = 'controls-hidden';

  private uiHideTimeout: Timeout;
  private playerStateChange: EventDispatcher<UIContainer, PlayerUtils.PlayerState>;

  constructor(config: UIContainerConfig) {
    super(config);

    this.config = this.mergeConfig(config, <UIContainerConfig>{
      cssClass: 'ui-uicontainer',
      hideDelay: 5000,
    }, this.config);

    this.playerStateChange = new EventDispatcher<UIContainer, PlayerUtils.PlayerState>();
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.configureUIShowHide(player, uimanager);
    this.configurePlayerStates(player, uimanager);
  }

  private configureUIShowHide(player: PlayerAPI, uimanager: UIInstanceManager): void {
    let container = this.getDomElement();
    let config = <UIContainerConfig>this.getConfig();

    if (config.hideDelay === -1) {
      uimanager.onConfigured.subscribe(() => uimanager.onControlsShow.dispatch(this));
      return;
    }

    let isUiShown = false;
    let isSeeking = false;
    let isFirstTouch = true;
    let playerState: PlayerUtils.PlayerState;

    const hidingPrevented = (): boolean => {
      return config.hidePlayerStateExceptions && config.hidePlayerStateExceptions.indexOf(playerState) > -1;
    };

    let showUi = () => {
      if (!isUiShown) {
        // Let subscribers know that they should reveal themselves
        uimanager.onControlsShow.dispatch(this);
        isUiShown = true;
      }
      // Don't trigger timeout while seeking (it will be triggered once the seek is finished) or casting
      if (!isSeeking && !player.isCasting() && !hidingPrevented()) {
        this.uiHideTimeout.start();
      }
    };

    let hideUi = () => {
      // Hide the UI only if it is shown, and if not casting
      if (isUiShown && !player.isCasting()) {
        // Issue a preview event to check if we are good to hide the controls
        let previewHideEventArgs = <CancelEventArgs>{};
        uimanager.onPreviewControlsHide.dispatch(this, previewHideEventArgs);

        if (!previewHideEventArgs.cancel) {
          // If the preview wasn't canceled, let subscribers know that they should now hide themselves
          uimanager.onControlsHide.dispatch(this);
          isUiShown = false;
        } else {
          // If the hide preview was canceled, continue to show UI
          showUi();
        }
      }
    };

    // Timeout to defer UI hiding by the configured delay time
    this.uiHideTimeout = new Timeout(config.hideDelay, hideUi);

    // On touch displays, the first touch reveals the UI
    container.on('touchend', (e) => {
      if (!isUiShown) {
        // Only if the UI is hidden, we prevent other actions (except for the first touch) and reveal the UI instead.
        // The first touch is not prevented to let other listeners receive the event and trigger an initial action, e.g.
        // the huge playback button can directly start playback instead of requiring a double tap which 1. reveals
        // the UI and 2. starts playback.
        if (isFirstTouch) {
          isFirstTouch = false;
        } else {
          e.preventDefault();
        }
        showUi();
      }
    });
    // When the mouse enters, we show the UI
    container.on('mouseenter', () => {
      showUi();
    });
    // When the mouse moves within, we show the UI
    container.on('mousemove', () => {
      showUi();
    });
    // When the mouse leaves, we can prepare to hide the UI, except a seek is going on
    container.on('mouseleave', () => {
      // When a seek is going on, the seek scrub pointer may exit the UI area while still seeking, and we do not hide
      // the UI in such cases
      if (!isSeeking && !hidingPrevented()) {
        this.uiHideTimeout.start();
      }
    });

    uimanager.onSeek.subscribe(() => {
      this.uiHideTimeout.clear(); // Don't hide UI while a seek is in progress
      isSeeking = true;
    });
    uimanager.onSeeked.subscribe(() => {
      isSeeking = false;
      this.uiHideTimeout.start(); // Re-enable UI hide timeout after a seek
    });
    player.on(player.exports.PlayerEvent.CastStarted, () => {
      showUi(); // Show UI when a Cast session has started (UI will then stay permanently on during the session)
    });
    this.playerStateChange.subscribe((_, state) => {
      playerState = state;
      if (hidingPrevented()) {
        // Entering a player state that prevents hiding and forces the controls to be shown
        this.uiHideTimeout.clear();
        showUi();
      } else {
        // Entering a player state that allows hiding
        this.uiHideTimeout.start();
      }
    });
  }

  private configurePlayerStates(player: PlayerAPI, uimanager: UIInstanceManager): void {
    let container = this.getDomElement();

    // Convert player states into CSS class names
    let stateClassNames = <any>[];
    for (let state in PlayerUtils.PlayerState) {
      if (isNaN(Number(state))) {
        let enumName = PlayerUtils.PlayerState[<any>PlayerUtils.PlayerState[state]];
        stateClassNames[PlayerUtils.PlayerState[state]] =
          this.prefixCss(UIContainer.STATE_PREFIX + enumName.toLowerCase());
      }
    }

    let removeStates = () => {
      container.removeClass(stateClassNames[PlayerUtils.PlayerState.Idle]);
      container.removeClass(stateClassNames[PlayerUtils.PlayerState.Prepared]);
      container.removeClass(stateClassNames[PlayerUtils.PlayerState.Playing]);
      container.removeClass(stateClassNames[PlayerUtils.PlayerState.Paused]);
      container.removeClass(stateClassNames[PlayerUtils.PlayerState.Finished]);
    };

    const updateState = (state: PlayerUtils.PlayerState) => {
      removeStates();
      container.addClass(stateClassNames[state]);
      this.playerStateChange.dispatch(this, state);
    };

    player.on(player.exports.PlayerEvent.SourceLoaded, () => {
      updateState(PlayerUtils.PlayerState.Prepared);
    });
    player.on(player.exports.PlayerEvent.Play, () => {
      updateState(PlayerUtils.PlayerState.Playing);
    });
    player.on(player.exports.PlayerEvent.Paused, () => {
      updateState(PlayerUtils.PlayerState.Paused);
    });
    player.on(player.exports.PlayerEvent.PlaybackFinished, () => {
      updateState(PlayerUtils.PlayerState.Finished);
    });
    player.on(player.exports.PlayerEvent.SourceUnloaded, () => {
      updateState(PlayerUtils.PlayerState.Idle);
    });
    // Init in current player state
    updateState(PlayerUtils.getState(player));

    // Fullscreen marker class
    player.on(player.exports.PlayerEvent.ViewModeChanged, () => {
      if (player.getViewMode() === player.exports.ViewMode.Fullscreen) {
        container.addClass(this.prefixCss(UIContainer.FULLSCREEN));
      } else {
        container.removeClass(this.prefixCss(UIContainer.FULLSCREEN));
      }
    });
    // Init fullscreen state
    if (player.getViewMode() === player.exports.ViewMode.Fullscreen) {
      container.addClass(this.prefixCss(UIContainer.FULLSCREEN));
    }

    // Buffering marker class
    player.on(player.exports.PlayerEvent.StallStarted, () => {
      container.addClass(this.prefixCss(UIContainer.BUFFERING));
    });
    player.on(player.exports.PlayerEvent.StallEnded, () => {
      container.removeClass(this.prefixCss(UIContainer.BUFFERING));
    });
    // Init buffering state
    if (player.isStalled()) {
      container.addClass(this.prefixCss(UIContainer.BUFFERING));
    }

    // RemoteControl marker class
    player.on(player.exports.PlayerEvent.CastStarted, () => {
      container.addClass(this.prefixCss(UIContainer.REMOTE_CONTROL));
    });
    player.on(player.exports.PlayerEvent.CastStopped, () => {
      container.removeClass(this.prefixCss(UIContainer.REMOTE_CONTROL));
    });
    // Init RemoteControl state
    if (player.isCasting()) {
      container.addClass(this.prefixCss(UIContainer.REMOTE_CONTROL));
    }

    // Controls visibility marker class
    uimanager.onControlsShow.subscribe(() => {
      container.removeClass(this.prefixCss(UIContainer.CONTROLS_HIDDEN));
      container.addClass(this.prefixCss(UIContainer.CONTROLS_SHOWN));
    });
    uimanager.onControlsHide.subscribe(() => {
      container.removeClass(this.prefixCss(UIContainer.CONTROLS_SHOWN));
      container.addClass(this.prefixCss(UIContainer.CONTROLS_HIDDEN));
    });

    // Layout size classes
    let updateLayoutSizeClasses = (width: number, height: number) => {
      container.removeClass(this.prefixCss('layout-max-width-400'));
      container.removeClass(this.prefixCss('layout-max-width-600'));
      container.removeClass(this.prefixCss('layout-max-width-800'));
      container.removeClass(this.prefixCss('layout-max-width-1200'));

      if (width <= 400) {
        container.addClass(this.prefixCss('layout-max-width-400'));
      } else if (width <= 600) {
        container.addClass(this.prefixCss('layout-max-width-600'));
      } else if (width <= 800) {
        container.addClass(this.prefixCss('layout-max-width-800'));
      } else if (width <= 1200) {
        container.addClass(this.prefixCss('layout-max-width-1200'));
      }
    };
    player.on(player.exports.PlayerEvent.PlayerResized, (e: PlayerResizedEvent) => {
      // Convert strings (with "px" suffix) to ints
      let width = Math.round(Number(e.width.substring(0, e.width.length - 2)));
      let height = Math.round(Number(e.height.substring(0, e.height.length - 2)));

      updateLayoutSizeClasses(width, height);
    });
    // Init layout state
    updateLayoutSizeClasses(new DOM(player.getContainer()).width(), new DOM(player.getContainer()).height());
  }

  release(): void {
    super.release();
    this.uiHideTimeout.clear();
  }

  protected toDomElement(): DOM {
    let container = super.toDomElement();

    // Detect flexbox support (not supported in IE9)
    if (document && typeof document.createElement('p').style.flex !== 'undefined') {
      container.addClass(this.prefixCss('flexbox'));
    } else {
      container.addClass(this.prefixCss('no-flexbox'));
    }

    return container;
  }
}
