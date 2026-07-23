import { i18n, LocalizableText } from '../../localization/i18n';
import { UIInstanceManager } from '../../UIManager';
import { LabelConfig, Label } from '../labels/Label';
import { PlayerAPI } from 'bitmovin-player';
import { StringUtils } from '../../utils/StringUtils';
import { AdBreakTracker, AdBreakTrackerAdCountChangedArgs } from '../../utils/AdBreakTracker';

export interface AdCounterLabelConfig extends LabelConfig {
  /**
   * Message displayed during the ad indicating which ad out of how many is currently playing. It takes all ad breaks
   * with the same schedule time into account.
   * Supported placeholders: look at {@link StringUtils.replaceAdMessagePlaceholders}
   */
  adCountOutOfTotal?: LocalizableText;
  /**
   * Message displayed during an ad if only one ad is in the adbreak.
   * Supported placeholders: look at {@link StringUtils.replaceAdMessagePlaceholders}
   */
  adLabelIfOneAd?: LocalizableText;
}

/**
 * A label that displays the index of the currently playing ad out of the total number of ads.
 *
 * @category Labels
 */
export class AdCounterLabel extends Label<AdCounterLabelConfig> {
  private player?: PlayerAPI;
  private adBreakTracker?: AdBreakTracker;

  constructor(config: AdCounterLabelConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-label-ad-counter',
        adCountOutOfTotal: i18n.getLocalizer('ads.adNumberOfTotal'),
        adLabelIfOneAd: i18n.getLocalizer('ads.adLabelIfOne'),
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

    const message =
      totalNumberOfAds > 1
        ? i18n.performLocalization(this.config.adCountOutOfTotal)
        : i18n.performLocalization(this.config.adLabelIfOneAd);

    this.setText(
      StringUtils.replaceAdMessagePlaceholders(message, this.player, undefined, currentAdIndex, totalNumberOfAds),
    );
  }
}
