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
        // TODO update audioQualitySelectBox when audio quality is changed from outside (through the API)
        // TODO implement ON_AUDIO_QUALITY_CHANGED event in player API

        // Populate qualities at startup
        updateAudioQualities();
    }
}