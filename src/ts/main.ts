/// <reference path="player.d.ts" />
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
import {Wrapper} from "./components/wrapper";
import {Container} from "./components/container";
import {Label} from "./components/label";
import {AudioQualitySelectBox} from "./components/audioqualityselectbox";
import {AudioTrackSelectBox} from "./components/audiotrackselectbox";

// Expose classes to window
// Inspired by https://keestalkstech.com/2016/08/support-both-node-js-and-browser-js-in-one-typescript-file/
// TODO find out how TS/Browserify can compile the classes to plain JS without the module wrapper we don't need to expose classes to the window scope manually here
(function () {

    let exportables = [
        // Management
        UIManager,
        // Components
        Button, Container, ControlBar, FullscreenToggleButton, HugePlaybackToggleButton, Label, PlaybackTimeLabel,
        PlaybackToggleButton, SeekBar, SelectBox, SettingsPanel, SettingsToggleButton, ToggleButton,
        VideoQualitySelectBox, VolumeToggleButton, VRToggleButton, Watermark, Wrapper, AudioQualitySelectBox, AudioTrackSelectBox
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

} ());