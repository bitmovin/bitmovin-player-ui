import { Container, ContainerConfig } from '../Container';
import { AdSkipButton } from './AdSkipButton';
import { Spacer } from '../Spacer';
import { AdEvent, PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../../UIManager';
import { i18n } from '../../localization/i18n';

/**
 * An overlay holding the AdSkipButton which is always visible during Ad playback.
 *
 * When a linear ad starts, it is announced to screen readers through {@link UIInstanceManager.announce}, including
 * the position of the ad in the ad break when there is more than one ad, e.g. "Ad 1 of 2 started".
 *
 * @category Components
 */
export class AdStatusOverlay extends Container<ContainerConfig> {
  public readonly adSkipButton: AdSkipButton;

  constructor(config: ContainerConfig = {}) {
    super(config);

    this.adSkipButton = new AdSkipButton();

    this.config = this.mergeConfig(
      config,
      {
        components: [
          new Container({
            components: [new Spacer(), this.adSkipButton],
            cssClasses: ['bar'],
          }),
        ],
        cssClass: 'ui-ad-status-overlay',
      },
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager) {
    super.configure(player, uimanager);

    player.on(player.exports.PlayerEvent.AdStarted, (event: AdEvent) => {
      if (event.ad && event.ad.isLinear === false) {
        return;
      }

      // The tracker handles AdStarted before any UI variant, so its counts already include this ad
      const adBreakTracker = uimanager.getConfig().adBreakTracker;
      const currentAdIndex = adBreakTracker ? adBreakTracker.currentAdIndex : 0;
      const totalNumberOfAds = adBreakTracker ? adBreakTracker.totalNumberOfAds : 0;

      const message =
        currentAdIndex > 0 && totalNumberOfAds > 1
          ? i18n.getLocalizer('announcements.adNumberOfTotalStarted', {
              activeAdIndex: currentAdIndex,
              totalAdsCount: totalNumberOfAds,
            })
          : i18n.getLocalizer('announcements.adStarted');
      uimanager.announce(i18n.performLocalization(message));
    });
  }
}
