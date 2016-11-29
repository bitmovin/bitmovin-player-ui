/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

/// <reference path="player.d.ts" />
/// <reference path="../../node_modules/@types/core-js/index.d.ts" />
import {UIManager} from "./uimanager";
import {Button} from "./components/button";
import {ControlBar} from "./components/controlbar";
import {FullscreenToggleButton} from "./components/fullscreentogglebutton";
import {HugePlaybackToggleButton} from "./components/hugeplaybacktogglebutton";
import {PlaybackTimeLabel} from "./components/playbacktimelabel";
import {PlaybackToggleButton} from "./components/playbacktogglebutton";
import {SeekBar} from "./components/seekbar";
import {SelectBox} from "./components/selectbox";
import {SettingsPanel} from "./components/settingspanel";
import {SettingsToggleButton} from "./components/settingstogglebutton";
import {ToggleButton} from "./components/togglebutton";
import {VideoQualitySelectBox} from "./components/videoqualityselectbox";
import {VolumeToggleButton} from "./components/volumetogglebutton";
import {VRToggleButton} from "./components/vrtogglebutton";
import {Watermark} from "./components/watermark";
import {UIContainer} from "./components/uicontainer";
import {Container} from "./components/container";
import {Label} from "./components/label";
import {AudioQualitySelectBox} from "./components/audioqualityselectbox";
import {AudioTrackSelectBox} from "./components/audiotrackselectbox";
import {CastStatusOverlay} from "./components/caststatusoverlay";
import {CastToggleButton} from "./components/casttogglebutton";
import {Component} from "./components/component";
import {ErrorMessageOverlay} from "./components/errormessageoverlay";
import {RecommendationOverlay} from "./components/recommendationoverlay";
import {SeekBarLabel} from "./components/seekbarlabel";
import {SubtitleOverlay} from "./components/subtitleoverlay";
import {SubtitleSelectBox} from "./components/subtitleselectbox";
import {TitleBar} from "./components/titlebar";
import {VolumeControlButton} from "./components/volumecontrolbutton";

// Object.assign polyfill for ES5/IE9
// https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
if (typeof Object.assign != 'function') {
    Object.assign = function(target: any) {
        'use strict';
        if (target == null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        target = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source != null) {
                for (var key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
        }
        return target;
    };
}

// Expose classes to window
// Inspired by https://keestalkstech.com/2016/08/support-both-node-js-and-browser-js-in-one-typescript-file/
// TODO find out how TS/Browserify can compile the classes to plain JS without the module wrapper we don't need to expose classes to the window scope manually here
(function () {

    let exportables = [
        // Management
        UIManager,
        // Components
        AudioQualitySelectBox,
        AudioTrackSelectBox,
        Button,
        CastStatusOverlay,
        CastToggleButton,
        Component,
        Container,
        ControlBar,
        ErrorMessageOverlay,
        FullscreenToggleButton,
        HugePlaybackToggleButton,
        Label,
        PlaybackTimeLabel,
        PlaybackToggleButton,
        RecommendationOverlay,
        SeekBar,
        SeekBarLabel,
        SelectBox,
        SettingsPanel,
        SettingsToggleButton,
        SubtitleOverlay,
        SubtitleSelectBox,
        TitleBar,
        ToggleButton,
        UIContainer,
        VideoQualitySelectBox,
        VolumeControlButton,
        VolumeToggleButton,
        VRToggleButton,
        Watermark,
    ];

    (window as any)['bitmovin']['playerui'] = {};
    let uiscope = (window as any)['bitmovin']['playerui'];

    if (window) {
        exportables.forEach(exp => uiscope[nameof(exp)] = exp);
    }

    function nameof(fn: any): string {
        return typeof fn === 'undefined' ? '' : fn.name ? fn.name : (() => {
            let result = /^function\s+([\w\$]+)\s*\(/.exec(fn.toString());
            return !result ? '' : result[1];
        })();
    }

}());