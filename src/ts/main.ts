import {Button} from "./button";
import {Wrapper} from "./wrapper";
import {DOM} from "./dom";
import {ControlBar} from "./controlbar";

// Setup JQuery
// NOTE do not use the jquery object directly, only use it through DOM
// TODO find a way around this hacky setup
import jquery = require("jquery");
DOM.setJQuery(jquery);

// Build UI
var button1 = new Button({id: 'b1', text: 'Play'});
var button2 = new Button({id: 'b2', text: 'Pause'});
var controlBar = new ControlBar({components: [button1, button2]});
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
    DOM.JQuery('#player').append(ui.toDomElement());

    DOM.JQuery('#b1').click(function() {
        player.play();
    });
    DOM.JQuery('#b2').click(function() {
        player.pause();
    });
}, function() {
    // Error
});
