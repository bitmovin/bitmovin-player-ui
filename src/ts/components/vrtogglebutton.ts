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

/**
 * A button that toggles the video view between normal/mono and VR/stereo.
 */
export class VRToggleButton extends ToggleButton<ToggleButtonConfig> {

    constructor(config: ToggleButtonConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: "ui-vrtogglebutton",
            text: "VR"
        }, this.config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        super.configure(player, uimanager);

        let self = this;

        let isVRConfigured = function () {
            // VR availability cannot be checked through getVRStatus() because it is asynchronously populated and not
            // available at UI initialization. As an alternative, we check the VR settings in the config.
            // TODO use getVRStatus() through isVRStereoAvailable() once the player has been rewritten and the status is available in ON_READY
            let config = player.getConfig();
            return config.source && config.source.vr && config.source.vr.contentType !== "none";
        };

        let isVRStereoAvailable = function () {
            return player.getVRStatus().contentType !== "none";
        };

        let vrStateHandler = function () {
            if (isVRConfigured() && isVRStereoAvailable()) {
                self.show(); // show button in case it is hidden

                if (player.getVRStatus().isStereo) {
                    self.on();
                } else {
                    self.off();
                }
            } else {
                self.hide(); // hide button if no stereo mode available
            }
        };

        let vrButtonVisibilityHandler = function () {
            if (isVRConfigured()) {
                self.show();
            } else {
                self.hide();
            }
        };

        player.addEventHandler(bitmovin.player.EVENT.ON_VR_MODE_CHANGED, vrStateHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_VR_STEREO_CHANGED, vrStateHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_VR_ERROR, vrStateHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_SOURCE_UNLOADED, vrButtonVisibilityHandler); // Hide button when VR source goes away
        player.addEventHandler(bitmovin.player.EVENT.ON_READY, vrButtonVisibilityHandler); // Show button when a new source is loaded and it's VR

        self.onClick.subscribe(function () {
            if (!isVRStereoAvailable()) {
                if (console) console.log("No VR content");
            } else {
                if (player.getVRStatus().isStereo) {
                    player.setVRStereo(false);
                } else {
                    player.setVRStereo(true);
                }
            }
        });

        // Set startup visibility
        vrButtonVisibilityHandler();
    }
}