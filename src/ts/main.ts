import {Button} from "./button";
import {Container} from "./container";
import {DOM} from "./dom";

// Setup JQuery
// NOTE do not use the jquery object directly, only use it through DOM
// TODO find a way around this hacky setup
import jquery = require("jquery");
DOM.setJQuery(jquery);

// Build UI
var button1 = new Button({id: 'b1', text: 'blubb'});
var button2 = new Button({id: 'b2', text: 'bla'});

var container = new Container({components: [button1, button2]});
console.log(container);

// Add UI to player
DOM.JQuery('#player').append(container.toDomElement());
