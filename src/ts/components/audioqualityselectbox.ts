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
    player.addEventHandler(player.Event.AudioChanged, updateAudioQualities);
    // Update qualities when source goes away
    player.addEventHandler(player.Event.SourceUnloaded, updateAudioQualities);
    // Update qualities when a new source is loaded
    player.addEventHandler(player.Event.Ready, updateAudioQualities);
    // Update qualities when the period within a source changes
    player.addEventHandler(player.Event.PeriodSwitched, updateAudioQualities);
    // Update quality selection when quality is changed (from outside)
    if (player.Event.AudioQualityChanged) {
      // Since player 7.3.1
      player.addEventHandler(player.Event.AudioQualityChanged, selectCurrentAudioQuality);
    } else {
      // Backwards compatibility for players <= 7.3.0
      // TODO remove in next major release
      player.addEventHandler(player.Event.AudioDownloadQualityChange, selectCurrentAudioQuality);
    }
  }
}