import { Container, ContainerConfig } from './Container';
import { UIInstanceManager } from '../UIManager';
import { DOM, HTMLElementWithComponent } from '../DOM';
import { Timeout } from '../utils/Timeout';
import { PlayerUtils } from '../utils/PlayerUtils';
import { CancelEventArgs, Event as UiEvent, EventDispatcher } from '../EventDispatcher';
import { PlayerAPI, PlayerResizedEvent } from 'bitmovin-player';
import { i18n } from '../localization/i18n';
import { Button, ButtonConfig } from './buttons/Button';
import { TouchControlOverlay, TouchControlOverlayConfig } from './overlays/TouchControlOverlay';

/**
 * Configuration interface for a {@link UIContainer}.
 *
 * @category Configs
 */
export interface UIContainerConfig extends ContainerConfig {
  /**
   * The delay in milliseconds after which the control bar will be hidden when there is no user interaction.
   * Set to -1 for the UI to be always shown.
   * Default: 5 seconds (5000)
   */
  hideDelay?: number;
  /**
   * An array of player states in which the UI will not be hidden, no matter what the {@link hideDelay} is.
   */
  hidePlayerStateExceptions?: PlayerUtils.PlayerState[];
  /**
   * The HTML element on which user interaction events (e.g. mouse and touch events) will be tracked to detect
   * interaction with the UI. These basically trigger showing and hiding of the UI.
   * Default: the UI container itself
   */
  userInteractionEventSource?: HTMLElement;

  /**
   * Specify whether the UI should be hidden immediatly if the mouse leaves the userInteractionEventSource.
   * If false or not set it will wait for the hideDelay.
   * Default: false
   */
  hideImmediatelyOnMouseLeave?: boolean;
}

