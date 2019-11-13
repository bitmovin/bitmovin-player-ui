import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import { UIInstanceManager } from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../localization/i18n';

/**
 * A button that toggles audio muting.
 */
export class VolumeToggleButton extends ToggleButton<ToggleButtonConfig> {

  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    const defaultConfig: ToggleButtonConfig = {
      cssClass: 'ui-volumetogglebutton',
      text: i18n.getLocalizer('settings.audio.mute'),
      onClass: 'muted',
      offClass: 'unmuted',
      role: 'img'
    };

    this.config = this.mergeConfig(config, defaultConfig, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
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

    // Startup init
    volumeController.onChangedEvent();
  }
}