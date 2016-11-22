/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

import {Container, ContainerConfig} from "./container";
import {UIManager} from "../uimanager";
import {LabelConfig, Label} from "./label";

export interface TitleBarConfig extends ContainerConfig {
    /**
     * The delay after which the title bar will be hidden when there is no user interaction.
     * Default: 5 seconds
     */
    hideDelay?: number;
}

export class TitleBar extends Container<TitleBarConfig> {

    private label: Label<LabelConfig>;

    constructor(config: TitleBarConfig = {}) {
        super(config);

        this.label = new Label({cssClass: 'ui-titlebar-label'});

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-titlebar',
            hidden: true,
            hideDelay: 5000,
            components: [this.label]
        }, <TitleBarConfig>this.config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        let self = this;
        let hideDelayTimeoutHandle = 0;

        if (uimanager.getConfig() && uimanager.getConfig().metadata) {
            self.label.setText(uimanager.getConfig().metadata.title);
        } else {
            // Cancel configuration if there is no metadata to display
            // TODO this probably won't work if we put the share buttons into the title bar
            return;
        }

        // Clears the hide timeout if active
        let clearHideTimeout = function () {
            clearTimeout(hideDelayTimeoutHandle);
        };

        // Activates the hide timeout and clears a previous timeout if active
        let setHideTimeout = function () {
            clearHideTimeout();
            hideDelayTimeoutHandle = setTimeout(function () {
                self.hide();
            }, (<TitleBarConfig>self.getConfig()).hideDelay); // TODO fix generics to spare these damn casts... is that even possible in TS?
        };

        uimanager.onMouseEnter.subscribe(function (sender, args) {
            self.show(); // show control bar when the mouse enters the UI

            // Clear timeout to avoid hiding the bar if the mouse moves back into the UI during the timeout period
            clearHideTimeout();
        });
        uimanager.onMouseMove.subscribe(function (sender, args) {
            if (self.isHidden()) {
                self.show();
            }
            setHideTimeout(); // hide the bar if mouse does not move during the timeout time
        });
        uimanager.onMouseLeave.subscribe(function (sender, args) {
            setHideTimeout(); // hide bar some time after the mouse left the UI
        });
    }
}