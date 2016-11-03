import {sayHello} from "./greet";
import {Button} from "./button";

function showHello(divName: string, name: string) {
    const elt = document.getElementById(divName);
    elt.innerText = sayHello(name);
}

showHello("greeting", "TypeScript");

var test2 = new Button({ id: 'testid', text: 'blubb' });