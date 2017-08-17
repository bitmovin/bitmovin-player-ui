import {SelectBox} from './selectbox';
import {ListSelectorConfig} from './listselector';
import {UIInstanceManager} from '../uimanager';

/**
 * A select box providing a selection between available audio tracks (e.g. different languages).
 */
export class AudioTrackSelectBox extends SelectBox {

  constructor(config: ListSelectorConfig = {}) {
    super(config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let audioTrackHandler = () => {
      let currentAudioTrack = player.getAudio();

      // HLS streams don't always provide this, so we have to check
      if (currentAudioTrack) {
        this.selectItem(currentAudioTrack.id);
      }
    };

    let updateAudioTracks = () => {
      let audioTracks = player.getAvailableAudio();

      this.clearItems();

      // Add audio tracks
      for (let audioTrack of audioTracks) {
        this.addItem(audioTrack.id, audioTrack.label);
      }

      // Select the correct audio track after the tracks have been added
      // This is also important in case we missed the `ON_AUDIO_CHANGED` event, e.g. when `playback.audioLanguage`
      // is configured but the event is fired before the UI is created.
      audioTrackHandler();
    };

    this.onItemSelected.subscribe((sender: AudioTrackSelectBox, value: string) => {
      player.setAudio(value);
    });

    // Update selection when selected track has changed
    player.addEventHandler(player.EVENT.ON_AUDIO_CHANGED, audioTrackHandler);
    // Update tracks when source goes away
    player.addEventHandler(player.EVENT.ON_SOURCE_UNLOADED, updateAudioTracks);
    // Update tracks when a new source is loaded
    player.addEventHandler(player.EVENT.ON_READY, updateAudioTracks);
    // Update tracks when a track is added or removed (since player 7.1.4)
    if (player.EVENT.ON_AUDIO_ADDED && player.EVENT.ON_AUDIO_REMOVED) {
      player.addEventHandler(player.EVENT.ON_AUDIO_ADDED, updateAudioTracks);
      player.addEventHandler(player.EVENT.ON_AUDIO_REMOVED, updateAudioTracks);
    }

    // Populate tracks at startup
    updateAudioTracks();
  }
}