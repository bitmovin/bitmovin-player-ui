import {Button} from "./button";
import {Container} from "./container";
import {DOM} from "./dom";

// Setup JQuery
// NOTE do not use the jquery object directly, only use it through DOM
// TODO find a way around this hacky setup
import jquery = require("jquery");
DOM.setJQuery(jquery);

// Build UI
var button1 = new Button({id: 'b1', text: 'Play'});
var button2 = new Button({id: 'b2', text: 'Pause'});
var controlBar = new Container({cssClass: 'ui-controlbar', components: [button1, button2]});
var container = new Container({cssClass: 'ui-wrapper', components: [controlBar]});
console.log(container);

declare var window: any;
declare var bitmovin: any;
var player = window.bitmovin.player('player');

var conf = {
    key: 'YOUR KEY HERE',
    source: {
        dash: 'http://bitdash-a.akamaihd.net/content/sintel/sintel.mpd'
    }
};

player.setup(conf).then(function() {
    // When player is loaded, add UI
    DOM.JQuery('#player').append(container.toDomElement());

    DOM.JQuery('#b1').click(function() {
        player.play();
    });
    DOM.JQuery('#b2').click(function() {
        player.pause();
    });
}, function() {
    // Error
});
