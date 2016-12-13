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
import {Timeout} from "../timeout";

/**
 * Configuration interface for a {@link TitleBar}.
 */
export interface TitleBarConfig extends ContainerConfig {
    /**
     * The delay in milliseconds after which the title bar will be hidden when there is no user interaction.
     * Default: 5 seconds (5000)
     */
    hideDelay?: number;
}

/**
 * Displays a title bar containing a label with the title of the video.
 */
export class TitleBar extends Container<TitleBarConfig> {

    private label: Label<LabelConfig>;

    constructor(config: TitleBarConfig = {}) {
        super(config);

        this.label = new Label({cssClass: "ui-titlebar-label"});

        this.config = this.mergeConfig(config, {
            cssClass: "ui-titlebar",
            hidden: true,
            hideDelay: 5000,
            components: [this.label]
        }, <TitleBarConfig>this.config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        super.configure(player, uimanager);

        let self = this;

        if (uimanager.getConfig() && uimanager.getConfig().metadata) {
            self.label.setText(uimanager.getConfig().metadata.title);
        } else {
            // Cancel configuration if there is no metadata to display
            // TODO this probably won't work if we put the share buttons into the title bar
            return;
        }

        let timeout = new Timeout((<TitleBarConfig>self.getConfig()).hideDelay, function () {
            self.hide();
        });

        uimanager.onMouseEnter.subscribe(function (sender, args) {
            self.show(); // show control bar when the mouse enters the UI

            // Clear timeout to avoid hiding the bar if the mouse moves back into the UI during the timeout period
            timeout.clear();
        });
        uimanager.onMouseMove.subscribe(function (sender, args) {
            if (self.isHidden()) {
                self.show();
            }
            timeout.reset(); // hide the bar if mouse does not move during the timeout time
        });
        uimanager.onMouseLeave.subscribe(function (sender, args) {
            timeout.reset(); // hide bar some time after the mouse left the UI
        });
    }
}