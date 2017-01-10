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

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let self = this;

    let updateAudioQualities = function() {
      let audioQualities = player.getAvailableAudioQualities();

      self.clearItems();

      // Add entry for automatic quality switching (default setting)
      self.addItem('auto', 'auto');

      // Add audio qualities
      for (let audioQuality of audioQualities) {
        self.addItem(audioQuality.id, audioQuality.label);
      }
    };

    self.onItemSelected.subscribe(function(sender: AudioQualitySelectBox, value: string) {
      player.setAudioQuality(value);
    });

    // Update qualities when audio track has changed
    player.addEventHandler(bitmovin.player.EVENT.ON_AUDIO_CHANGED, updateAudioQualities);
    // Update qualities when source goes away
    player.addEventHandler(bitmovin.player.EVENT.ON_SOURCE_UNLOADED, updateAudioQualities);
    // Update qualities when a new source is loaded
    player.addEventHandler(bitmovin.player.EVENT.ON_READY, updateAudioQualities);
    // Update quality selection when quality is changed (from outside)
    player.addEventHandler(bitmovin.player.EVENT.ON_AUDIO_DOWNLOAD_QUALITY_CHANGED, function() {
      let data = player.getDownloadedAudioData();
      self.selectItem(data.isAuto ? 'auto' : data.id);
    });

    // Populate qualities at startup
    updateAudioQualities();
  }
}