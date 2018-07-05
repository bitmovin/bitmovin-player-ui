import {ListBox} from './listbox';
import {Container, ContainerConfig} from './container';
import {ListBoxToggleButton} from './listboxtogglebutton';

export interface ListBoxWrapperConfig extends ContainerConfig {
  listBoxToggleButton: ListBoxToggleButton;
  listBox: ListBox;
}

/**
 * Wrapper which hold the `ListBoxToggleButton` and the `ListBox` itself.
 *
 * DOM example:
 * <code>
 *   <div class='ui-listbox-wrapper>
 *     <button class='ui-listboxitem-toggle-button></button>
 *     <div class='ui-listbox'>
 *       ...
 *     </div>
 *   </div
 * </code>
 */
export class ListBoxWrapper extends Container<ListBoxWrapperConfig> {
  constructor(config: ListBoxWrapperConfig) {
    super(config);
    // set components to ensure `.configure` will be called
    // and rendering will work out of the box
    this.config.components = [config.listBox, config.listBoxToggleButton];

    this.config = this.mergeConfig(config, <ListBoxWrapperConfig>{
      cssClass: 'ui-listbox-wrapper',
    }, this.config);
  }
}
