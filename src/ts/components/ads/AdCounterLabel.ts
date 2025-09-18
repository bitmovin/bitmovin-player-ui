import { UIInstanceManager } from '../../UIManager';
import { LabelConfig, Label } from '../labels/Label';
import { PlayerAPI } from 'bitmovin-player';

/**
 * A label that displays the index of the currently playing ad out of the total number of ads.
 *
 * @category Labels
 */
export class AdCounterLabel extends Label<LabelConfig> {
  constructor(config: LabelConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-label-ad-counter',
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    const clearText = () => {
      this.setText('');
    };

    player.on(player.exports.PlayerEvent.AdStarted, () => {
      const activeAdIndex = player.ads.getActiveAdBreak().ads.findIndex((ad) => ad === player.ads.getActiveAd()) + 1;
      const totalAdsCount = player.ads.getActiveAdBreak().ads?.length ?? activeAdIndex;
      this.setText(`Ad ${activeAdIndex} of ${totalAdsCount}`);
    });
    player.on(player.exports.PlayerEvent.AdBreakStarted, clearText);
    player.on(player.exports.PlayerEvent.AdBreakFinished, clearText);
  }
}
