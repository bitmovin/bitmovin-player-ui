import {UIManager} from "./uimanager";
import {Wrapper} from "./components/wrapper";
import {ControlBar} from "./components/controlbar";
import {PlaybackToggleButton} from "./components/playbacktogglebutton";
import {FullscreenToggleButton} from "./components/fullscreentogglebutton";
import {VRToggleButton} from "./components/vrtogglebutton";
import {VolumeToggleButton} from "./components/volumetogglebutton";
import {SeekBar} from "./components/seekbar";
import {Watermark} from "./components/watermark";
import {HugePlaybackToggleButton} from "./components/hugeplaybacktogglebutton";
import {PlaybackTimeLabel} from "./components/playbacktimelabel";
import {Label} from "./components/label";
import {SettingsToggleButton} from "./components/settingstogglebutton";
import {SettingsPanel} from "./components/settingspanel";
import {VideoQualitySelectBox} from "./components/videoqualityselectbox";

// Build UI
var playbackToggleButton = new PlaybackToggleButton();
var fullscreenToggleButton = new FullscreenToggleButton();
var vrToggleButton = new VRToggleButton();
var volumeToggleButton = new VolumeToggleButton();
var timeLabel = new PlaybackTimeLabel();
var seekBar = new SeekBar();

var settingsPanel = new SettingsPanel({
    components: [new Label({text: 'Video Quality'}), new VideoQualitySelectBox()],
    hidden: true
});
var settingsToggleButton = new SettingsToggleButton({settingsPanel: settingsPanel});

var controlBar = new ControlBar({
    components: [settingsPanel, playbackToggleButton, seekBar, timeLabel,
        vrToggleButton, volumeToggleButton, settingsToggleButton, fullscreenToggleButton]
});
var watermark = new Watermark();
var hugePlaybackToggleButton = new HugePlaybackToggleButton();
var ui = new Wrapper({components: [hugePlaybackToggleButton, controlBar, watermark], cssClasses: ['ui-skin-default']});
console.log(ui);

declare var window: any;
declare var bitmovin: any;
var player = window.bitmovin.player('player');

var conf = {
    key: 'YOUR KEY HERE',
    source: {
        dash: 'http://bitdash-a.akamaihd.net/content/sintel/sintel.mpd'

        // dash: 'https://bitmovin-a.akamaihd.net/content/playhouse-vr/mpds/105560.mpd',
        // vr: {
        //     contentType: 'single'
        // }
    },
    style: {
        ux: false
    }
};

player.setup(conf).then(function() {
    // Add UI to loaded player
    new UIManager(player, ui);
}, function() {
    // Error
});
