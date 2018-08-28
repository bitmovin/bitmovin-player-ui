import {UIInstanceManager} from '../uimanager';
import {SettingsPanelPageNavigatorButton, SettingsPanelPageNavigatorConfig} from './settingspanelpagenavigatorbutton';

export class SettingsPanelPageBackButton extends SettingsPanelPageNavigatorButton {

  constructor(config: SettingsPanelPageNavigatorConfig) {
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
