import {ContainerConfig, Container} from './container';
import {UIInstanceManager} from '../uimanager';
import {DOM} from '../dom';
import {Timeout} from '../timeout';
import {PlayerUtils} from '../utils';
import PlayerResizeEvent = bitmovin.player.PlayerResizeEvent;

/**
 * Configuration interface for a {@link UIContainer}.
 */
export interface UIContainerConfig extends ContainerConfig {
  /**
   * The delay in milliseconds after which the control bar will be hidden when there is no user interaction.
   * Default: 5 seconds (5000)
   */
  hideDelay?: number;
}

/**
 * The base container that contains all of the UI. The UIContainer is passed to the {@link UIManager} to build and
 * setup the UI.
 */
export class UIContainer extends Container<UIContainerConfig> {

  private static readonly STATE_IDLE = 'player-state-idle';
  private static readonly STATE_PREPARED = 'player-state-prepared';
  private static readonly STATE_PLAYING = 'player-state-playing';
  private static readonly STATE_PAUSED = 'player-state-paused';
  private static readonly STATE_FINISHED = 'player-state-finished';

  private static readonly FULLSCREEN = 'fullscreen';
  private static readonly BUFFERING = 'buffering';
  private static readonly CONTROLS_SHOWN = 'controls-shown';
  private static readonly CONTROLS_HIDDEN = 'controls-hidden';

