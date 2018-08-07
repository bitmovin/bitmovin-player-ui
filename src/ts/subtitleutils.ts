import {ListSelector, ListSelectorConfig} from './components/listselector';

/**
 * Helper class to handle all subtitle related events
 *
 * This class listens to player events as well as the `ListSelector` event if selection changed
 */
export class SubtitleSwitchHandler {

  private player: bitmovin.PlayerAPI;
  private listElement: ListSelector<ListSelectorConfig>;

  constructor(player: bitmovin.PlayerAPI, element: ListSelector<ListSelectorConfig>) {
    this.player = player;
    this.listElement = element;

    this.bindSelectionEvent();
    this.bindPlayerEvents();
    this.updateSubtitles();
  }

  private bindSelectionEvent(): void {
    this.listElement.onItemSelected.subscribe((_, value: string) => {
      this.player.setSubtitle(value === 'null' ? null : value);
    });
  }

  private bindPlayerEvents(): void {
    const updateSubtitlesCallback = (): void => {
      this.updateSubtitles();
    };

    this.player.addEventHandler(this.player.EVENT.ON_SUBTITLE_ADDED, updateSubtitlesCallback);
    this.player.addEventHandler(this.player.EVENT.ON_SUBTITLE_CHANGED, () => {
      this.selectCurrentSubtitle();
    });
    this.player.addEventHandler(this.player.EVENT.ON_SUBTITLE_REMOVED, updateSubtitlesCallback);
    // Update subtitles when source goes away
    this.player.addEventHandler(this.player.EVENT.ON_SOURCE_UNLOADED, updateSubtitlesCallback);
    // Update subtitles when a new source is loaded
    this.player.addEventHandler(this.player.EVENT.ON_READY, updateSubtitlesCallback);
    // Update subtitles when the period within a source changes
    this.player.addEventHandler(this.player.EVENT.ON_PERIOD_SWITCHED, updateSubtitlesCallback);
  }

  private updateSubtitles(): void {
    this.listElement.clearItems();

    for (let subtitle of this.player.getAvailableSubtitles()) {
      this.listElement.addItem(subtitle.id, subtitle.label);
    }

    // Select the correct subtitle after the subtitles have been added
    this.selectCurrentSubtitle();
  }

  private selectCurrentSubtitle() {
    let currentSubtitle = this.player.getSubtitle();

    if (currentSubtitle) {
      this.listElement.selectItem(currentSubtitle.id);
    }
  }
}
