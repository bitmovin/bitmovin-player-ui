import { i18n, LocalizableText } from '../../localization/i18n';
import { UIInstanceManager } from '../../UIManager';
import { LabelConfig } from '../labels/Label';
import { LinearAd, PlayerAPI } from 'bitmovin-player';
import { StringUtils } from '../../utils/StringUtils';
import { AdBreakTracker, AdBreakTrackerAdCountChangedArgs } from '../../utils/AdBreakTracker';
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
  private adBreakTracker?: AdBreakTracker;

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

    this.adBreakTracker = uimanager.getConfig().adBreakTracker;
    this.adBreakTracker.onAdCountChanged.subscribe(this.adBreakTrackerAdCountChangedHandler);

    // An ad break may already be ongoing when configure is called, in this case the onAdCountChanged event was missed
    // and the label is set here
    if (this.adBreakTracker.currentAdIndex > 0 && this.adBreakTracker.totalNumberOfAds > 0) {
      this.setAdCounterFromAdBreakTracker(this.adBreakTracker.currentAdIndex, this.adBreakTracker.totalNumberOfAds);
    }
  }

  release(): void {
    this.adBreakTracker?.onAdCountChanged.unsubscribe(this.adBreakTrackerAdCountChangedHandler);

    this.adBreakTracker = undefined;
    this.player = undefined;

    super.release();
  }

  protected onLanguageChanged(): void {
    if (this.adBreakTracker?.currentAdIndex > 0 || this.player?.ads?.isLinearAdActive?.()) {
      this.setAdCounterFromAdBreakTracker(this.adBreakTracker?.currentAdIndex, this.adBreakTracker?.totalNumberOfAds);
    }
  }

  protected getAdMessage(player: PlayerAPI, ad?: LinearAd, currentAdIndex?: number, totalNumberOfAds?: number): string {
    const resolvedCurrentAdIndex = currentAdIndex ?? this.adBreakTracker?.currentAdIndex;
    const resolvedTotalNumberOfAds = totalNumberOfAds ?? this.adBreakTracker?.totalNumberOfAds;

    if (resolvedCurrentAdIndex > 0 && resolvedTotalNumberOfAds > 1) {
      return this.getAdCounterMessage(player, resolvedCurrentAdIndex, resolvedTotalNumberOfAds);
    }

    return super.getAdMessage(player, ad);
  }

  private readonly adBreakTrackerAdCountChangedHandler = (
    _: AdBreakTracker,
    adBreakTrackerEvent: AdBreakTrackerAdCountChangedArgs,
  ) => {
    this.setAdCounterFromAdBreakTracker(adBreakTrackerEvent.currentAdIndex, adBreakTrackerEvent.totalNumberOfAds);
  };

  private setAdCounterFromAdBreakTracker(currentAdIndex?: number, totalNumberOfAds?: number) {
    if (currentAdIndex === 0 && totalNumberOfAds === 0) {
      // No ad break active and no subsequent ad breaks
      this.setText('');
      return;
    }

    this.setText(
      this.getAdMessage(this.player, this.player.ads?.getActiveAd?.() as LinearAd, currentAdIndex, totalNumberOfAds),
    );
  }

  private getAdCounterMessage(player: PlayerAPI, currentAdIndex?: number, totalNumberOfAds?: number): string {
    return StringUtils.replaceAdMessagePlaceholders(
      i18n.performLocalization(this.config.adCountOutOfTotal),
      player,
      undefined,
      currentAdIndex,
      totalNumberOfAds,
    );
  }
}
