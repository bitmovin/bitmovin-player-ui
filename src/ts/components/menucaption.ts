import { Label, LabelConfig } from './label';
import { UIInstanceManager } from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';

/**
 * A label that displays a caption about the menu.
 */
export class MenuCaption extends Label<LabelConfig> {

  constructor(config: LabelConfig = {}) {
    super(config);
    this.config = this.mergeConfig(config, {
      hidden: true,
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    let config = this.getConfig();
    let text = config.text;

    this.onShow.subscribe(() => {
     this.setText(text);
    });
  }
}