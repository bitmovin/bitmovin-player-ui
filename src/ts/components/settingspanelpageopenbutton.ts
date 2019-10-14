import {UIInstanceManager} from '../uimanager';
import {SettingsPanelPageNavigatorButton, SettingsPanelPageNavigatorConfig} from './settingspanelpagenavigatorbutton';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../localization/i18n';

export class SettingsPanelPageOpenButton extends SettingsPanelPageNavigatorButton {
  constructor(config: SettingsPanelPageNavigatorConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-settingspanelpageopenbutton',
      text: i18n.t('open'),
    } as SettingsPanelPageNavigatorConfig, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onClick.subscribe(() => {
      this.pushTargetPage();
    });
  }
}
