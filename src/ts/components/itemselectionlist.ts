import {ListSelector, ListSelectorConfig} from './listselector';
import {DOM} from '../dom';

export class ItemSelectionList extends ListSelector<ListSelectorConfig> {

  private listElement: DOM;

  constructor(config: ListSelectorConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      tag: 'ul',
      cssClass: 'ui-itemselectionlist',
    }, this.config);
  }

  protected isActive(): boolean {
    return this.items.length > 1;
  }

  protected toDomElement(): DOM {
    let listElement = new DOM('ul', {
      'id': this.config.id,
      'class': this.getCssClasses(),
    });

    this.listElement = listElement;
    this.updateDomItems();

    return listElement;
  }

  protected updateDomItems(selectedValue: string = null) {
    // Delete all children
    this.listElement.empty();

    for (let item of this.items) {
      let optionElement = new DOM('li', {
        'type': 'li',
        'class': this.prefixCss('ui-selectionlistitem'),
      }).append(new DOM('a', {
      }).html(item.label));

      if (selectedValue == null) { // If there is no pre-selected value, select the first one
        optionElement.addClass(this.prefixCss('selected'));
        selectedValue = item.key; // Ensure no other item get selected
      }

      if (item.key === String(selectedValue)) { // convert selectedValue to string to catch 'null'/null case
        optionElement.addClass(this.prefixCss('selected'));
      }

      optionElement.on('click', () => {
        this.onItemSelectedEvent(item.key, true);
      });

      this.listElement.append(optionElement);
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
