import {Label, LabelConfig} from './label';
import {UIInstanceManager} from '../uimanager';
import {StringUtils} from '../utils';

/**
 * A label that displays a message about a running ad, optionally with a countdown.
 */
export class AdMessageLabel extends Label<LabelConfig> {

  constructor(config: LabelConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-label-ad-message',
      text: 'This ad will end in {remainingTime} seconds.'
    }, this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let text = this.getConfig().text;

    let updateMessageHandler = () => {
      this.setText(StringUtils.replaceAdMessagePlaceholders(text, null, player));
    };

    let adStartHandler = (event: bitmovin.player.AdStartedEvent) => {
      text = event.adMessage || text;
      updateMessageHandler();

      player.addEventHandler(player.EVENT.ON_TIME_CHANGED, updateMessageHandler);
      player.addEventHandler(player.EVENT.ON_CAST_TIME_UPDATED, updateMessageHandler);
    };

    let adEndHandler = () => {
      player.removeEventHandler(player.EVENT.ON_TIME_CHANGED, updateMessageHandler);
      player.removeEventHandler(player.EVENT.ON_CAST_TIME_UPDATED, updateMessageHandler);
    };

    player.addEventHandler(player.EVENT.ON_AD_STARTED, adStartHandler);
    player.addEventHandler(player.EVENT.ON_AD_SKIPPED, adEndHandler);
    player.addEventHandler(player.EVENT.ON_AD_FINISHED, adEndHandler);
  }
}