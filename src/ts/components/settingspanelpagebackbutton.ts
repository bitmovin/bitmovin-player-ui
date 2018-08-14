import {UIInstanceManager} from '../uimanager';
import {SettingsPanelNavigatorButton, SettingsPanelNavigatorConfig} from './settingspanelnavigatorbutton';

export class SettingsPanelPageBackButton extends SettingsPanelNavigatorButton {

  constructor(config: SettingsPanelNavigatorConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-settingspanelpagebackbutton',
      text: 'back',
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onClick.subscribe(() => {
      this.popPage();
    });
  }
}
