import {Label, LabelConfig} from './label';
import {UIInstanceManager} from '../uimanager';
import {StringUtils} from '../stringutils';

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

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let text = this.getConfig().text;

    let updateMessageHandler = () => {
      this.setText(StringUtils.replaceAdMessagePlaceholders(text, null, player));
    };

    let adStartHandler = (event: bitmovin.PlayerAPI.AdStartedEvent) => {
      text = event.adMessage || text;
      updateMessageHandler();

      player.addEventHandler(player.Event.TimeChanged, updateMessageHandler);
    };

    let adEndHandler = () => {
      player.removeEventHandler(player.Event.TimeChanged, updateMessageHandler);
    };

    player.addEventHandler(player.Event.AdStarted, adStartHandler);
    player.addEventHandler(player.Event.AdSkipped, adEndHandler);
    player.addEventHandler(player.Event.AdError, adEndHandler);
    player.addEventHandler(player.Event.AdFinished, adEndHandler);
  }
}