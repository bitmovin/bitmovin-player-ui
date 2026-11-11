import { ClickOverlay, ClickOverlayConfig } from '../overlays/ClickOverlay';
import { UIInstanceManager } from '../../UIManager';
import { Ad, AdEvent, PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';

/**
 * A simple click capture overlay for clickThroughUrls of ads.
 *
 * @category Components
 */
export class AdClickOverlay extends ClickOverlay {
  constructor(config: ClickOverlayConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        acceptsTouchWithUiHidden: true,
        ariaLabel: i18n.getLocalizer('ads.clickThrough'),
      },
      this.config,
    );
  }

  setUrl(url: string): void {
    super.setUrl(url);

    // Without a click-through URL there is nothing to open, so keep the overlay out of the tab order and hide it from
    // assistive technologies. Pointer input still reaches it.
    const element = this.getDomElement();
    if (this.getUrl()) {
      element.attr('tabindex', String(this.config.tabIndex));
      element.removeAttr('aria-hidden');
    } else {
      element.attr('tabindex', '-1');
      element.attr('aria-hidden', 'true');
    }
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let clickThroughCallback: () => void = null;

    player.on(player.exports.PlayerEvent.AdStarted, (event: AdEvent) => {
      const ad = event.ad;
      this.setUrl(ad.clickThroughUrl);
      clickThroughCallback = ad.clickThroughUrlOpened;
    });

    // Clear click-through URL when ad has finished
    const adFinishedHandler = () => {
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
