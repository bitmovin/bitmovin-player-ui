import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {UIInstanceManager} from '../uimanager';

/**
 * A button that toggles audio muting.
 */
export class VolumeToggleButton extends ToggleButton<ToggleButtonConfig> {

  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    const defaultConfig: ToggleButtonConfig = {
      cssClass: 'ui-volumetogglebutton',
      text: 'Volume/Mute',
      onClass: 'muted',
      offClass: 'unmuted',
    };

    this.config = this.mergeConfig(config, defaultConfig, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    const volumeController = uimanager.getConfig().volumeController;

    volumeController.onChanged.subscribe((_, args) => {
      if (args.muted) {
        this.on();
      } else {
        this.off();
      }

      const volumeLevelTens = Math.ceil(args.volume / 10);
      this.getDomElement().data(this.prefixCss('volume-level-tens'), String(volumeLevelTens));
    });

    this.onClick.subscribe(() => {
      volumeController.toggleMuted();
    });
  }
}