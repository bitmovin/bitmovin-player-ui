import { Container, ContainerConfig } from './container';
import { SmallCenteredPlaybackToggleButton } from './smallcenteredplaybacktogglebutton';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../uimanager';
import { EventDispatcher, NoArgs, Event as EDEvent } from '../eventdispatcher';
import { Timeout } from '../timeout';
import { HTMLElementWithComponent } from '../dom';

export interface TouchControlOverlayConfig extends ContainerConfig {
  /**
   * Specify whether the player should be set to enter fullscreen by clicking on the playback toggle button
   * when initiating the initial playback.
   * Default is false.
   */
  enterFullscreenOnInitialPlayback?: boolean;

  /**
   * Specifies whether the first touch event received by the {@link UIContainer} should be prevented or not.
   *
   * Default: true
   */
  acceptsTouchWithUiHidden?: boolean;

  /**
   * Specifies how many seconds are seeked incase user seeks through double-tapping
   * Default: 10sec
   */
  seekTime?: number;

  /**
   * The second tap of a double tap has to be in a specific range of the first tap
   * This specifies how many pixels off the second tap is allowed to be from the first tap
   * in order to trigger the seek events
   *
   * Default: 15px
   */
  seekDoubleTapMargin?: number;
}

interface ClickPosition {
  x: number;
  y: number;
}

/**
 * Overlays the player and detects touch input
 */
export class TouchControlOverlay extends Container<TouchControlOverlayConfig> {

  private touchControlEvents = {
    onSingleClick: new EventDispatcher<TouchControlOverlay, NoArgs>(),
    onDoubleClick: new EventDispatcher<TouchControlOverlay, NoArgs>(),
    onSeekBackward: new EventDispatcher<TouchControlOverlay, NoArgs>(),
    onSeekForward: new EventDispatcher<TouchControlOverlay, NoArgs>(),
  };

  private playbackToggleButton: SmallCenteredPlaybackToggleButton;

  // true if the last tap on the overlay was less than 500msec ago
  private couldBeDoubleTapping: Boolean;
  private doubleTapTimeout: Timeout;

  private latestTapPosition: ClickPosition = {x: -1, y: -1};

  constructor(config: TouchControlOverlayConfig = {}) {
    super(config);

    this.playbackToggleButton = new SmallCenteredPlaybackToggleButton({
      enterFullscreenOnInitialPlayback: Boolean(config.enterFullscreenOnInitialPlayback),
    });

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-touchcontrol-overlay',
      acceptsTouchWithUiHidden: true,
      seekTime: 10,
      seekDoubleTapMargin: 15,
      components: [this.playbackToggleButton],
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.doubleTapTimeout = new Timeout(500, () => {
      this.couldBeDoubleTapping = false;
    });

    uimanager.onControlsHide.subscribe(() => {
      this.playbackToggleButton.hide();
    });

    uimanager.onControlsShow.subscribe(() => {
      this.playbackToggleButton.show();
    });

    let playerSeekTime = 0;

    this.touchControlEvents.onSeekBackward.subscribe(() => {
      playerSeekTime -= this.config.seekTime;
      player.seek(playerSeekTime);
    });

    this.touchControlEvents.onSeekForward.subscribe(() => {
      playerSeekTime += this.config.seekTime;
      player.seek(playerSeekTime);
    });

    this.touchControlEvents.onSingleClick.subscribe(() => {
      playerSeekTime = player.getCurrentTime();
      uimanager.getUI().toggleUiShown();
    });

    this.touchControlEvents.onDoubleClick.subscribe((_, e) => {
      uimanager.getUI().hideUi();
      const event = e as Event;
      const eventTarget = event.target as HTMLElementWithComponent;
      if (!eventTarget || !((eventTarget).component instanceof TouchControlOverlay)) {
        return;
      }

      const width = eventTarget.clientWidth;
      const tapMargin = width * 0.4;
      const rect = eventTarget.getBoundingClientRect();
      const eventTapX = ((<any>e).clientX) - rect.left;
      const eventTapY = ((<any>e).clientY) - rect.top;
      if (this.latestTapPosition.x === -1 && this.latestTapPosition.y === -1) {
        this.latestTapPosition = {x: eventTapX, y: eventTapY};
      }
      const doubleTapMargin = this.config.seekDoubleTapMargin;
      if (Math.abs(this.latestTapPosition.x - eventTapX) <= doubleTapMargin && Math.abs(this.latestTapPosition.y - eventTapY) <= doubleTapMargin)
        if (eventTapX < tapMargin) {
          this.touchControlEvents.onSeekBackward.dispatch(this);
        }
        else if (eventTapX > (width - tapMargin)) {
          this.touchControlEvents.onSeekForward.dispatch(this);
        }
      this.latestTapPosition = {x: eventTapX, y: eventTapY};
    });

    const thisDomElement = this.getDomElement();
    thisDomElement.on('click', (e) => {
      if ((e.target as HTMLElementWithComponent).component instanceof TouchControlOverlay) {
        clickEventDispatcher(e);
      }
    });

    const clickEventDispatcher = (e: Event): void => {
      if (this.couldBeDoubleTapping) {
        this.onDoubleClickEvent(e);
      } else {
        this.onSingelClickEvent();
      }
      this.couldBeDoubleTapping = true;
      this.doubleTapTimeout.start();
    };
  }

  protected onDoubleClickEvent(e: Event) {
    this.touchControlEvents.onDoubleClick.dispatch(this, e);
  }

  protected onSingelClickEvent() {
    this.touchControlEvents.onSingleClick.dispatch(this);
  }

  get onClick(): EDEvent<TouchControlOverlay, NoArgs> {
    return this.touchControlEvents.onSingleClick.getEvent();
  }
}