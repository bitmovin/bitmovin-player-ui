import {UIContainer, UIContainerConfig} from './uicontainer';
import {UIManager} from '../uimanager';
import {Timeout} from '../timeout';

/**
 * The base container for Cast receivers that contains all of the UI and takes care that the UI is shown on
 * certain playback events.
 */
export class CastUIContainer extends UIContainer {

  constructor(config: UIContainerConfig) {
    super(config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIManager): void {
    super.configure(player, uimanager);

    let self = this;
    let config = <UIContainerConfig>this.getConfig();

    /*
     * Show UI on Cast devices at certain playback events
     *
     * Since a Cast receiver does not have a direct HCI, we show the UI on certain playback events to give the user
     * a chance to see on the screen what's going on, e.g. on play/pause or a seek the UI is shown and the user can
     * see the current time and position on the seek bar.
     * The UI automatically hides after the configured hide delay time.
     */

    let isUiShown = false;

    let hideUi = function() {
      uimanager.onControlsHide.dispatch(self);
      isUiShown = false;
    };

    let uiHideTimeout = new Timeout(config.hideDelay, hideUi);

    let showUi = function () {
      if(!isUiShown) {
        uimanager.onControlsShow.dispatch(self);
        isUiShown = true;
      }
      uiHideTimeout.start();
    };

    player.addEventHandler(bitmovin.player.EVENT.ON_READY, showUi);
    player.addEventHandler(bitmovin.player.EVENT.ON_SOURCE_LOADED, showUi);
    player.addEventHandler(bitmovin.player.EVENT.ON_PLAY, showUi);
    player.addEventHandler(bitmovin.player.EVENT.ON_PAUSED, showUi);
    player.addEventHandler(bitmovin.player.EVENT.ON_SEEK, showUi);
    player.addEventHandler(bitmovin.player.EVENT.ON_SEEKED, showUi);
  }
}