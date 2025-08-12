import { UIInstanceManager } from '../../UIManager';
import { SettingsPanelPageNavigatorButton, SettingsPanelPageNavigatorConfig } from './SettingsPanelPageNavigatorButton';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';
import { ButtonStyle } from '../buttons/Button';

/**
 * @category Buttons
 */
export class SettingsPanelPageBackButton extends SettingsPanelPageNavigatorButton {

  constructor(config: SettingsPanelPageNavigatorConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-settingspanelpagebackbutton',
      text: i18n.getLocalizer('back'),
      buttonStyle: ButtonStyle.TextIconLeading,
    } as SettingsPanelPageNavigatorConfig, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onClick.subscribe(() => {
      this.popPage();
    });
  }
}