/**
 * The base container that contains all of the UI. The UIContainer is passed to the {@link UIManager} to build and
 * setup the UI.
 *
 * @category Containers
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

  private userInteractionEventSource: DOM;
  private userInteractionEvents: { name: string; handler: EventListenerOrEventListenerObject }[];
  private hidingPrevented: () => boolean;

  public hideUi: () => void = () => {};
  public showUi: () => void = () => {};
  public toggleUiShown: () => void = () => {};

  constructor(config: UIContainerConfig) {
    super(config);

    this.config = this.mergeConfig(
      config,
      <UIContainerConfig>{
        cssClass: 'ui-uicontainer',
        role: 'region',
        ariaLabel: i18n.getLocalizer('player'),
        hideDelay: 2000,
        hideImmediatelyOnMouseLeave: true,
      },
      this.config,
    );

    this.playerStateChange = new EventDispatcher<UIContainer, PlayerUtils.PlayerState>();
    this.hidingPrevented = () => false;
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    const config = this.getConfig();

    if (config.userInteractionEventSource) {
      this.userInteractionEventSource = new DOM(config.userInteractionEventSource);
    } else {
      this.userInteractionEventSource = this.getDomElement();
    }

    super.configure(player, uimanager);

    this.configureUIShowHide(player, uimanager);
    this.configurePlayerStates(player, uimanager);
  }

  private configureUIShowHide(player: PlayerAPI, uimanager: UIInstanceManager): void {
    let config = this.getConfig();
    let isUiShown = false;

    uimanager.onConfigured.subscribe(() => {
      if (isUiShown) {
        uimanager.onControlsShow.dispatch(this);
      } else {
        uimanager.onControlsHide.dispatch(this);
      }
    });

    if (config.hideDelay === -1) {
      isUiShown = true;
      return;
    }

    let isSeeking = false;
    let isFirstTouch = true;
    let playerState: PlayerUtils.PlayerState;
    const baseHideDelay = config.hideDelay;

    this.hidingPrevented = (): boolean => {
      return config.hidePlayerStateExceptions && config.hidePlayerStateExceptions.indexOf(playerState) > -1;
    };

    const getUiHideDelay = (): number => {
      return uimanager.getSettingsPanelAutoHideManager().getOpenSettingsPanelHideDelay() ?? baseHideDelay;
    };

    const startUiHideTimeoutWithCurrentDelay = (): void => {
      const hideDelay = getUiHideDelay();
      this.uiHideTimeout.clear();
      this.uiHideTimeout = new Timeout(hideDelay, this.hideUi);
      this.uiHideTimeout.start();
    };

    this.showUi = () => {
      // Restore settings panel if it was open before auto-hide
      uimanager.getSettingsPanelAutoHideManager().restoreLastState();

      if (!isUiShown) {
        // Let subscribers know that they should reveal themselves
        uimanager.onControlsShow.dispatch(this);
        isUiShown = true;
      }
      // Don't trigger timeout while seeking (it will be triggered once the seek is finished) or casting
      if (!isSeeking && !player.isCasting() && !this.hidingPrevented()) {
        startUiHideTimeoutWithCurrentDelay();
      }
    };

    this.hideUi = () => {
      // Before hiding, save the complete panel navigation state
      uimanager.getSettingsPanelAutoHideManager().saveCurrentState();

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
          this.showUi();
        }
      }
    };

    this.toggleUiShown = () => {
      isUiShown ? this.hideUi() : this.showUi();
    };

    // Timeout to defer UI hiding by the configured delay time
    this.uiHideTimeout = new Timeout(config.hideDelay, this.hideUi);

    const checkActionAllowed = (e: Event): Boolean => {
      /**
       * The super-modern-UI has its own component, with its own listeners,
       * to detect touches on empty space {@link TouchControlOverlay}.
       * Because the {@link UIContainer} is the root container, it also detects these touches.
       * In order to let the {@link TouchControlOverlay} do its work correctly,
       * we check if the touched target is an instance of it.
       */
      return !((e.target as HTMLElementWithComponent).component instanceof TouchControlOverlay);
    };

    this.userInteractionEvents = [
      {
        // On touch displays, the first touch reveals the UI
        name: 'touchend',
        handler: e => {
          if (!checkActionAllowed(e)) {
            return;
          }

          const shouldPreventDefault = (e: Event): Boolean => {
            const findButtonComponent = (
              element: HTMLElementWithComponent,
            ): Button<ButtonConfig> | TouchControlOverlay | null => {
              if (
                !element ||
                element === this.userInteractionEventSource.get(0) ||
                element.component instanceof UIContainer
              ) {
                return null;
              }

              if (
                (element.component && element.component instanceof Button) ||
                element.component instanceof TouchControlOverlay
              ) {
                return element.component;
              } else {
                return findButtonComponent(element.parentElement);
              }
            };

            const buttonComponent = findButtonComponent(e.target as HTMLElementWithComponent);
            return !(buttonComponent && buttonComponent.getConfig().acceptsTouchWithUiHidden);
          };

          if (!isUiShown) {
            // Only if the UI is hidden, we prevent other actions (except for the first touch) and reveal the UI
            // instead. The first touch is not prevented to let other listeners receive the event and trigger an
            // initial action, e.g. the huge playback button can directly start playback instead of requiring a double
            // tap which 1. reveals the UI and 2. starts playback.
            if (isFirstTouch && !player.isPlaying()) {
              isFirstTouch = false;
            } else {
              // On touch input devices, the first touch is expected to display the UI controls and not be propagated to
              // other components.
              // When buttons are always visible this causes UX problems, as the first touch is not recognized.
              // This is the case for the {@link AdSkipButton} and {@link AdClickOverlay}.
              // To prevent UX issues where the buttons need to be touched twice, we do not prevent the first touch event.
              if (shouldPreventDefault(e)) {
                e.preventDefault();
              }
            }
            this.showUi();
          }
        },
      },
      {
        // When the mouse enters, we show the UI
        name: 'mouseenter',
        handler: e => {
          if (checkActionAllowed(e)) {
            this.showUi();
          }
        },
      },
      {
        // When the mouse moves within, we show the UI
        name: 'mousemove',
        handler: e => {
          if (checkActionAllowed(e)) {
            this.showUi();
          }
        },
      },
      {
        name: 'focusin',
        handler: e => {
          if (checkActionAllowed(e)) {
            this.showUi();
          }
        },
      },
      {
        name: 'keydown',
        handler: e => {
          if (checkActionAllowed(e)) {
            this.showUi();
          }
        },
      },
      {
        // When the mouse leaves, we can prepare to hide the UI, except a seek is going on
        name: 'mouseleave',
        handler: () => {
          // When a seek is going on, the seek scrub pointer may exit the UI area while still seeking, and we do not
          // hide the UI in such cases
          if (!isSeeking && !this.hidingPrevented()) {
            if (this.config.hideImmediatelyOnMouseLeave) {
              this.hideUi();
            } else {
              startUiHideTimeoutWithCurrentDelay();
            }
          }
        },
      },
      {
        // When scrolling, we show the UI
        name: 'wheel',
        handler: e => {
          if (checkActionAllowed(e)) {
            this.showUi();
          }
        },
      },
    ];

    this.userInteractionEvents.forEach(event => this.userInteractionEventSource.on(event.name, event.handler));

    // Add click listener running on capture phase to intercept clicks before stopPropagation() in buttons
    this.userInteractionEventSource.on(
      'click',
      e => {
        if (checkActionAllowed(e)) {
          this.showUi();
        }
      },
      { capture: true },
    );

    uimanager.onSeek.subscribe(() => {
      this.uiHideTimeout.clear(); // Don't hide UI while a seek is in progress
      isSeeking = true;
    });
    uimanager.onSeeked.subscribe(() => {
      isSeeking = false;
      if (!this.hidingPrevented()) {
        startUiHideTimeoutWithCurrentDelay(); // Re-enable UI hide timeout after a seek
      }
    });
    uimanager.onComponentViewModeChanged.subscribe((_, { mode }) => this.trackComponentViewMode(mode));
    player.on(player.exports.PlayerEvent.CastStarted, () => {
      this.showUi(); // Show UI when a Cast session has started (UI will then stay permanently on during the session)
    });
    this.playerStateChange.subscribe((_, state) => {
      playerState = state;
      if (this.hidingPrevented()) {
        // Entering a player state that prevents hiding and forces the controls to be shown
        this.uiHideTimeout.clear();
        this.showUi();
      } else {
        // Entering a player state that allows hiding
        startUiHideTimeoutWithCurrentDelay();
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
        stateClassNames[PlayerUtils.PlayerState[state]] = this.prefixCss(
          UIContainer.STATE_PREFIX + enumName.toLowerCase(),
        );
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
    player.on(player.exports.PlayerEvent.Playing, () => {
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
    uimanager.getConfig().events.onUpdated.subscribe(() => {
      updateState(PlayerUtils.getState(player));
    });

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
    // Explicitly unsubscribe user interaction event handlers because they could be attached to an external element
    // that isn't owned by the UI and therefore not removed on release.
    if (this.userInteractionEvents) {
      this.userInteractionEvents.forEach(event => this.userInteractionEventSource.off(event.name, event.handler));
    }

    super.release();

    if (this.uiHideTimeout) {
      this.uiHideTimeout.clear();
    }
  }

  onPlayerStateChange(): UiEvent<UIContainer, PlayerUtils.PlayerState> {
    return this.playerStateChange.getEvent();
  }

  protected suspendHideTimeout() {
    this.uiHideTimeout.suspend();
  }

  protected resumeHideTimeout() {
    this.uiHideTimeout.resume(!this.hidingPrevented());
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
