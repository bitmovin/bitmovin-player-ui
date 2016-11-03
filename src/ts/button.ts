import {ComponentConfig, Component} from "./component";

export interface ButtonConfig extends ComponentConfig {
    text?: string;
}

export class Button extends Component {

    constructor(config: ButtonConfig) {
        super(config);
        console.log(this);
        console.log(config);
    }

}