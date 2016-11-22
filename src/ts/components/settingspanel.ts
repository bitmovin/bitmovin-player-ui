/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

import {ContainerConfig, Container} from "./container";
import {SelectBox} from "./selectbox";
import {Label, LabelConfig} from "./label";
import {UIManager} from "../uimanager";
import {VideoQualitySelectBox} from "./videoqualityselectbox";
import {AudioQualitySelectBox} from "./audioqualityselectbox";

export class SettingsPanel extends Container<ContainerConfig> {

    constructor(config: ContainerConfig) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-settings-panel'
        }, this.config);
    }
}

export class SettingsPanelItem extends Container<ContainerConfig> {

    private label: Label<LabelConfig>;
    private setting: SelectBox;

    constructor(label: string, selectBox: SelectBox, config: ContainerConfig = {}) {
        super(config);

        this.label = new Label({text: label});
        this.setting = selectBox;

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-settings-panel-entry',
            components: [this.label, this.setting]
        }, this.config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        let self = this;

        let handleConfigItemChanged = function () {
            // The minimum number of items that must be available for the setting to be displayed
            // By default, at least two items must be available, else a selection is not possible
            let minItemsToDisplay = 2;
            // Audio/video quality select boxes contain an additional "auto" mode, which in combination with a single available quality also does not make sense
            if(self.setting instanceof VideoQualitySelectBox || self.setting instanceof AudioQualitySelectBox) {
                minItemsToDisplay = 3;
            }

            // Hide the setting if no meaningful choice is available
            if(self.setting.itemCount() < minItemsToDisplay) {
                self.hide();
            } else {
                self.show();
            }
        };

        this.setting.onItemAdded.subscribe(handleConfigItemChanged);
        this.setting.onItemRemoved.subscribe(handleConfigItemChanged);

        // Initialize hidden state
        handleConfigItemChanged();
    }
}