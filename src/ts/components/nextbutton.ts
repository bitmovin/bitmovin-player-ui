import { ButtonConfig, Button } from './button';
import { UIInstanceManager } from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../localization/i18n';

/**
 * A button to skip to next source.
 */
export class NextButton extends Button<ButtonConfig> {

  constructor(config: ButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-nextbutton',
      text: i18n.getLocalizer('next'),
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onClick.subscribe(() => {
      if (!player.hasEnded()) {
        player.destroy();
      }
      // Add logic for loading next source
      // player.play('ui');
    });
  }
}