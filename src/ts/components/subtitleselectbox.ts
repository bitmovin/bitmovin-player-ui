import {SelectBox} from './selectbox';
import {ListSelectorConfig} from './listselector';
import {UIInstanceManager} from '../uimanager';

/**
 * A select box providing a selection between available subtitle and caption tracks.
 */
export class SubtitleSelectBox extends SelectBox {

  constructor(config: ListSelectorConfig = {}) {
    super(config);
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

    this.onItemSelected.subscribe((sender: SubtitleSelectBox, value: string) => {
      player.setSubtitle(value === 'null' ? null : value);
    });

    // React to API events
    player.on(player.EVENT.ON_SUBTITLE_ADDED, updateSubtitles);
    player.on(player.EVENT.ON_SUBTITLE_CHANGED, selectCurrentSubtitle);
    player.on(player.EVENT.ON_SUBTITLE_REMOVED, updateSubtitles);
    // Update subtitles when source goes away
    player.on(player.EVENT.ON_SOURCE_UNLOADED, updateSubtitles);
    // Update subtitles when a new source is loaded
    player.on(player.EVENT.ON_READY, updateSubtitles);
    // Update subtitles when the period within a source changes
    player.on(player.EVENT.ON_PERIOD_SWITCHED, updateSubtitles);

    // Populate subtitles at startup
    updateSubtitles();
  }
}