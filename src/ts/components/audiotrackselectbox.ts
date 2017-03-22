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

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let updateAudioTracks = () => {
      let audioTracks = player.getAvailableAudio();

      this.clearItems();

      // Add audio tracks
      for (let audioTrack of audioTracks) {
        this.addItem(audioTrack.id, audioTrack.label);
      }
    };

    this.onItemSelected.subscribe((sender: AudioTrackSelectBox, value: string) => {
      player.setAudio(value);
    });

    let audioTrackHandler = () => {
      let currentAudioTrack = player.getAudio();

      // HLS streams don't always provide this, so we have to check
      if (currentAudioTrack) {
        this.selectItem(currentAudioTrack.id);
      }
    };

    // Update selection when selected track has changed
    player.addEventHandler(player.EVENT.ON_AUDIO_CHANGED, audioTrackHandler);
    // Update tracks when source goes away
    player.addEventHandler(player.EVENT.ON_SOURCE_UNLOADED, updateAudioTracks);
    // Update tracks when a new source is loaded
    player.addEventHandler(player.EVENT.ON_READY, updateAudioTracks);

    // Populate tracks at startup
    updateAudioTracks();

    // When `playback.audioLanguage` is set, the `ON_AUDIO_CHANGED` event for that change is triggered before the
    // UI is created. Therefore we need to set the audio track on configure.
    audioTrackHandler();
  }
}