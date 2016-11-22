/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

import {SelectBox} from "./selectbox";
import {ListSelectorConfig} from "./listselector";
import {UIManager} from "../uimanager";

export class VideoQualitySelectBox extends SelectBox {

    constructor(config: ListSelectorConfig = {}) {
        super(config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        let self = this;

        let updateVideoQualities = function () {
            let videoQualities = player.getAvailableVideoQualities();

            self.clearItems();

            // Add entry for automatic quality switching (default setting)
            self.addItem("auto", "auto");

            // Add video qualities
            for (let videoQuality of videoQualities) {
                self.addItem(videoQuality.id, videoQuality.label);
            }
        };

        self.onItemSelected.subscribe(function (sender: VideoQualitySelectBox, value: string) {
            player.setVideoQuality(value);
        });

        player.addEventHandler(bitmovin.player.EVENT.ON_SOURCE_UNLOADED, updateVideoQualities); // Update qualities when source goes away
        player.addEventHandler(bitmovin.player.EVENT.ON_READY, updateVideoQualities); // Update qualities when a new source is loaded
        // TODO update videoQualitySelectBox when video quality is changed from outside (through the API)
        // TODO implement ON_VIDEO_QUALITY_CHANGED event in player API

        // Populate qualities at startup
        updateVideoQualities();
    }
}