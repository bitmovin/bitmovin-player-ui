import {DOM} from "./dom";
import jquery = require("jquery");
DOM.setJQuery(jquery); // TODO find a way around this hacky setup
import {UIManager} from "./uimanager";
import {Button, ButtonConfig} from "./components/button";
import {Wrapper} from "./components/wrapper";
import {ControlBar} from "./components/controlbar";
import {PlaybackToggleButton} from "./components/playbacktogglebutton";
import {FullscreenToggleButton} from "./components/fullscreentogglebutton";
import {VRToggleButton} from "./components/vrtogglebutton";

// Build UI
var button1 = new Button<ButtonConfig>({id: 'b1', text: 'Play'});
var button2 = new Button<ButtonConfig>({id: 'b2', text: 'Pause'});
var playbackToggleButton = new PlaybackToggleButton({text: 'Play/Pause'});
var fullscreenToggleButton = new FullscreenToggleButton({text: 'Fullscreen'});
var vrToggleButton = new VRToggleButton({text: 'VR'});
var controlBar = new ControlBar({components: [button1, button2, playbackToggleButton, fullscreenToggleButton, vrToggleButton]});
var ui = new Wrapper({ components: [controlBar]});
console.log(ui);

declare var window: any;
declare var bitmovin: any;
var player = window.bitmovin.player('player');

var conf = {
    key: 'YOUR KEY HERE',
    source: {
        dash: 'http://bitdash-a.akamaihd.net/content/sintel/sintel.mpd'
    },
    style: {
        ux: false
    }
};

player.setup(conf).then(function() {
    // When player is loaded, add UI
    new UIManager(player, ui);

    button1.getDomElement().click(function() {
        player.play();
    });

    button2.getDomElement().click(function() {
        player.pause();
    });
}, function() {
    // Error
});
