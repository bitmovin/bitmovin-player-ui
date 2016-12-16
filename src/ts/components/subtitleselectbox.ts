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
import SubtitleAddedEvent = bitmovin.player.SubtitleAddedEvent;
import SubtitleChangedEvent = bitmovin.player.SubtitleChangedEvent;
import SubtitleRemovedEvent = bitmovin.player.SubtitleRemovedEvent;

/**
 * A select box providing a selection between available subtitle and caption tracks.
 */
export class SubtitleSelectBox extends SelectBox {

    constructor(config: ListSelectorConfig = {}) {
        super(config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        super.configure(player, uimanager);

        let self = this;

        let updateSubtitles = function () {
            self.clearItems();

            for (let subtitle of player.getAvailableSubtitles()) {
                self.addItem(subtitle.id, subtitle.label);
            }
        };

        self.onItemSelected.subscribe(function (sender: SubtitleSelectBox, value: string) {
            player.setSubtitle(value === "null" ? null : value);
        });

        // React to API events
        player.addEventHandler(bitmovin.player.EVENT.ON_SUBTITLE_ADDED, function (event: SubtitleAddedEvent) {
            self.addItem(event.subtitle.id, event.subtitle.label);
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_SUBTITLE_CHANGED, function (event: SubtitleChangedEvent) {
            self.selectItem(event.targetSubtitle.id);
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_SUBTITLE_REMOVED, function (event: SubtitleRemovedEvent) {
            self.removeItem(event.subtitleId);
        });

        player.addEventHandler(bitmovin.player.EVENT.ON_SOURCE_UNLOADED, updateSubtitles); // Update subtitles when source goes away
        player.addEventHandler(bitmovin.player.EVENT.ON_READY, updateSubtitles); // Update subtitles when a new source is loaded

        // Populate subtitles at startup
        updateSubtitles();
    }
}