import {ComponentConfig, Component} from "./component";
import {DOM} from "../dom";

/**
 * Configuration interface for a label component.
 */
export interface LabelConfig extends ComponentConfig {
    /**
     * The text on the label.
     */
    text?: string;
}

export class Label<Config extends LabelConfig> extends Component<LabelConfig> {

    constructor(config: LabelConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-label'
        }, this.config);
    }

    protected toDomElement(): JQuery {
        var labelElement = DOM.JQuery(`<span>`, {
            'id': this.config.id,
            'class': this.getCssClasses()
        }).html(this.config.text);

        return labelElement;
    }

    setText(text: string) {
        this.getDomElement().html(text);
    }
}