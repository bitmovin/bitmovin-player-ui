import {ListSelector, ListSelectorConfig} from "./listselector";
import {DOM} from "../dom";

export class SelectBox extends ListSelector<ListSelectorConfig> {

    constructor(config: ListSelectorConfig) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-selectbox'
        });
    }

    protected toDomElement(): JQuery {
        let selectElement = DOM.JQuery('<select>', {
            'id': this.config.id
        });

        for(let value in this.config.items) {
            let label = this.config.items[value];
            let optionElement = DOM.JQuery('<option>', {
                'value': value
            }).html(label);

            selectElement.append(optionElement);
        }

        return selectElement;
    }
}