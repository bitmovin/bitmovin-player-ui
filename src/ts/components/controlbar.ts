/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

import {ContainerConfig, Container} from "./container";
import {UIManager} from "../uimanager";

export interface ControlBarConfig extends ContainerConfig {
    /**
     * The delay after which the control bar will be hidden when there is no user interaction.
     * Default: 5 seconds
     */
    hideDelay?: number;
}

export class ControlBar extends Container<ControlBarConfig> {

    constructor(config: ControlBarConfig) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-controlbar',
            hidden: true,
            hideDelay: 5000
        }, <ControlBarConfig>this.config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        let self = this;
        let isSeeking = false;
        let controlBarHideDelayTimeoutHandle = 0;

        // Clears the hide timeout if active
        let clearHideTimeout = function () {
            clearTimeout(controlBarHideDelayTimeoutHandle);
        };

        // Activates the hide timeout and clears a previous timeout if active
        let setHideTimeout = function () {
            clearHideTimeout();
            controlBarHideDelayTimeoutHandle = setTimeout(function () {
                self.hide();
            }, (<ControlBarConfig>self.getConfig()).hideDelay); // TODO fix generics to spare these damn casts... is that even possible in TS?
        };

        uimanager.onMouseEnter.subscribe(function (sender, args) {
            self.show(); // show control bar when the mouse enters the UI

            // Clear timeout to avoid hiding the control bar if the mouse moves back into the UI during the timeout period
            clearHideTimeout();
        });
        uimanager.onMouseMove.subscribe(function (sender, args) {
            if (self.isHidden()) {
                self.show();
            }
            if (isSeeking) {
                // Don't create/update timeout while seeking
                return;
            }
            setHideTimeout(); // hide the control bar if mouse does not move during the timeout time
        });
        uimanager.onMouseLeave.subscribe(function (sender, args) {
            if (isSeeking) {
                // Don't create/update timeout while seeking
                return;
            }

            setHideTimeout(); // hide control bar some time after the mouse left the UI
        });
        uimanager.onSeek.subscribe(function () {
            clearHideTimeout(); // DOn't hide control bar while a seek is in progress
            isSeeking = true;
        });
        uimanager.onSeeked.subscribe(function () {
            isSeeking = false;
            setHideTimeout(); // hide control bar some time after a seek has finished
        });
    }
}