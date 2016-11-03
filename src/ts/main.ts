import {Button} from "./button";
import {Container} from "./container";
import {DOM} from "./dom";

import jquery = require("jquery");
DOM.setJQuery(jquery);

var button1 = new Button({id: 'b1', text: 'blubb'});
var button2 = new Button({id: 'b2', text: 'bla'});

var container = new Container({components: [button1, button2]});
console.log(container);
console.log(container.toHtml());
