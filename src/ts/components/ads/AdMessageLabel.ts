import {UIInstanceManager} from '../../UIManager';
import { AdEvent, LinearAd, PlayerAPI } from 'bitmovin-player';
import { Label, LabelConfig } from '../labels/Label';

/**
 * A label that displays a message regarding the ad that's currently being played.
 *
 * @category Labels
 */
export class AdMessageLabel extends Label<LabelConfig> {
  private adMessage: string = '';

  constructor(config: LabelConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['label-metadata', 'label-metadata-title'],
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    const init = () => {
      this.setText(this.adMessage);
    };

    const unload = () => {
      this.setText('');
      this.adMessage = '';
    };

    init();

    player.on(player.exports.PlayerEvent.SourceUnloaded, unload);
    player.on(player.exports.PlayerEvent.AdFinished, unload);
    player.on(player.exports.PlayerEvent.AdStarted, (event) => {
      const ad = (event as AdEvent).ad;
      if (!ad.isLinear) {
        return;
      }

      const linearAd = ad as LinearAd;
      this.adMessage = linearAd.uiConfig?.message ?? '';
      init();
    });

    uimanager.getConfig().events.onUpdated.subscribe(init);
  }
}