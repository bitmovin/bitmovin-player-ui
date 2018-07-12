import {ListSelector, ListSelectorConfig} from './components/listselector';
import {SubtitleListBox} from './components/subtitlelistbox';
import {SubtitleSelectBox} from './components/subtitleselectbox';

/**
 * Helper class to handle all subtitle related events
 *
 * This class listens to player events as well as the `ListSelector` event if selection changed
 */
export class AudioTrackSwitchHandler {

  private player: bitmovin.PlayerAPI;
  private listElement: ListSelector<ListSelectorConfig>;

  constructor(player: bitmovin.PlayerAPI, element: ListSelector<ListSelectorConfig>) {
    this.player = player;
    this.listElement = element;

    this.bindSelectionEvent();
    this.bindPlayerEvents();
    const callback = this.buildUpdateSAudioTracksCallback();
    callback();
  }

  private bindSelectionEvent(): void {
    this.listElement.onItemSelected.subscribe((_, value: string) => {
      this.player.setAudio(value);
    });
  }

  private bindPlayerEvents(): void {
    this.player.addEventHandler(this.player.EVENT.ON_SUBTITLE_ADDED, this.buildUpdateSAudioTracksCallback());
    this.player.addEventHandler(this.player.EVENT.ON_SUBTITLE_CHANGED, this.buildSelectCurrentAudioTrackCallback());
    this.player.addEventHandler(this.player.EVENT.ON_SUBTITLE_REMOVED, this.buildUpdateSAudioTracksCallback());
    // Update subtitles when source goes away
    this.player.addEventHandler(this.player.EVENT.ON_SOURCE_UNLOADED, this.buildUpdateSAudioTracksCallback());
    // Update subtitles when a new source is loaded
    this.player.addEventHandler(this.player.EVENT.ON_READY, this.buildUpdateSAudioTracksCallback());
    // Update subtitles when the period within a source changes
    this.player.addEventHandler(this.player.EVENT.ON_PERIOD_SWITCHED, this.buildUpdateSAudioTracksCallback());
  }

  private buildUpdateSAudioTracksCallback(): () => void {
    return () => {
      this.listElement.clearItems();

      // Add audio tracks
      for (let audioTrack of this.player.getAvailableAudio()) {
        this.listElement.addItem(audioTrack.id, audioTrack.label);
      }

      // Select the correct subtitle after the subtitles have been added
      const callback = this.buildSelectCurrentAudioTrackCallback();
      callback();
    };
  }

  private buildSelectCurrentAudioTrackCallback(): () => void {
    return () => {
      let currentAudioTrack = this.player.getAudio();

      if (currentAudioTrack) {
        this.listElement.selectItem(currentAudioTrack.id);
      }
    };
  }
}
