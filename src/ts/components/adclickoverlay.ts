import { ClickOverlay } from './clickoverlay';
import { UIInstanceManager } from '../uimanager';
import { Ad, AdEvent, PlayerAPI } from 'bitmovin-player';

/**
 * A simple click capture overlay for clickThroughUrls of ads.
 */
export class AdClickOverlay extends ClickOverlay {

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let clickThroughCallback: () => void = null;

    player.on(player.exports.PlayerEvent.AdStarted, (event: AdEvent) => {
      let ad = event.ad;
      this.setUrl(ad.clickThroughUrl);
      clickThroughCallback = ad.clickThroughUrlOpened;
    });

    // Clear click-through URL when ad has finished
    let adFinishedHandler = () => {
      this.setUrl(null);
    };

    player.on(player.exports.PlayerEvent.AdFinished, adFinishedHandler);
    player.on(player.exports.PlayerEvent.AdSkipped, adFinishedHandler);
    player.on(player.exports.PlayerEvent.AdError, adFinishedHandler);

    this.onClick.subscribe(() => {
      // Pause the ad when overlay is clicked
      player.pause('ui-ad-click-overlay');

      if (clickThroughCallback) {
        clickThroughCallback();
      }
    });
  }
}
