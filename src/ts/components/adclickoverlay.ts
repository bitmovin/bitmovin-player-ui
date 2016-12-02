/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

import {ClickOverlay} from "./clickoverlay";
import {UIManager} from "../uimanager";

/**
 * A simple click capture overlay for clickThroughUrls of ads.
 */
export class AdClickOverlay extends ClickOverlay {

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        let self = this;

        player.addEventHandler(bitmovin.player.EVENT.ON_AD_STARTED, function (event: bitmovin.player.AdStartedEvent) {
            self.setUrl(event.clickThroughUrl);
        });
    }
}