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

export class AudioQualitySelectBox extends SelectBox {

    constructor(config: ListSelectorConfig = {}) {
        super(config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        let self = this;

        let updateAudioQualities = function () {
            let audioQualities = player.getAvailableAudioQualities();

            self.clearItems();

            // Add entry for automatic quality switching (default setting)
            self.addItem("auto", "auto");

            // Add audio qualities
            for (let audioQuality of audioQualities) {
                self.addItem(audioQuality.id, audioQuality.label);
            }
        };

        self.onItemSelected.subscribe(function (sender: AudioQualitySelectBox, value: string) {
            player.setAudioQuality(value);
        });

        player.addEventHandler(bitmovin.player.EVENT.ON_AUDIO_CHANGE, updateAudioQualities); // Update qualities when audio track has changed
        player.addEventHandler(bitmovin.player.EVENT.ON_SOURCE_UNLOADED, updateAudioQualities); // Update qualities when source goes away
        player.addEventHandler(bitmovin.player.EVENT.ON_READY, updateAudioQualities); // Update qualities when a new source is loaded
        player.addEventHandler(bitmovin.player.EVENT.ON_AUDIO_DOWNLOAD_QUALITY_CHANGE, function () {
            let data = player.getDownloadedAudioData();
            self.selectItem(data.isAuto ? "auto" : data.id);
        }); // Update quality selection when quality is changed (from outside)

        // Populate qualities at startup
        updateAudioQualities();
    }
}