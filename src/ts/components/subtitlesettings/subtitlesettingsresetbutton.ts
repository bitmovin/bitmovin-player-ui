import {UIInstanceManager} from '../../uimanager';
import {SubtitleSettingsManager} from './subtitlesettingsmanager';
import {Button, ButtonConfig} from '../button';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';

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
      text: i18n.t('labels.reset'),
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onClick.subscribe(() => {
      (<SubtitleSettingsResetButtonConfig>this.config).settingsManager.reset();
    });
  }
}
