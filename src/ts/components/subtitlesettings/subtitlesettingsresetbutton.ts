import {UIInstanceManager} from '../../uimanager';
import {SubtitleSettingsManager} from './subtitlesettingsmanager';
import {Button, ButtonConfig} from '../button';

export interface SubtitleSettingsResetButtonConfig extends ButtonConfig {
  settingsManager: SubtitleSettingsManager;
}

/**
 * A button that resets all subtitle settings to their defaults.
 */
export class SubtitleSettingsResetButton extends Button<ButtonConfig> {

  constructor(config: SubtitleSettingsResetButtonConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-subtitlesettingsresetbutton',
      text: 'Reset',
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onClick.subscribe(() => {
      (<SubtitleSettingsResetButtonConfig>this.config).settingsManager.reset();
    });
  }
}
