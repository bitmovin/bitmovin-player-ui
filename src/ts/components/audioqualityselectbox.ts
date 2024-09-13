import {SelectBox} from './selectbox';
import {ListSelectorConfig} from './listselector';
import {UIInstanceManager} from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../localization/i18n';

/**
 * A select box providing a selection between 'auto' and the available audio qualities.
 *
 * @category Components
 */
export class AudioQualitySelectBox extends SelectBox {

  constructor(config: ListSelectorConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-audioqualityselectbox'],
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let selectCurrentAudioQuality = () => {
      this.selectItem(player.getAudioQuality().id);
    };

    let updateAudioQualities = () => {
      let audioQualities = player.getAvailableAudioQualities();

      this.clearItems();

      // Add entry for automatic quality switching (default setting)
      this.addItem('auto', i18n.getLocalizer('auto'));

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
    player.on(player.exports.PlayerEvent.AudioChanged, updateAudioQualities);
    // Update qualities when source goes away
    player.on(player.exports.PlayerEvent.SourceUnloaded, updateAudioQualities);
    // Update qualities when the period within a source changes
    player.on(player.exports.PlayerEvent.PeriodSwitched, updateAudioQualities);
    // Update quality selection when quality is changed (from outside)
    player.on(player.exports.PlayerEvent.AudioQualityChanged, selectCurrentAudioQuality);
    if ((player.exports.PlayerEvent as any).AudioQualityAdded) {
      // Update qualities when their availability changed
      // TODO: remove any cast after next player release
      player.on((player.exports.PlayerEvent as any).AudioQualityAdded, updateAudioQualities);
      player.on((player.exports.PlayerEvent as any).AudioQualityRemoved, updateAudioQualities);
    }

    uimanager.getConfig().events.onUpdated.subscribe(updateAudioQualities);
  }
}