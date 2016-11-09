import {ComponentConfig, Component} from "./component";
import {DOM} from "../dom";
import {EventDispatcher, NoArgs, Event} from "../eventdispatcher";

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

    protected buttonEvents = {
        onClick: new EventDispatcher<Button<Config>, NoArgs>()
    };

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

        let self = this;
        buttonElement.on('click', function() {
            self.onClickEvent();
        });

        return buttonElement;
    }

    protected onClickEvent() {
        this.buttonEvents.onClick.dispatch(this);
    }

    get onClick() : Event<Button<Config>, NoArgs> {
        return this.buttonEvents.onClick;
    }
}