  constructor(config: UIContainerConfig) {
    super(config);

    this.config = this.mergeConfig(config, <UIContainerConfig>{
      cssClass: 'ui-uicontainer',
      hideDelay: 5000,
    }, this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.configureUIShowHide(player, uimanager);
    this.configurePlayerStates(player, uimanager);
  }

  private configureUIShowHide(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    let self = this;
    let container = this.getDomElement();
    let config = <UIContainerConfig>this.getConfig();

    let isUiShown = false;
    let isSeeking = false;

    let showUi = function() {
      if (!isUiShown) {
        // Let subscribers know that they should reveal themselves
        uimanager.onControlsShow.dispatch(self);
        isUiShown = true;
      }
      // Don't trigger timeout while seeking, it will be triggered once the seek is finished
      if (!isSeeking) {
        uiHideTimeout.start();
      }
    };

    let hideUi = function() {
      if (isUiShown) {
        // Let subscribers know that they should now hide themselves
        uimanager.onControlsHide.dispatch(self);
        isUiShown = false;
      }
    };

    // Timeout to defer UI hiding by the configured delay time
    let uiHideTimeout = new Timeout(config.hideDelay, hideUi);

    // On touch displays, the first touch reveals the UI
    container.on('touchend', function(e) {
      if (!isUiShown) {
        // Only if the UI is hidden, we prevent other actions and reveal the UI instead
        e.preventDefault();
        showUi();
      }
    });
    // When the mouse enters, we show the UI
    container.on('mouseenter', function() {
      showUi();
    });
    // When the mouse moves within, we show the UI
    container.on('mousemove', function() {
      showUi();
    });
    // When the mouse leaves, we can prepare to hide the UI, except a seek is going on
    container.on('mouseleave', function() {
      // When a seek is going on, the seek scrub pointer may exit the UI area while still seeking, and we do not hide
      // the UI in such cases
      if (!isSeeking) {
        uiHideTimeout.start();
      }
    });

    uimanager.onSeek.subscribe(function() {
      uiHideTimeout.clear(); // Don't hide UI while a seek is in progress
      isSeeking = true;
    });
    uimanager.onSeeked.subscribe(function() {
      isSeeking = false;
      uiHideTimeout.start(); // Re-enable UI hide timeout after a seek
    });
  }

  private configurePlayerStates(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    let self = this;
    let container = this.getDomElement();

    let removeStates = function() {
      container.removeClass(self.prefixCss(UIContainer.STATE_IDLE));
      container.removeClass(self.prefixCss(UIContainer.STATE_PREPARED));
      container.removeClass(self.prefixCss(UIContainer.STATE_PLAYING));
      container.removeClass(self.prefixCss(UIContainer.STATE_PAUSED));
      container.removeClass(self.prefixCss(UIContainer.STATE_FINISHED));
    };
    player.addEventHandler(player.EVENT.ON_READY, function() {
      removeStates();
      container.addClass(self.prefixCss(UIContainer.STATE_PREPARED));
    });
    player.addEventHandler(player.EVENT.ON_PLAY, function() {
      removeStates();
      container.addClass(self.prefixCss(UIContainer.STATE_PLAYING));
    });
    player.addEventHandler(player.EVENT.ON_PAUSED, function() {
      removeStates();
      container.addClass(self.prefixCss(UIContainer.STATE_PAUSED));
    });
    player.addEventHandler(player.EVENT.ON_PLAYBACK_FINISHED, function() {
      removeStates();
      container.addClass(self.prefixCss(UIContainer.STATE_FINISHED));
    });
    player.addEventHandler(player.EVENT.ON_SOURCE_UNLOADED, function() {
      removeStates();
      container.addClass(self.prefixCss(UIContainer.STATE_IDLE));
    });
    // Init in idle state without a source or prepared if a source is set
    container.addClass(self.prefixCss(PlayerUtils.isSourceLoaded(player) ?
      UIContainer.STATE_PREPARED : UIContainer.STATE_IDLE));

    // Fullscreen marker class
    player.addEventHandler(player.EVENT.ON_FULLSCREEN_ENTER, function() {
      container.addClass(self.prefixCss(UIContainer.FULLSCREEN));
    });
    player.addEventHandler(player.EVENT.ON_FULLSCREEN_EXIT, function() {
      container.removeClass(self.prefixCss(UIContainer.FULLSCREEN));
    });
    // Init fullscreen state
    if (player.isFullscreen()) {
      container.addClass(self.prefixCss(UIContainer.FULLSCREEN));
    }

    // Buffering marker class
    player.addEventHandler(player.EVENT.ON_STALL_STARTED, function() {
      container.addClass(self.prefixCss(UIContainer.BUFFERING));
    });
    player.addEventHandler(player.EVENT.ON_STALL_ENDED, function() {
      container.removeClass(self.prefixCss(UIContainer.BUFFERING));
    });
    // Init buffering state
    if (player.isStalled()) {
      container.addClass(self.prefixCss(UIContainer.BUFFERING));
    }

    // Controls visibility marker class
    uimanager.onControlsShow.subscribe(function() {
      container.removeClass(self.prefixCss(UIContainer.CONTROLS_HIDDEN));
      container.addClass(self.prefixCss(UIContainer.CONTROLS_SHOWN));
    });
    uimanager.onControlsHide.subscribe(function() {
      container.removeClass(self.prefixCss(UIContainer.CONTROLS_SHOWN));
      container.addClass(self.prefixCss(UIContainer.CONTROLS_HIDDEN));
    });

    // Layout size classes
    let updateLayoutSizeClasses = function(width: number, height: number) {
      container.removeClass(self.prefixCss('layout-max-width-400'));
      container.removeClass(self.prefixCss('layout-max-width-600'));
      container.removeClass(self.prefixCss('layout-max-width-800'));
      container.removeClass(self.prefixCss('layout-max-width-1200'));

      if (width <= 400) {
        container.addClass(self.prefixCss('layout-max-width-400'));
      } else if (width <= 600) {
        container.addClass(self.prefixCss('layout-max-width-600'));
      } else if (width <= 800) {
        container.addClass(self.prefixCss('layout-max-width-800'));
      } else if (width <= 1200) {
        container.addClass(self.prefixCss('layout-max-width-1200'));
      }
    };
    player.addEventHandler(player.EVENT.ON_PLAYER_RESIZE, function(e: PlayerResizeEvent) {
      // Convert strings (with "px" suffix) to ints
      let width = Math.round(Number(e.width.substring(0, e.width.length - 2)));
      let height = Math.round(Number(e.height.substring(0, e.height.length - 2)));

      updateLayoutSizeClasses(width, height);
    });
    // Init layout state
    updateLayoutSizeClasses(new DOM(player.getFigure()).width(), new DOM(player.getFigure()).height());
  }

  protected toDomElement(): DOM {
    let self = this;
    let container = super.toDomElement();

    // Detect flexbox support (not supported in IE9)
    if (document && typeof document.createElement('p').style.flex !== 'undefined') {
      container.addClass(self.prefixCss('flexbox'));
    } else {
      container.addClass(self.prefixCss('no-flexbox'));
    }

    return container;
  }
}