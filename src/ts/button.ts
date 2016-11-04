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

export class Button extends Component<ButtonConfig> {

    constructor(config: ButtonConfig) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-button'
        });
    }

    toDomElement(): JQuery {
        var buttonElement = DOM.JQuery(`<button>`, {
            'type': 'button',
            'id': this.config.id,
            'class': this.getCssClasses()
        }).html(this.config.text);

        return buttonElement;
    }

}