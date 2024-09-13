import {UIContainer, UIContainerConfig} from './uicontainer';
import {UIInstanceManager} from '../uimanager';
import {Timeout} from '../timeout';
import { PlayerAPI } from 'bitmovin-player';

/**
 * The base container for Cast receivers that contains all of the UI and takes care that the UI is shown on
 * certain playback events.
 *
 * @category Containers
 */
export class CastUIContainer extends UIContainer {

  private castUiHideTimeout: Timeout;

  constructor(config: UIContainerConfig) {
    super(config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();

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

    player.on(player.exports.PlayerEvent.Play, showUiWithTimeout);
    player.on(player.exports.PlayerEvent.Paused, showUiPermanently);
    player.on(player.exports.PlayerEvent.Seek, showUiPermanently);
    player.on(player.exports.PlayerEvent.Seeked, showUiAfterSeek);

    uimanager.getConfig().events.onUpdated.subscribe(showUiWithTimeout);
  }

  release(): void {
    super.release();
    this.castUiHideTimeout.clear();
  }
}