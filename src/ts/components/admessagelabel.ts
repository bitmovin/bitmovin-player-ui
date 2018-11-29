import {Label, LabelConfig} from './label';
import {UIInstanceManager} from '../uimanager';
import {StringUtils} from '../stringutils';
import { AdEvent, LinearAd, PlayerAPI } from 'bitmovin-player';

export interface LocalLinearAdUiConfig {
  requestsUi?: boolean;
  message?: string;
  untilSkippableMessage?: string;
  skippableMessage?: string;
}

export interface LocalLinearAd extends LinearAd {
  uiConfig?: LocalLinearAdUiConfig;
  skippableAfter?: number;
}

/**
 * A label that displays a message about a running ad, optionally with a countdown.
 */
export class AdMessageLabel extends Label<LabelConfig> {

  constructor(config: LabelConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-label-ad-message',
      text: 'This ad will end in {remainingTime} seconds.',
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();
    let text = config.text;

    let updateMessageHandler = () => {
      this.setText(StringUtils.replaceAdMessagePlaceholders(text, null, player));
    };

    let adStartHandler = (event: AdEvent) => {
      let uiConfig = (event.ad as LocalLinearAd).uiConfig;
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