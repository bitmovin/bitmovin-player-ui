import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {ListBox} from './listbox';
import {UIInstanceManager} from '../uimanager';

export interface ListBoxToggleButtonConfig extends ToggleButtonConfig {
  /**
   * Associated List box which should be toggled when clicking
   */
  listBox: ListBox;

  /**
   * Flag if `ListBoxToggleButton` should hide when there are no selectable items within the `ListBox`-
   * Default: true
   */
  autoHideWhenNoItems?: boolean;
}

export class ListBoxToggleButton extends ToggleButton<ListBoxToggleButtonConfig> {
  constructor(config: ListBoxToggleButtonConfig) {
    super(config);

    if (!config.listBox) {
      throw new Error('Required ListBox is missing');
    }

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-listbox-toggle-button',
      listBox: null,
      autoHideWhenNoItems: true,
    }, this.config as ListBoxToggleButtonConfig);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    let config = this.getConfig() as ListBoxToggleButtonConfig;
    let listBox = config.listBox;

    this.onClick.subscribe(() => {
      listBox.toggleHidden();
    });

    listBox.onShow.subscribe(() => {
      // Set toggle status to on when the list box shows
      this.on();
    });
    listBox.onHide.subscribe(() => {
      // Set toggle status to off when the list box hides
      this.off();
    });

    // Handle automatic hiding of the button if there are no items that can be selected for the user
    if (config.autoHideWhenNoItems) {
      // Setup handler to show/hide button when items changed
      let listBoxItemsChangedHandler = () => {
        if (listBox.itemCount() === 0)
          this.hide();
        else
          this.show();
      };
      // Wire the handler to the events
      listBox.onItemAdded.subscribe(listBoxItemsChangedHandler);
      listBox.onItemRemoved.subscribe(listBoxItemsChangedHandler);

      // Call handler for first init at startup
      listBoxItemsChangedHandler();
    }
  }
}
