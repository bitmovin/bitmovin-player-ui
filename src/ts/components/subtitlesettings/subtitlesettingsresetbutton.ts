import {UIInstanceManager} from '../../uimanager';
import {SubtitleSettingsManager} from './subtitlesettingsmanager';
import {Button, ButtonConfig} from '../button';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';

/**
 * A button that resets all subtitle settings to their defaults.
 *
 * @category Buttons
 */
export class SubtitleSettingsResetButton extends Button<ButtonConfig> {

  private settingsManager: SubtitleSettingsManager;

  constructor(config: ButtonConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-subtitlesettingsresetbutton',
      text: i18n.getLocalizer('reset'),
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    this.settingsManager = uimanager.getSubtitleSettingsManager();

    this.onClick.subscribe(() => {
      this.settingsManager.reset();
    });
  }
}
