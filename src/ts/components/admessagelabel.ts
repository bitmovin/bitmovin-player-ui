import {Label, LabelConfig} from './label';
import {UIInstanceManager} from '../uimanager';
import {StringUtils} from '../stringutils';
import { AdEvent, LinearAd, PlayerAPI } from 'bitmovin-player';
import { i18n } from '../localization/i18n';

/**
 * A label that displays a message about a running ad, optionally with a countdown.
 */
export class AdMessageLabel extends Label<LabelConfig> {

  constructor(config: LabelConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-label-ad-message',
      text: i18n.t('ads.remainingTime') ,
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();
    let text = config.text;

    let updateMessageHandler = () => {
      this.setText(StringUtils.replaceAdMessagePlaceholders(i18n.getLocalizedText(text), null, player));
    };

    let adStartHandler = (event: AdEvent) => {
      let uiConfig = (event.ad as LinearAd).uiConfig;
      text = uiConfig && uiConfig.message || config.text;

      updateMessageHandler();

      player.on(player.exports.PlayerEvent.TimeChanged, updateMessageHandler);
    };

    let adEndHandler = () => {
      player.off(player.exports.PlayerEvent.TimeChanged, updateMessageHandler);
    };

    player.on(player.exports.PlayerEvent.AdStarted, adStartHandler);
    player.on(player.exports.PlayerEvent.AdSkipped, adEndHandler);
    player.on(player.exports.PlayerEvent.AdError, adEndHandler);
    player.on(player.exports.PlayerEvent.AdFinished, adEndHandler);
  }
}