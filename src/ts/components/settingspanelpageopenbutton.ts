import {UIInstanceManager} from '../uimanager';
import {SettingsPanelPageNavigatorButton, SettingsPanelPageNavigatorConfig} from './settingspanelpagenavigatorbutton';
import { PlayerAPI } from 'bitmovin-player';

export class SettingsPanelPageOpenButton extends SettingsPanelPageNavigatorButton {
  constructor(config: SettingsPanelPageNavigatorConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-settingspanelpageopenbutton',
      text: 'open',
    } as SettingsPanelPageNavigatorConfig, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onClick.subscribe(() => {
      this.pushTargetPage();
    });
  }
}
