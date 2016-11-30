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

/**
 * Configuration interface for the {@link SettingsToggleButton}.
 */
export interface SettingsToggleButtonConfig extends ToggleButtonConfig {
    /**
     * The settings panel whose visibility the button should toggle.
     */
    settingsPanel: SettingsPanel;
}

/**
 * A button that toggles visibility of a settings panel.
 */
export class SettingsToggleButton extends ToggleButton<SettingsToggleButtonConfig> {

    constructor(config: SettingsToggleButtonConfig) {
        super(config);

        if(!config.settingsPanel) {
            throw new Error("Required SettingsPanel is missing");
        }

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-settingstogglebutton',
            text: 'Settings',
            settingsPanel: null
        }, <SettingsToggleButtonConfig>this.config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        let self = this;
        let settingsPanel = (<SettingsToggleButtonConfig>this.getConfig()).settingsPanel;

        this.onClick.subscribe(function () {
            settingsPanel.toggleHidden();
        });
        settingsPanel.onHide.subscribe(function () {
            // Set toggle status to off when the settings panel hides
            self.off();
        })
    }
}