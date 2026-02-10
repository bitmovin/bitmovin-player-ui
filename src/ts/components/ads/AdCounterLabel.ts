import { i18n, LocalizableText } from '../../localization/i18n';
import { UIInstanceManager } from '../../UIManager';
import { LabelConfig, Label } from '../labels/Label';
import { PlayerAPI } from 'bitmovin-player';
import { StringUtils } from '../../utils/StringUtils';

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
  private player?: PlayerAPI;
  private updateLabelText = () => {
    if (!this.player) {
      return;
    }

    this.setText(
      StringUtils.replaceAdMessagePlaceholders(i18n.performLocalization(this.config.adCountOutOfTotal), this.player),
    );
  };

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

    const clearText = () => {
      this.setText('');
    };

    player.on(player.exports.PlayerEvent.AdStarted, () => {
      this.updateLabelText();
    });
    player.on(player.exports.PlayerEvent.AdBreakStarted, clearText);
    player.on(player.exports.PlayerEvent.AdBreakFinished, clearText);
  }

  protected onLanguageChanged(): void {
    if (this.player?.ads?.isLinearAdActive?.()) {
      this.updateLabelText();
    }
  }
}
