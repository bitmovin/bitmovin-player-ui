import {ListSelector, ListSelectorConfig} from './components/listselector';
import { UIInstanceManager } from './uimanager';
import { PlayerAPI } from 'bitmovin-player';

/**
 * Helper class to handle all audio tracks related events
 *
 * This class listens to player events as well as the `ListSelector` event if selection changed
 */
export class AudioTrackSwitchHandler {

  private player: PlayerAPI;
  private listElement: ListSelector<ListSelectorConfig>;
  private uimanager: UIInstanceManager;

  constructor(player: PlayerAPI, element: ListSelector<ListSelectorConfig>, uimanager: UIInstanceManager) {
    this.player = player;
    this.listElement = element;
    this.uimanager = uimanager;

    this.bindSelectionEvent();
    this.bindPlayerEvents();
    this.updateAudioTracks();
  }

  private bindSelectionEvent(): void {
    this.listElement.onItemSelected.subscribe((_, value: string) => {
      this.player.setAudio(value);
    });
  }

  private bindPlayerEvents(): void {
    const updateAudioTracksCallback = (): void => this.updateAudioTracks();
    // Update selection when selected track has changed
    this.player.on(this.player.exports.PlayerEvent.AudioChanged, () => {
      this.selectCurrentAudioTrack();
    });
    // Update tracks when source goes away
    this.player.on(this.player.exports.PlayerEvent.SourceUnloaded, updateAudioTracksCallback);
    // Update tracks when the period within a source changes
    this.player.on(this.player.exports.PlayerEvent.PeriodSwitched, updateAudioTracksCallback);
    // Update tracks when a track is added or removed
    this.player.on(this.player.exports.PlayerEvent.AudioAdded, updateAudioTracksCallback);
    this.player.on(this.player.exports.PlayerEvent.AudioRemoved, updateAudioTracksCallback);
    this.uimanager.getConfig().events.onUpdated.subscribe(updateAudioTracksCallback);
  }

  private updateAudioTracks() {
    this.listElement.clearItems();

    // Add audio tracks
    for (let audioTrack of this.player.getAvailableAudio()) {
      this.listElement.addItem(audioTrack.id, audioTrack.label);
    }

    // Select the correct audio track after the tracks have been added
    // This is also important in case we missed the `ON_AUDIO_CHANGED` event, e.g. when `playback.audioLanguage`
    // is configured but the event is fired before the UI is created.
    this.selectCurrentAudioTrack();
  }

  private selectCurrentAudioTrack() {
    let currentAudioTrack = this.player.getAudio();

    // HLS streams don't always provide this, so we have to check
    if (currentAudioTrack) {
      this.listElement.selectItem(currentAudioTrack.id);
    }
  }
}
