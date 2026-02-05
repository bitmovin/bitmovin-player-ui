import { i18n, LocalizableText, StringUtils } from '../../main';
import { UIInstanceManager } from '../../UIManager';
import { LabelConfig, Label } from '../labels/Label';
import { PlayerAPI } from 'bitmovin-player';

export interface AdCounterLabelConfig extends LabelConfig {
  /**
   * Message displayed during the ad indicating which ad out of how many in the current ad break is currently playing.
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

    const clearText = () => {
      this.setText('');
    };

    player.on(player.exports.PlayerEvent.AdStarted, () => {
      this.setText(
        StringUtils.replaceAdMessagePlaceholders(i18n.performLocalization(this.config.adCountOutOfTotal), null, player),
      );
    });
    player.on(player.exports.PlayerEvent.AdBreakStarted, clearText);
    player.on(player.exports.PlayerEvent.AdBreakFinished, clearText);
  }
}
