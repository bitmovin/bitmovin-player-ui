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
    const updateSubtitlesCallback = (): void => this.updateSubtitles();

    this.player.on(this.player.exports.Event.SubtitleAdded, updateSubtitlesCallback);
    this.player.on(this.player.exports.Event.SubtitleChanged, () => {
      this.selectCurrentSubtitle();
    });
    this.player.on(this.player.exports.Event.SubtitleRemoved, updateSubtitlesCallback);
    // Update subtitles when source goes away
    this.player.on(this.player.exports.Event.SourceUnloaded, updateSubtitlesCallback);
    // Update subtitles when a new source is loaded
    this.player.on(this.player.exports.Event.Ready, updateSubtitlesCallback);
    // Update subtitles when the period within a source changes
    this.player.on(this.player.exports.Event.PeriodSwitched, updateSubtitlesCallback);
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
