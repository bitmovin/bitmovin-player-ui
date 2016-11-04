import {ComponentConfig, Component} from "./component";
import {DOM} from "./dom";

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

    private config: ButtonConfig;

    constructor(config: ButtonConfig) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-container'
        });
    }

    toDomElement(): JQuery {
        var buttonElement = DOM.JQuery(`<button>${this.config.text}</button>`, {
            id: this.config.id,
            class: this.config.cssClass
        });

        return buttonElement;
    }

}