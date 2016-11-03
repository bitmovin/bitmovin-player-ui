import {ComponentConfig, Component} from "./component";

/**
 * Configuration interface for a button component.
 */
export interface ButtonConfig extends ComponentConfig {
    /**
     * The text on the button.
     */
    text?: string;
}

export class Button extends Component {

    constructor(config: ButtonConfig) {
        super(config);
        console.log(this);
        console.log(config);
    }

}