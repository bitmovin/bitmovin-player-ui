/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

import {LabelConfig, Label} from "./label";
import {UIManager} from "../uimanager";
import {StringUtils} from "../utils";

/**
 * A label that display the current playback time and the total time through {@link PlaybackTimeLabel#setTime setTime}
 * or any string through {@link PlaybackTimeLabel#setText setText}.
 */
export class PlaybackTimeLabel extends Label<LabelConfig> {

    constructor(config: LabelConfig = {}) {
        super(config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        let self = this;

        let playbackTimeHandler = function () {
            if (player.getDuration() == Infinity) {
                self.setText('Live');
            } else {
                self.setTime(player.getCurrentTime(), player.getDuration());
            }
        };

        player.addEventHandler(bitmovin.player.EVENT.ON_TIME_CHANGED, playbackTimeHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_SEEKED, playbackTimeHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_TIME_UPDATE, playbackTimeHandler);

        // Init time display (when the UI is initialized, it's too late for the ON_READY event)
        playbackTimeHandler();
    }

    /**
     * Sets the current playback time and total duration.
     * @param playbackSeconds the current playback time in seconds
     * @param durationSeconds the total duration in seconds
     */
    setTime(playbackSeconds: number, durationSeconds: number) {
        this.setText(`${StringUtils.secondsToTime(playbackSeconds)} / ${StringUtils.secondsToTime(durationSeconds)}`);
    }
}