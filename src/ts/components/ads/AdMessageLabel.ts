import { UIInstanceManager } from '../../UIManager';
import { AdEvent, LinearAd, PlayerAPI } from 'bitmovin-player';
import { Label, LabelConfig } from '../labels/Label';

/**
 * A label that displays a message regarding the ad that's currently being played.
 *
 * @category Labels
 */
export class AdMessageLabel extends Label<LabelConfig> {
  constructor(config: LabelConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-ad-message-label',
      },
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    const clearText = () => {
      this.setText('');
    };

    clearText();

    player.on(player.exports.PlayerEvent.SourceUnloaded, clearText);
    player.on(player.exports.PlayerEvent.AdError, clearText);
    player.on(player.exports.PlayerEvent.AdSkipped, clearText);
    player.on(player.exports.PlayerEvent.AdFinished, clearText);
    player.on(player.exports.PlayerEvent.AdStarted, event => {
      const ad = (event as AdEvent).ad;
      if (!ad.isLinear) {
        return;
      }

      const linearAd = ad as LinearAd;
      this.setText(linearAd.uiConfig?.message ?? '');
    });
  }
}
