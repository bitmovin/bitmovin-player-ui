import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {UIInstanceManager} from '../uimanager';
import {DOM} from '../dom';

/**
 * A button that toggles the option menu for subtitles
 */
export class SubtitleOptionsToggle extends ToggleButton<ToggleButtonConfig> {

  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-subtitleoptiontoggle',
      text: 'Subtitles options',
    }, this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = <ToggleButtonConfig>this.getConfig();
  }
}
