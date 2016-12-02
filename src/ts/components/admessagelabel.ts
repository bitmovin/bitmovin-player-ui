/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

import {Label, LabelConfig} from "./label";
import {UIManager} from "../uimanager";

/**
 * A label that displays a message about a running ad, optionally with a countdown.
 */
export class AdMessageLabel extends Label<LabelConfig> {

    constructor(config: LabelConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: "ui-label-ad-message",
            text: "This ad will end in {remainingTime} seconds."
        }, this.config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        let self = this;
        let text = this.getConfig().text;

        let updateMessageHandler = function () {
            let remainingTime = Math.ceil(player.getDuration() - player.getCurrentTime());
            self.setText(text.replace("{remainingTime}", String(remainingTime)));
        };

        player.addEventHandler(bitmovin.player.EVENT.ON_TIME_CHANGED, updateMessageHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_TIME_UPDATE, updateMessageHandler);
    }
}