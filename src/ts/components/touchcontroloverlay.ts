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
  seekTime?: number,
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

  constructor(config: TouchControlOverlayConfig = {}) {
    super(config);

    this.playbackToggleButton = new SmallCenteredPlaybackToggleButton({
      enterFullscreenOnInitialPlayback: Boolean(config.enterFullscreenOnInitialPlayback),
    });

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-touchcontrol-overlay',
      acceptsTouchWithUiHidden: true,
      seekTime: 10,
      components: [this.playbackToggleButton],
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    
    uimanager.onControlsHide.subscribe(() => {
      this.playbackToggleButton.hide();
    });

    uimanager.onControlsShow.subscribe(() => {
      this.playbackToggleButton.show();
    });

    this.touchControlEvents.onSeekBackward.subscribe(() => {
      console.log("seek backward");
      player.seek(player.getCurrentTime() - this.config.seekTime);
    });

    this.touchControlEvents.onSeekForward.subscribe(() => {
      console.log("seek forward");
      player.seek(player.getCurrentTime() + this.config.seekTime);
    });

    this.touchControlEvents.onSingleClick.subscribe(() => {
      uimanager.getUI().toggleUiShown();
    });

    this.touchControlEvents.onDoubleClick.subscribe((_, e) => {
      uimanager.getUI().hideUi();
      const event = e as Event;
      const eventTarget = event.target as HTMLElementWithComponent;
      if(!eventTarget || !((eventTarget).component instanceof TouchControlOverlay)) {
        return;
      }

      const width = eventTarget.clientWidth;
      const tapMargin = width * 0.4;
      const rect = eventTarget.getBoundingClientRect();
      const eventTapX = ((<any>e).clientX) - rect.left;
      if(eventTapX < tapMargin) {
        this.touchControlEvents.onSeekBackward.dispatch(this);
      }
      else if(eventTapX > (width - tapMargin)) {
        this.touchControlEvents.onSeekForward.dispatch(this);
      }
    });

    const thisDomElement = this.getDomElement();
    thisDomElement.on('click', (e) => {
      if((e.target as HTMLElementWithComponent).component instanceof TouchControlOverlay) {
        clickEventDispatcher(e);
      }
    });

    let lastClickTime = 0;
    const clickEventDispatcher = (e: Event): void => {
      
      let now = Date.now();
      if(now - lastClickTime < 500) {
        this.onDoubleClickEvent(e);
      } else {
        this.onSingelClickEvent();
      }
      lastClickTime = now;
    }

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