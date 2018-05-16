import {ContainerConfig, Container} from './container';
import {UIInstanceManager} from '../uimanager';
import {DOM} from '../dom';
import {Timeout} from '../timeout';
import {PlayerUtils} from '../playerutils';
import PlayerResizeEvent = bitmovin.PlayerAPI.PlayerResizeEvent;
import {CancelEventArgs} from '../eventdispatcher';

/**
 * Configuration interface for a {@link UIContainer}.
 */
export interface UIContainerConfig extends ContainerConfig {
  /**
   * The delay in milliseconds after which the control bar will be hidden when there is no user interaction.
   * Set to -1 for the UI to be always shown.
   * Default: 2 seconds (2000)
   */
  hideDelay?: number;
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

  constructor(config: UIContainerConfig) {
    super(config);

    this.config = this.mergeConfig(config, <UIContainerConfig>{
      cssClass: 'ui-uicontainer',
      hideDelay: 2000,
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.configureUIShowHide(player, uimanager);
    this.configurePlayerStates(player, uimanager);
  }

  private configureUIShowHide(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    let container = this.getDomElement();
    let config = <UIContainerConfig>this.getConfig();

    if (config.hideDelay === -1) {
      uimanager.onConfigured.subscribe(() => uimanager.onControlsShow.dispatch(this));
      return;
    }

    let isUiShown = false;
    let isSeeking = false;
    let isFirstTouch = true;

    let showUi = () => {
      if (!isUiShown) {
        // Let subscribers know that they should reveal themselves
        uimanager.onControlsShow.dispatch(this);
        isUiShown = true;
      }
      // Don't trigger timeout while seeking (it will be triggered once the seek is finished) or casting
      if (!isSeeking && !player.isCasting()) {
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
      if (!isSeeking) {
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
    player.addEventHandler(player.EVENT.ON_CAST_STARTED, () => {
      showUi(); // Show UI when a Cast session has started (UI will then stay permanently on during the session)
    });
  }

  private configurePlayerStates(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
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
      container.removeClass(stateClassNames[PlayerUtils.PlayerState.IDLE]);
      container.removeClass(stateClassNames[PlayerUtils.PlayerState.PREPARED]);
      container.removeClass(stateClassNames[PlayerUtils.PlayerState.PLAYING]);
      container.removeClass(stateClassNames[PlayerUtils.PlayerState.PAUSED]);
      container.removeClass(stateClassNames[PlayerUtils.PlayerState.FINISHED]);
    };
    player.addEventHandler(player.EVENT.ON_READY, () => {
      removeStates();
      container.addClass(stateClassNames[PlayerUtils.PlayerState.PREPARED]);
    });
    player.addEventHandler(player.EVENT.ON_PLAY, () => {
      removeStates();
      container.addClass(stateClassNames[PlayerUtils.PlayerState.PLAYING]);
    });
    player.addEventHandler(player.EVENT.ON_PAUSED, () => {
      removeStates();
      container.addClass(stateClassNames[PlayerUtils.PlayerState.PAUSED]);
    });
    player.addEventHandler(player.EVENT.ON_PLAYBACK_FINISHED, () => {
      removeStates();
      container.addClass(stateClassNames[PlayerUtils.PlayerState.FINISHED]);
    });
    player.addEventHandler(player.EVENT.ON_SOURCE_UNLOADED, () => {
      removeStates();
      container.addClass(stateClassNames[PlayerUtils.PlayerState.IDLE]);
    });
    // Init in current player state
    container.addClass(stateClassNames[PlayerUtils.getState(player)]);

    // Fullscreen marker class
    player.addEventHandler(player.EVENT.ON_FULLSCREEN_ENTER, () => {
      container.addClass(this.prefixCss(UIContainer.FULLSCREEN));
    });
    player.addEventHandler(player.EVENT.ON_FULLSCREEN_EXIT, () => {
      container.removeClass(this.prefixCss(UIContainer.FULLSCREEN));
    });
    // Init fullscreen state
    if (player.isFullscreen()) {
      container.addClass(this.prefixCss(UIContainer.FULLSCREEN));
    }

    // Buffering marker class
    player.addEventHandler(player.EVENT.ON_STALL_STARTED, () => {
      container.addClass(this.prefixCss(UIContainer.BUFFERING));
    });
    player.addEventHandler(player.EVENT.ON_STALL_ENDED, () => {
      container.removeClass(this.prefixCss(UIContainer.BUFFERING));
    });
    // Init buffering state
    if (player.isStalled()) {
      container.addClass(this.prefixCss(UIContainer.BUFFERING));
    }

    // RemoteControl marker class
    player.addEventHandler(player.EVENT.ON_CAST_STARTED, () => {
      container.addClass(this.prefixCss(UIContainer.REMOTE_CONTROL));
    });
    player.addEventHandler(player.EVENT.ON_CAST_STOPPED, () => {
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
    player.addEventHandler(player.EVENT.ON_PLAYER_RESIZE, (e: PlayerResizeEvent) => {
      // Convert strings (with "px" suffix) to ints
      let width = Math.round(Number(e.width.substring(0, e.width.length - 2)));
      let height = Math.round(Number(e.height.substring(0, e.height.length - 2)));

      updateLayoutSizeClasses(width, height);
    });
    // Init layout state
    updateLayoutSizeClasses(new DOM(player.getFigure()).width(), new DOM(player.getFigure()).height());
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
