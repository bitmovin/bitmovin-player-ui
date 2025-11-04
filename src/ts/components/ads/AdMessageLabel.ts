import { Label, LabelConfig } from '../labels/Label';
import { i18n } from '../../localization/i18n';
import { AdEvent, LinearAd, PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../../UIManager';
import { StringUtils } from '../../utils/StringUtils';

/**
 * A label that displays a message about a running ad, optionally with a countdown.
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

    let config = this.getConfig();
    let text = config.text;

    let updateMessageHandler = () => {
      this.setText(StringUtils.replaceAdMessagePlaceholders(i18n.performLocalization(text), null, player));
    };

    let adStartHandler = (event: AdEvent) => {
      let uiConfig = (event.ad as LinearAd).uiConfig;
      text = (uiConfig && uiConfig.message) || config.text;

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
