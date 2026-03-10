import { i18n, LocalizableText } from '../../localization/i18n';
import { UIInstanceManager } from '../../UIManager';
import { LabelConfig, Label } from '../labels/Label';
import { PlayerAPI } from 'bitmovin-player';
import { StringUtils } from '../../utils/StringUtils';
import { AdBreakTracker, AdBreakTrackerChangedArgs } from '../../utils/AdBreakTracker';

export interface AdCounterLabelConfig extends LabelConfig {
  /**
   * Message displayed during the ad indicating which ad out of how many is currently playing. It takes all ad breaks
   * with the same schedule time into account.
   * Supported placeholders: look at {@link StringUtils.replaceAdMessagePlaceholders}
   */
  adCountOutOfTotal?: LocalizableText;
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
      },
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    this.player = player;

    this.adBreakTracker = uimanager.getConfig().adBreakTracker;

    this.adBreakTracker.onAdCountChanged.subscribe((_, adBreakTrackerEvent: AdBreakTrackerChangedArgs) => {
      this.setText(
        StringUtils.replaceAdMessagePlaceholders(
          i18n.performLocalization(this.config.adCountOutOfTotal),
          player,
          undefined,
          adBreakTrackerEvent.currentAdIndex,
          adBreakTrackerEvent.totalNumberOfAds,
        ),
      );
    });

    player.on(player.exports.PlayerEvent.AdBreakStarted, this.clearText);
    player.on(player.exports.PlayerEvent.AdBreakFinished, this.clearText);
  }

  clearText = () => {
    super.clearText();
  };

  release(): void {
    this.player?.on(this.player.exports.PlayerEvent.AdBreakStarted, this.clearText);
    this.player?.on(this.player.exports.PlayerEvent.AdBreakFinished, this.clearText);

    this.adBreakTracker?.release();

    this.adBreakTracker = undefined;
    this.player = undefined;

    super.release();
  }

  protected onLanguageChanged(): void {
    if (this.adBreakTracker?.currentAdIndex > 0 || this.player?.ads?.isLinearAdActive?.()) {
      this.setText(
        StringUtils.replaceAdMessagePlaceholders(
          i18n.performLocalization(this.config.adCountOutOfTotal),
          this.player,
          undefined,
          this.adBreakTracker?.currentAdIndex,
          this.adBreakTracker?.totalNumberOfAds,
        ),
      );
    }
  }
}
