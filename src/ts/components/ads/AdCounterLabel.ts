import { UIInstanceManager } from '../../UIManager';
import {LabelConfig, Label} from '../labels/Label';
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

    let currentAdIndex: number = 0;
    let totalAdsCount: number = 0;

    const reset = () => {
      currentAdIndex = 0;
      totalAdsCount = 0;
      this.setText('');
    };

    player.on(player.exports.PlayerEvent.AdStarted, () => {
      currentAdIndex++;
      totalAdsCount = player.ads.getActiveAdBreak().ads?.length ?? 0;
      this.setText(`Ad ${currentAdIndex} of ${totalAdsCount}`);
    });
    player.on(player.exports.PlayerEvent.AdBreakStarted, reset);
    player.on(player.exports.PlayerEvent.AdBreakFinished, reset);
  }
}
