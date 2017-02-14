import {ButtonConfig, Button} from './button';
import {DOM} from '../dom';
import {UIInstanceManager} from '../uimanager';
import PlayerEvent = bitmovin.player.PlayerEvent;

/**
 * A button to play/replay a video.
 */
export class HugeReplayButton extends Button<ButtonConfig> {

  constructor(config: ButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-hugereplaybutton',
      text: 'Replay'
    }, this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onClick.subscribe(() => {
      player.play('ui-overlay');
    });
  }

  protected toDomElement(): DOM {
    let buttonElement = super.toDomElement();

    // Add child that contains the play button image
    // Setting the image directly on the button does not work together with scaling animations, because the button
    // can cover the whole video player are and scaling would extend it beyond. By adding an inner element, confined
    // to the size if the image, it can scale inside the player without overshooting.
    buttonElement.append(new DOM('div', {
      'class': this.prefixCss('image')
    }));

    return buttonElement;
  }
}