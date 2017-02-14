import {SelectBox} from './selectbox';
import {ListSelectorConfig} from './listselector';
import {UIInstanceManager} from '../uimanager';
import SubtitleAddedEvent = bitmovin.player.SubtitleAddedEvent;
import SubtitleChangedEvent = bitmovin.player.SubtitleChangedEvent;
import SubtitleRemovedEvent = bitmovin.player.SubtitleRemovedEvent;

/**
 * A select box providing a selection between available subtitle and caption tracks.
 */
export class SubtitleSelectBox extends SelectBox {

  constructor(config: ListSelectorConfig = {}) {
    super(config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let updateSubtitles = () => {
      this.clearItems();

      for (let subtitle of player.getAvailableSubtitles()) {
        this.addItem(subtitle.id, subtitle.label);
      }
    };

    this.onItemSelected.subscribe((sender: SubtitleSelectBox, value: string) => {
      player.setSubtitle(value === 'null' ? null : value);
    });

    // React to API events
    player.addEventHandler(player.EVENT.ON_SUBTITLE_ADDED, (event: SubtitleAddedEvent) => {
      this.addItem(event.subtitle.id, event.subtitle.label);
    });
    player.addEventHandler(player.EVENT.ON_SUBTITLE_CHANGED, (event: SubtitleChangedEvent) => {
      this.selectItem(event.targetSubtitle.id);
    });
    player.addEventHandler(player.EVENT.ON_SUBTITLE_REMOVED, (event: SubtitleRemovedEvent) => {
      this.removeItem(event.subtitleId);
    });

    // Update subtitles when source goes away
    player.addEventHandler(player.EVENT.ON_SOURCE_UNLOADED, updateSubtitles);
    // Update subtitles when a new source is loaded
    player.addEventHandler(player.EVENT.ON_READY, updateSubtitles);

    // Populate subtitles at startup
    updateSubtitles();
  }
}