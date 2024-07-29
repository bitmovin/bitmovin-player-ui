import { Container, ContainerConfig } from './container';
import { SmallCenteredPlaybackToggleButton } from './smallcenteredplaybacktogglebutton';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../uimanager';
import { EventDispatcher, NoArgs, Event } from '../eventdispatcher';
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
}

/**
 * Overlays the player and detects touch input
 */
export class TouchControlOverlay extends Container<TouchControlOverlayConfig> {

  private divTapEvents = {
    onSingleClick: new EventDispatcher<TouchControlOverlay, NoArgs>(),
    onDoubleClick: new EventDispatcher<TouchControlOverlay, NoArgs>(),
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

    const thisDomElement = this.getDomElement();
    thisDomElement.on('click', (e) => {
      if((e.target as HTMLElementWithComponent).component instanceof TouchControlOverlay) {
        console.log("clicked overlay for sure");
      }
      console.log(e)
      this.onClickEvent();
      this.clickCheckHandler();
    });



    this.divTapEvents.onSingleClick.subscribe(() => {
      let timeout = new Timeout(200, () => {})
    });
  }

  private clickCheckHandler() {

  }

  protected onClickEvent() {
    this.divTapEvents.onSingleClick.dispatch(this);
  }

  get onClick(): Event<TouchControlOverlay, NoArgs> {
    return this.divTapEvents.onSingleClick.getEvent();
  }
}