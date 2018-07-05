import {ListBox} from './listbox';
import {ListSelectorConfig} from './listselector';
import {UIInstanceManager} from '../uimanager';

/**
 * A element that is similar to a select box where the user can select a subtitle
 */
export class SubtitlesListBox extends ListBox {
  constructor(config: ListSelectorConfig = {}) {
    super(config);
    this.config = this.mergeConfig(config, {
      cssClass: 'ui-subtitles-listbox',
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    let selectCurrentSubtitle = () => {
      let currentSubtitle = player.getSubtitle();

      if (currentSubtitle) {
        this.selectItem(currentSubtitle.id);
      }
    };

    let updateSubtitles = () => {
      this.clearItems();

      for (let subtitle of player.getAvailableSubtitles()) {
        this.addItem(subtitle.id, subtitle.label);
      }

      // Select the correct subtitle after the subtitles have been added
      selectCurrentSubtitle();
    };

    this.onItemSelected.subscribe((sender, key) => {
      player.setSubtitle(key);
    });

    // React to API events
    player.addEventHandler(player.EVENT.ON_SUBTITLE_ADDED, updateSubtitles);
    player.addEventHandler(player.EVENT.ON_SUBTITLE_CHANGED, selectCurrentSubtitle);
    player.addEventHandler(player.EVENT.ON_SUBTITLE_REMOVED, updateSubtitles);
    // Update subtitles when source goes away
    player.addEventHandler(player.EVENT.ON_SOURCE_UNLOADED, updateSubtitles);
    // Update subtitles when a new source is loaded
    player.addEventHandler(player.EVENT.ON_READY, updateSubtitles);
    // Update subtitles when the period within a source changes
    player.addEventHandler(player.EVENT.ON_PERIOD_SWITCHED, updateSubtitles);

    // Populate subtitles at startup
    updateSubtitles();
  }
}