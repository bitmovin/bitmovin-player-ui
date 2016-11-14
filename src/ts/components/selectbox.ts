import {ListSelector, ListSelectorConfig} from "./listselector";
import {DOM} from "../dom";

export class SelectBox extends ListSelector<ListSelectorConfig> {

    private selectElement: JQuery;

    constructor(config: ListSelectorConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-selectbox'
        }, this.config);
    }

    protected toDomElement(): JQuery {
        let selectElement = DOM.JQuery('<select>', {
            'id': this.config.id,
            'class': this.getCssClasses()
        });

        this.selectElement = selectElement;
        this.updateDomItems();

        let self = this;
        selectElement.on('change', function () {
            let value = DOM.JQuery(this).val();
            self.onItemSelectedEvent(value, false);
        });

        return selectElement;
    }

    protected updateDomItems(selectedValue: string = null) {
        // Delete all children
        this.selectElement.empty();

        // Add updated children
        for (let value in this.items) {
            let label = this.items[value];
            let optionElement = DOM.JQuery('<option>', {
                'value': value
            }).html(label);

            if (value == selectedValue) {
                optionElement.attr('selected', 'selected');
            }

            this.selectElement.append(optionElement);
        }
    }

    protected onItemAddedEvent(value: string) {
        super.onItemAddedEvent(value);
        this.updateDomItems(this.selectedItem);
    }

    protected onItemRemovedEvent(value: string) {
        super.onItemRemovedEvent(value);
        this.updateDomItems(this.selectedItem);
    }

    protected onItemSelectedEvent(value: string, updateDomItems: boolean = true) {
        super.onItemSelectedEvent(value);
        if (updateDomItems) {
            this.updateDomItems(value);
        }
    }
}