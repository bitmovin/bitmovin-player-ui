/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

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