import {ListSelector, ListSelectorConfig} from 'bitmovin-player-ui/dist/js/framework/components/listselector';




import {DOM} from 'bitmovin-player-ui/dist/js/framework/dom';

export interface ItemSelectionListConfig extends  ListSelectorConfig {
  label?: string;
}

export class ItemSelectionList extends ListSelector<ListSelectorConfig> {

  private label?: string;
  private listElement: DOM;

  constructor(config: ItemSelectionListConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      tag: 'ul',
      cssClass: 'ui-itemselectionlist',
    }, this.config);

    if (config.label != null) {
      this.label = config.label;
    }
  }

  protected isActive(): boolean {
    // Compare to 2, because auto will always be in the list
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

    if (this.label != null) {
      let titleElement = new DOM('span', {
        'type': 'span',
        'class': this.prefixCss('ui-selectionlistitem'),
      }).html(this.label);
      titleElement.addClass(this.prefixCss('highlighted'));
      this.listElement.append(titleElement);
    }

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

      if (item.key === selectedValue + '') { // convert selectedValue to string to catch 'null'/null case
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
