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
    player.addEventHandler(player.EVENT.SubtitleAdded, updateSubtitles);
    player.addEventHandler(player.EVENT.SubtitleChanged, selectCurrentSubtitle);
    player.addEventHandler(player.EVENT.SubtitleRemoved, updateSubtitles);
    // Update subtitles when source goes away
    player.addEventHandler(player.EVENT.SourceUnloaded, updateSubtitles);
    // Update subtitles when a new source is loaded
    player.addEventHandler(player.EVENT.Ready, updateSubtitles);
    // Update subtitles when the period within a source changes
    player.addEventHandler(player.EVENT.PeriodSwitched, updateSubtitles);

    // Populate subtitles at startup
    updateSubtitles();
  }
}