import {ToggleButton, ToggleButtonConfig} from "./togglebutton";
import {SettingsPanel} from "./settingspanel";
import {UIManager} from "../uimanager";

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


    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        this.onClick.subscribe(function(sender: SettingsToggleButton) {
            (<SettingsToggleButtonConfig>sender.getConfig()).settingsPanel.toggleHidden();
        });
    }
}