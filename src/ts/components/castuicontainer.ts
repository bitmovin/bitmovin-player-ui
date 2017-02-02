import {UIContainer, UIContainerConfig} from './uicontainer';
import {UIInstanceManager} from '../uimanager';
import {Timeout} from '../timeout';

/**
 * The base container for Cast receivers that contains all of the UI and takes care that the UI is shown on
 * certain playback events.
 */
export class CastUIContainer extends UIContainer {

  constructor(config: UIContainerConfig) {
    super(config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let self = this;
    let config = <UIContainerConfig>this.getConfig();

    /*
     * Show UI on Cast devices at certain playback events
     *
     * Since a Cast receiver does not have a direct HCI, we show the UI on certain playback events to give the user
     * a chance to see on the screen what's going on, e.g. on play/pause or a seek the UI is shown and the user can
     * see the current time and position on the seek bar.
     * The UI is shown permanently while playback is paused, otherwise hides automatically after the configured
     * hide delay time.
     */

    let isUiShown = false;

    let hideUi = function() {
      uimanager.onControlsHide.dispatch(self);
      isUiShown = false;
    };

    let uiHideTimeout = new Timeout(config.hideDelay, hideUi);

    let showUi = function() {
      if (!isUiShown) {
        uimanager.onControlsShow.dispatch(self);
        isUiShown = true;
      }
    };

    let showUiPermanently = function() {
      showUi();
      uiHideTimeout.clear();
    };

    let showUiWithTimeout = function() {
      showUi();
      uiHideTimeout.start();
    };

    let showUiAfterSeek = function() {
      if (player.isPlaying()) {
        showUiWithTimeout();
      } else {
        showUiPermanently();
      }
    };

    player.addEventHandler(bitmovin.player.EVENT.ON_READY, showUiWithTimeout);
    player.addEventHandler(bitmovin.player.EVENT.ON_SOURCE_LOADED, showUiWithTimeout);
    player.addEventHandler(bitmovin.player.EVENT.ON_PLAY, showUiWithTimeout);
    player.addEventHandler(bitmovin.player.EVENT.ON_PAUSED, showUiPermanently);
    player.addEventHandler(bitmovin.player.EVENT.ON_SEEK, showUiPermanently);
    player.addEventHandler(bitmovin.player.EVENT.ON_SEEKED, showUiAfterSeek);
  }
}