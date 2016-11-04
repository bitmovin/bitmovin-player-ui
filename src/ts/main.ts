import {Button} from "./button";
import {Wrapper} from "./wrapper";
import {DOM} from "./dom";
import {ControlBar} from "./controlbar";
import {UIManager} from "./uimanager";
import {PlaybackToggleButton} from "./playbacktogglebutton";

// Setup JQuery
// NOTE do not use the jquery object directly, only use it through DOM
// TODO find a way around this hacky setup
import jquery = require("jquery");
DOM.setJQuery(jquery);

// Build UI
var button1 = new Button({id: 'b1', text: 'Play'});
var button2 = new Button({id: 'b2', text: 'Pause'});
var playbackToggleButton = new PlaybackToggleButton({text: 'Play/Pause'});
var controlBar = new ControlBar({components: [button1, button2, playbackToggleButton]});
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
