import {ButtonConfig, Button} from './button';
import {DOM} from '../dom';
import {UIInstanceManager} from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../localization/i18n';

/**
 * A button to play/replay a video.
 */
export class HugeReplayButton extends Button<ButtonConfig> {

  constructor(config: ButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-hugereplaybutton',
      text: i18n.t('replay'),
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onClick.subscribe(() => {
      player.play('ui');
    });
  }

  protected toDomElement(): DOM {
    let buttonElement = super.toDomElement();

    // Add child that contains the play button image
    // Setting the image directly on the button does not work together with scaling animations, because the button
    // can cover the whole video player are and scaling would extend it beyond. By adding an inner element, confined
    // to the size if the image, it can scale inside the player without overshooting.
    buttonElement.append(new DOM('div', {
      'class': this.prefixCss('image'),
    }));

    return buttonElement;
  }
}