import {ContainerConfig} from './container';
import {SettingsPanelConfig, SettingsPanel, SettingsPanelItem} from './settingspanel'
import {FontColorSelectBox} from './subtitlesoptions/fontcolorselectbox'

export class SubtitleOptions extends SettingsPanel {

  constructor(config: ContainerConfig = {}) {
    super(config);

    this.config = this.mergeConfig<SettingsPanelConfig>(config, {
      cssClass: 'ui-settings-panel',
      hideDelay: 3000,
      hidden: true,
      components: [
        new SettingsPanelItem('Font color', new FontColorSelectBox())
      ]
    }, this.config);
  }
}
