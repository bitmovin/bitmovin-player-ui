import {ComponentConfig, Component} from "./component";
import {DOM} from "../dom";

/**
 * Configuration interface for a button component.
 */
export interface ButtonConfig extends ComponentConfig {
    /**
     * The text on the button.
     */
    text?: string;
}

export class Button<Config extends ButtonConfig> extends Component<ButtonConfig> {

    constructor(config: ButtonConfig) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-button'
        });

        /** See comment in {@link Container#constructor}. */
        if (this.isHidden()) {
            this.hide();
        }
    }

    protected toDomElement(): JQuery {
        var buttonElement = DOM.JQuery(`<button>`, {
            'type': 'button',
            'id': this.config.id,
            'class': this.getCssClasses()
        }).append(DOM.JQuery(`<span>`, {
            'class': 'label'
        }).html(this.config.text));

        return buttonElement;
    }

}