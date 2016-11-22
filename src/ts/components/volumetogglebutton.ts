/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

import {ToggleButton, ToggleButtonConfig} from "./togglebutton";
import {UIManager} from "../uimanager";
import VolumeChangeEvent = bitmovin.player.VolumeChangeEvent;

export class VolumeToggleButton extends ToggleButton<ToggleButtonConfig> {

    constructor(config: ToggleButtonConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-volumetogglebutton',
            text: 'Volume/Mute'
        }, this.config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        let self = this;

        let muteStateHandler = function () {
            if (player.isMuted()) {
                self.on();
            } else {
                self.off();
            }
        };

        player.addEventHandler(bitmovin.player.EVENT.ON_MUTE, muteStateHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_UNMUTE, muteStateHandler);

        self.onClick.subscribe(function () {
            if (player.isMuted()) {
                player.unmute();
            } else {
                player.mute();
            }
        });

        player.addEventHandler(bitmovin.player.EVENT.ON_VOLUME_CHANGE, function (event: VolumeChangeEvent) {
            // Toggle low class to display low volume icon below 50% volume
            if (event.targetVolume < 50) {
                self.getDomElement().addClass("low");
            } else {
                self.getDomElement().removeClass("low");
            }
        });
    }
}