import {SelectBox} from './selectbox';
import {ListSelectorConfig} from './listselector';
import {UIInstanceManager} from '../uimanager';

/**
 * A select box providing a selection between 'auto' and the available audio qualities.
 */
export class AudioQualitySelectBox extends SelectBox {

  constructor(config: ListSelectorConfig = {}) {
    super(config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let selectCurrentAudioQuality = () => {
      if (player.getAudioQuality) {
        // Since player 7.3.1
        this.selectItem(player.getAudioQuality().id);
      } else {
        // Backwards compatibility for players <= 7.3.0
        // TODO remove in next major release
        let data = player.getDownloadedAudioData();
        this.selectItem(data.isAuto ? 'auto' : data.id);
      }
    };

    let updateAudioQualities = () => {
      let audioQualities = player.getAvailableAudioQualities();

      this.clearItems();

      // Add entry for automatic quality switching (default setting)
      this.addItem('auto', 'auto');

      // Add audio qualities
      for (let audioQuality of audioQualities) {
        this.addItem(audioQuality.id, audioQuality.label);
      }

      // Select initial quality
      selectCurrentAudioQuality();
    };

    this.onItemSelected.subscribe((sender: AudioQualitySelectBox, value: string) => {
      player.setAudioQuality(value);
    });

    // Update qualities when audio track has changed
    player.addEventHandler(player.EVENT.ON_AUDIO_CHANGED, updateAudioQualities);
    // Update qualities when source goes away
    player.addEventHandler(player.EVENT.ON_SOURCE_UNLOADED, updateAudioQualities);
    // Update qualities when a new source is loaded
    player.addEventHandler(player.EVENT.ON_READY, updateAudioQualities);
    // Update quality selection when quality is changed (from outside)
    if (player.EVENT.ON_AUDIO_QUALITY_CHANGED) {
      // Since player 7.3.1
      player.addEventHandler(player.EVENT.ON_AUDIO_QUALITY_CHANGED, selectCurrentAudioQuality);
    } else {
      // Backwards compatibility for players <= 7.3.0
      // TODO remove in next major release
      player.addEventHandler(player.EVENT.ON_AUDIO_DOWNLOAD_QUALITY_CHANGE, selectCurrentAudioQuality);
    }
  }
}