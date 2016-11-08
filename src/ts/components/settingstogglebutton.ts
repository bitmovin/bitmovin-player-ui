import {ToggleButton, ToggleButtonConfig} from "./togglebutton";

export class SettingsToggleButton extends ToggleButton<ToggleButtonConfig> {

    constructor(config: ToggleButtonConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-settingstogglebutton',
            text: 'Settings'
        });
    }
}