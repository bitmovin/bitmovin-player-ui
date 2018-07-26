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

    let selectCurrentAudioTrack = () => {
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
      // This is also important in case we missed the `AudioChanged` event, e.g. when `playback.audioLanguage`
      // is configured but the event is fired before the UI is created.
      selectCurrentAudioTrack();
    };

    this.onItemSelected.subscribe((sender: AudioTrackSelectBox, value: string) => {
      player.setAudio(value);
    });

    // Update selection when selected track has changed
    player.addEventHandler(player.Event.AudioChanged, selectCurrentAudioTrack);
    // Update tracks when source goes away
    player.addEventHandler(player.Event.SourceUnloaded, updateAudioTracks);
    // Update tracks when a new source is loaded
    player.addEventHandler(player.Event.Ready, updateAudioTracks);
    // Update tracks when the period within a source changes
    player.addEventHandler(player.Event.PeriodSwitched, updateAudioTracks);
    // Update tracks when a track is added or removed (since player 7.1.4)
    if (player.Event.AudioAdded && player.Event.AudioRemoved) {
      player.addEventHandler(player.Event.AudioAdded, updateAudioTracks);
      player.addEventHandler(player.Event.AudioRemoved, updateAudioTracks);
    }

    // Populate tracks at startup
    updateAudioTracks();
  }
}