import { i18n, LocalizableText } from '../../localization/i18n';
import { UIInstanceManager } from '../../UIManager';
import { LabelConfig } from '../labels/Label';
import { LinearAd, PlayerAPI } from 'bitmovin-player';
import { AdMessageLabel } from './AdMessageLabel';

export interface AdCounterLabelConfig extends LabelConfig {
  /**
   * Message displayed during the ad indicating which ad out of how many is currently playing. It takes all ad breaks
   * with the same schedule time into account.
   * Supported placeholders: look at {@link StringUtils.replaceAdMessagePlaceholders}
   */
  adCountOutOfTotal?: LocalizableText;
}

/**
 * A label that displays an ad message for a single ad, or the index of the currently playing ad when multiple ads
 * are scheduled.
 *
 * @category Labels
 */
export class AdCounterLabel extends AdMessageLabel<AdCounterLabelConfig> {
  private player?: PlayerAPI;

  constructor(config: AdCounterLabelConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-label-ad-counter',
        text: i18n.getLocalizer('ad'),
        adCountOutOfTotal: i18n.getLocalizer('ads.adNumberOfTotal'),
      },
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    this.player = player;

    this.adBreakTracker.onAdCountChanged.subscribe(this.adCountChangedHandler);

    // An ad break may already be ongoing when configure is called, in this case the onAdCountChanged event was missed
    // and the label is set here
    if (this.adBreakTracker.currentAdIndex > 0 && this.adBreakTracker.totalNumberOfAds > 0) {
      this.updateAdMessage();
    }
  }

  release(): void {
    this.adBreakTracker?.onAdCountChanged.unsubscribe(this.adCountChangedHandler);

    this.player = undefined;

    super.release();
  }

  protected onLanguageChanged(): void {
    if (this.adBreakTracker?.currentAdIndex > 0 || this.player?.ads?.isLinearAdActive?.()) {
      this.updateAdMessage();
    }
  }

  protected getMessageText(ad?: LinearAd): LocalizableText {
    if (this.adBreakTracker?.currentAdIndex > 0 && this.adBreakTracker?.totalNumberOfAds > 1) {
      return this.config.adCountOutOfTotal;
    }

    return super.getMessageText(ad);
  }

  // The event only signals that the counts changed; the message is rendered from the tracker itself, like the
  // language change and the ad time updates of the base class.
  private readonly adCountChangedHandler = () => {
    this.updateAdMessage();
  };

  private updateAdMessage(): void {
    const activeAd = this.player.ads?.getActiveAd?.() as LinearAd;
    if (this.adBreakTracker?.currentAdIndex === 0 && this.adBreakTracker?.totalNumberOfAds === 0 && !activeAd) {
      // No ad break active and no subsequent ad breaks
      this.setText('');
      return;
    }

    this.setText(this.getAdMessage(this.player, activeAd));
  }
}
