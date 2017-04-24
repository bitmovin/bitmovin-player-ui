import {UIContainer, UIContainerConfig} from './uicontainer';
import {UIInstanceManager} from '../uimanager';
import {Timeout} from '../timeout';

/**
 * The base container for Cast receivers that contains all of the UI and takes care that the UI is shown on
 * certain playback events.
 */
export class CastUIContainer extends UIContainer {

  private castUiHideTimeout: Timeout;

  constructor(config: UIContainerConfig) {
    super(config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

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

    let hideUi = () => {
      uimanager.onControlsHide.dispatch(this);
      isUiShown = false;
    };

    this.castUiHideTimeout = new Timeout(config.hideDelay, hideUi);

    let showUi = () => {
      if (!isUiShown) {
        uimanager.onControlsShow.dispatch(this);
        isUiShown = true;
      }
    };

    let showUiPermanently = () => {
      showUi();
      this.castUiHideTimeout.clear();
    };

    let showUiWithTimeout = () => {
      showUi();
      this.castUiHideTimeout.start();
    };

    let showUiAfterSeek = () => {
      if (player.isPlaying()) {
        showUiWithTimeout();
      } else {
        showUiPermanently();
      }
    };

    player.addEventHandler(player.EVENT.ON_READY, showUiWithTimeout);
    player.addEventHandler(player.EVENT.ON_SOURCE_LOADED, showUiWithTimeout);
    player.addEventHandler(player.EVENT.ON_PLAY, showUiWithTimeout);
    player.addEventHandler(player.EVENT.ON_PAUSED, showUiPermanently);
    player.addEventHandler(player.EVENT.ON_SEEK, showUiPermanently);
    player.addEventHandler(player.EVENT.ON_SEEKED, showUiAfterSeek);
  }

  release(): void {
    super.release();
    this.castUiHideTimeout.clear();
  }
}