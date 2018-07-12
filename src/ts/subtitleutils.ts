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
    const callback = this.buildUpdateSubtitlesCallback();
    callback();
  }

  private bindSelectionEvent(): void {
    this.listElement.onItemSelected.subscribe((_, value: string) => {
      this.player.setSubtitle(value === 'null' ? null : value);
    });
  }

  private bindPlayerEvents(): void {
    this.player.addEventHandler(this.player.EVENT.ON_SUBTITLE_ADDED, this.buildUpdateSubtitlesCallback());
    this.player.addEventHandler(this.player.EVENT.ON_SUBTITLE_CHANGED, this.buildSelectCurrentSubtitleCallback());
    this.player.addEventHandler(this.player.EVENT.ON_SUBTITLE_REMOVED, this.buildUpdateSubtitlesCallback());
    // Update subtitles when source goes away
    this.player.addEventHandler(this.player.EVENT.ON_SOURCE_UNLOADED, this.buildUpdateSubtitlesCallback());
    // Update subtitles when a new source is loaded
    this.player.addEventHandler(this.player.EVENT.ON_READY, this.buildUpdateSubtitlesCallback());
    // Update subtitles when the period within a source changes
    this.player.addEventHandler(this.player.EVENT.ON_PERIOD_SWITCHED, this.buildUpdateSubtitlesCallback());
  }

  private buildUpdateSubtitlesCallback(): () => void {
    return () => {
      this.listElement.clearItems();

      for (let subtitle of this.player.getAvailableSubtitles()) {
        this.listElement.addItem(subtitle.id, subtitle.label);
      }

      // Select the correct subtitle after the subtitles have been added
      const callback = this.buildSelectCurrentSubtitleCallback();
      callback();
    };
  }

  private buildSelectCurrentSubtitleCallback(): () => void {
    return () => {
      let currentSubtitle = this.player.getSubtitle();

      if (currentSubtitle) {
        this.listElement.selectItem(currentSubtitle.id);
      }
    };
  }
}
