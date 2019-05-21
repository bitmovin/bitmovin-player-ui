import { ToggleButton, ToggleButtonConfig } from './togglebutton';
import { ListItem, ListSelector, ListSelectorConfig } from './listselector';
import {DOM} from '../dom';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../uimanager';
import { ArrayUtils } from '../arrayutils';

/**
 * A element to select a single item out of a list of available items.
 *
 * DOM example:
 * <code>
 *   <div class='ui-listbox'>
 *     <button class='ui-listbox-button'>label</button>
 *     ...
 *   </div
 * </code>
 */
// TODO: change to extends container in v4
export class ListBox extends ListSelector<ListSelectorConfig> {
  private listBoxElement: DOM;
  private components: ListBoxItemButton[] = [];

  constructor(config: ListSelectorConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-listbox',
    } as ListSelectorConfig, this.config);
  }

  public configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    // Subscribe before super call to receive initial events
    this.onItemAdded.subscribe(this.addListBoxDomItem);
    this.onItemRemoved.subscribe(this.removeListBoxDomItem);
    this.onItemSelected.subscribe(this.refreshSelectedItem);

    super.configure(player, uimanager);
  }

  protected toDomElement(): DOM {
    let listBoxElement = new DOM('div', {
      'id': this.config.id,
      'class': this.getCssClasses(),
    });

    this.listBoxElement = listBoxElement;
    this.createListBoxDomItems();
    this.refreshSelectedItem();

    return listBoxElement;
  }

  private createListBoxDomItems() {
    // Delete all children
    this.listBoxElement.empty();
    this.components = [];

    // Add updated children
    for (let item of this.items) {
      this.addListBoxDomItem(this, item.key);
    }
  }

  private removeListBoxDomItem = (_: ListBox, key: string) => {
    const component = this.getComponentForKey(key);
    if (component) {
      component.getDomElement().remove();
      ArrayUtils.remove(this.components, component);
    }
  };

  private addListBoxDomItem = (_: ListBox, key: string) => {
    const component = this.getComponentForKey(key);
    const newItem = this.getItemForKey(key);
    if (component) {
      // Update existing component
      component.setText(newItem.label);
    } else {
      const listBoxItemButton = this.buildListBoxItemButton(newItem);

      listBoxItemButton.onClick.subscribe(() => {
        this.handleSelectionChange(listBoxItemButton);
      });

      this.components.push(listBoxItemButton);
      this.listBoxElement.append(listBoxItemButton.getDomElement());
    }
  };

  private refreshSelectedItem = () => {
    // TODO: get's triggered twice

    for (let item of this.items) {
      const component = this.getComponentForKey(item.key);
      if (component) {
        String(component.key) === String(this.selectedItem) ? component.on() : component.off();
      }
    }
  };

  private buildListBoxItemButton(listItem: ListItem): ListBoxItemButton {
    return new ListBoxItemButton({
      key: listItem.key,
      text: listItem.label,
    });
  }

  private getComponentForKey(key: string): ListBoxItemButton {
    return this.components.find((c) => key === c.key);
  }

  private handleSelectionChange = (sender: ListBoxItemButton) => {
    this.onItemSelectedEvent(sender.key);
  };
}

interface ListBoxItemButtonConfig extends ToggleButtonConfig {
  /**
   * key to identify selected item. Similar to the value attribute of an select option.
   */
  key: string;
}

class ListBoxItemButton extends ToggleButton<ListBoxItemButtonConfig> {

  constructor(config: ListBoxItemButtonConfig) {
    super(config);

    this.config = this.mergeConfig<ToggleButtonConfig>(config, {
      cssClass: 'ui-listbox-button',
      onClass: 'selected',
      offClass: '',
    }, this.config);
  }

  get key(): string {
    return (this.config as ListBoxItemButtonConfig).key;
  }
}
