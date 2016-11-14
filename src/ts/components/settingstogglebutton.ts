import {ToggleButton, ToggleButtonConfig} from "./togglebutton";
import {SettingsPanel} from "./settingspanel";

export interface SettingsToggleButtonConfig extends ToggleButtonConfig {
    settingsPanel: SettingsPanel;
}

export class SettingsToggleButton extends ToggleButton<SettingsToggleButtonConfig> {

    constructor(config: SettingsToggleButtonConfig) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-settingstogglebutton',
            text: 'Settings',
            settingsPanel: null
        }, <SettingsToggleButtonConfig>this.config);
    }
}