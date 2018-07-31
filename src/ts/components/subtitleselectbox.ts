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
    player.on(player.Event.SubtitleAdded, updateSubtitles);
    player.on(player.Event.SubtitleChanged, selectCurrentSubtitle);
    player.on(player.Event.SubtitleRemoved, updateSubtitles);
    // Update subtitles when source goes away
    player.on(player.Event.SourceUnloaded, updateSubtitles);
    // Update subtitles when a new source is loaded
    player.on(player.Event.Ready, updateSubtitles);
    // Update subtitles when the period within a source changes
    player.on(player.Event.PeriodSwitched, updateSubtitles);

    // Populate subtitles at startup
    updateSubtitles();
  }
}