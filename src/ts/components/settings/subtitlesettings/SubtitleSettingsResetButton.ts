import {UIInstanceManager} from '../../../UIManager';
import {SubtitleSettingsManager} from '../../../utils/SubtitleSettingsManager';
import {Button, ButtonConfig} from '../../buttons/Button';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../../localization/i18n';

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
      cssClass: 'ui-settings-panel-navigation-text-button',
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
