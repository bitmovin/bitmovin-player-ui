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

export enum TimeLabelMode {
    CurrentTime,
    TotalTime,
    CurrentAndTotalTime,
}

export interface PlaybackTimeLabelConfig extends LabelConfig {
    timeLabelMode?: TimeLabelMode;
    hideInLivePlayback?: boolean;
}

/**
 * A label that display the current playback time and the total time through {@link PlaybackTimeLabel#setTime setTime}
 * or any string through {@link PlaybackTimeLabel#setText setText}.
 */
export class PlaybackTimeLabel extends Label<PlaybackTimeLabelConfig> {

    constructor(config: PlaybackTimeLabelConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, <PlaybackTimeLabelConfig>{
            cssClass: "ui-playbacktimelabel",
            timeLabelMode: TimeLabelMode.CurrentAndTotalTime,
            hideInLivePlayback: false,
        }, this.config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        super.configure(player, uimanager);

        let self = this;
        let config = <PlaybackTimeLabelConfig>self.getConfig();
        let live = false;
        let liveCssClass = self.prefixCss("ui-playbacktimelabel-live");
        let liveEdgeCssClass = self.prefixCss("ui-playbacktimelabel-live-edge");
        let minWidth = 0;

        let liveClickHandler = function () {
            player.timeShift(0);
        };

        let updateLiveState = function () {
            // Player is playing a live stream when the duration is infinite
            live = (player.getDuration() === Infinity);

            // Attach/detach live marker class
            if (live) {
                self.getDomElement().addClass(liveCssClass);
                self.setText("Live");
                if (config.hideInLivePlayback) {
                    self.hide();
                }
                self.onClick.subscribe(liveClickHandler);
                updateLiveTimeshiftState();
            } else {
                self.getDomElement().removeClass(liveCssClass);
                self.getDomElement().removeClass(liveEdgeCssClass);
                self.show();
                self.onClick.unsubscribe(liveClickHandler);
            }
        };

        let updateLiveTimeshiftState = function () {
            if (player.getTimeShift() === 0) {
                self.getDomElement().addClass(liveEdgeCssClass);
            } else {
                self.getDomElement().removeClass(liveEdgeCssClass);
            }
        };

        let playbackTimeHandler = function () {
            if ((player.getDuration() === Infinity) !== live) {
                updateLiveState();
            }

            if (!live) {
                self.setTime(player.getCurrentTime(), player.getDuration());
            }

            // To avoid "jumping" in the UI by varying label sizes due to non-monospaced fonts,
            // we gradually increase the min-width with the content to reach a stable size.
            let width = self.getDomElement().width();
            if (width > minWidth) {
                minWidth = width;
                self.getDomElement().css({
                    "min-width": minWidth + "px"
                });
            }
        };

        player.addEventHandler(bitmovin.player.EVENT.ON_READY, playbackTimeHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_TIME_CHANGED, playbackTimeHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_SEEKED, playbackTimeHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_TIME_UPDATED, playbackTimeHandler);

        player.addEventHandler(bitmovin.player.EVENT.ON_TIME_SHIFT, updateLiveTimeshiftState);
        player.addEventHandler(bitmovin.player.EVENT.ON_TIME_SHIFTED, updateLiveTimeshiftState);

        // Reset min-width when a new source is ready (especially for switching VOD/Live modes where the label content changes)
        player.addEventHandler(bitmovin.player.EVENT.ON_READY, function () {
            minWidth = 0;
            self.getDomElement().css({
                "min-width": null
            });
        });

        // Init time display (when the UI is initialized, it's too late for the ON_READY event)
        playbackTimeHandler();
    }

    /**
     * Sets the current playback time and total duration.
     * @param playbackSeconds the current playback time in seconds
     * @param durationSeconds the total duration in seconds
     */
    setTime(playbackSeconds: number, durationSeconds: number) {
        switch ((<PlaybackTimeLabelConfig>this.config).timeLabelMode) {
            case TimeLabelMode.CurrentTime:
                this.setText(`${StringUtils.secondsToTime(playbackSeconds)}`);
                break;
            case TimeLabelMode.TotalTime:
                this.setText(`${StringUtils.secondsToTime(durationSeconds)}`);
                break;
            case TimeLabelMode.CurrentAndTotalTime:
                this.setText(`${StringUtils.secondsToTime(playbackSeconds)} / ${StringUtils.secondsToTime(durationSeconds)}`);
                break;
        }
    }
}