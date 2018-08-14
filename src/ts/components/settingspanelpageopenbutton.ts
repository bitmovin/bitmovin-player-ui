import {UIInstanceManager} from '../uimanager';
import {SettingsPanelNavigatorButton, SettingsPanelNavigatorConfig} from './settingspanelnavigatorbutton';

export class SettingsPanelPageOpenButton extends SettingsPanelNavigatorButton {
  constructor(config: SettingsPanelNavigatorConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-settingspanelpageopenbutton',
      text: 'open',
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onClick.subscribe(() => {
      this.pushTargetPage();
    });
  }
}
