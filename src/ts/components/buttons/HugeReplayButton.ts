import {ButtonConfig, Button} from './Button';
import {DOM} from '../../DOM';
import {UIInstanceManager} from '../../UIManager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';

/**
 * A button to play/replay a video.
 *
 * @category Buttons
 */
export class HugeReplayButton extends Button<ButtonConfig> {

  constructor(config: ButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-hugereplaybutton',
      text: i18n.getLocalizer('replay'),
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onClick.subscribe(() => {
      player.play('ui');
    });
  }
}