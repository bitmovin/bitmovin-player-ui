import {SelectBox} from './selectbox';
import {ListSelectorConfig} from './listselector';
import {UIInstanceManager} from '../uimanager';
import {AudioTrackSwitchHandler} from '../audiotrackutils';
import { PlayerAPI } from 'bitmovin-player';
import { i18n, LocalizableText } from '../localization/i18n';

/**
 * A select box providing a selection between available audio tracks (e.g. different languages).
 */
export class AudioTrackSelectBox extends SelectBox {

  constructor(config: ListSelectorConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-audiotrackselectbox'],
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    new AudioTrackSwitchHandler(player, this, uimanager);
  }

  /**
   * Adds an item (i.e. an audio track) to the list of items respecting the order of keys.
   * If an item with the specified key already exists, it is replaced.
   */
  addItem(key: string, label: LocalizableText) {
    const listItem = { key: key, label: i18n.performLocalization(label) };

    // Apply filter function
    if (this.config.filter && !this.config.filter(listItem)) {
      return;
    }

    // Apply translator function
    if (this.config.translator) {
      listItem.label = this.config.translator(listItem);
    }

    // Try to remove key first to get overwrite behavior and avoid duplicate keys
    this.removeItem(key); // This will trigger an ItemRemoved and an ItemAdded event

    // Add the item to the list respecting the key order
    const index = this.items.findIndex(entry => entry.key > key);
    if (index < 0) {
      this.items.push(listItem);
    } else {
      this.items.splice(index, 0, listItem);
    }
    this.onItemAddedEvent(key);
  }
}