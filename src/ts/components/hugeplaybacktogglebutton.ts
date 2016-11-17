/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

import {ToggleButtonConfig} from "./togglebutton";
import {PlaybackToggleButton} from "./playbacktogglebutton";
import {DOM} from "../dom";
import {UIManager} from "../uimanager";

export class HugePlaybackToggleButton extends PlaybackToggleButton {

    constructor(config: ToggleButtonConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-hugeplaybacktogglebutton',
            text: 'Play/Pause'
        }, this.config);
    }


    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        // Update button state through API events
        super.configure(player, uimanager, false);

        let self = this;

        let togglePlayback = function () {
            if (player.isPlaying()) {
                player.pause();
            } else {
                player.play();
            }
        };

        let toggleFullscreen = function () {
            if (player.isFullscreen()) {
                player.exitFullscreen();
            } else {
                player.enterFullscreen();
            }
        };

        let clickTime = 0;
        let doubleClickTime = 0;

        /*
         * YouTube-style toggle button handling
         *
         * The goal is to prevent a short pause or playback interval between a click, that toggles playback, and a
         * double click, that toggles fullscreen. In this naive approach, the first click would e.g. start playback,
         * the second click would be detected as double click and toggle to fullscreen, and as second normal click stop
         * playback, which results is a short playback interval with max length of the double click detection
         * period (usually 500ms).
         *
         * To solve this issue, we defer handling of the first click for 200ms, which is almost unnoticeable to the user,
         * and just toggle playback if no second click (double click) has been registered during this period. If a double
         * click is registered, we just toggle the fullscreen. In the first 200ms, undesired playback changes thus cannot
         * happen. If a double click is registered within 500ms, we undo the playback change and switch fullscreen mode.
         * In the end, this method basically introduces a 200ms observing interval in which playback changes are prevented
         * if a double click happens.
         */
        self.onClick.subscribe(function () {
            let now = Date.now();

            if (now - clickTime < 200) {
                // We have a double click inside the 200ms interval, just toggle fullscreen mode
                toggleFullscreen();
                doubleClickTime = now;
                return;
            } else if (now - clickTime < 500) {
                // We have a double click inside the 500ms interval, undo playback toggle and toggle fullscreen mode
                toggleFullscreen();
                togglePlayback();
                doubleClickTime = now;
                return;
            }

            clickTime = now;

            setTimeout(function () {
                if (Date.now() - doubleClickTime > 200) {
                    // No double click detected, so we toggle playback and wait what happens next
                    togglePlayback();
                }
            }, 200);
        });

        // Hide the huge playback button during VR playback to let mouse events pass through and navigate the VR viewport
        self.onToggle.subscribe(function() {
            if(player.getVRStatus().contentType != 'none') {
                if (player.isPlaying()) {
                    self.hide();
                } else {
                    self.show();
                }
            }
        });
    }

    protected toDomElement(): JQuery {
        var buttonElement = super.toDomElement();

        // Add child that contains the play button image
        // Setting the image directly on the button does not work together with scaling animations, because the button
        // can cover the whole video player are and scaling would extend it beyond. By adding an inner element, confined
        // to the size if the image, it can scale inside the player without overshooting.
        buttonElement.append(DOM.JQuery(`<div>`, {
            'class': 'image'
        }));

        return buttonElement;
    }
}