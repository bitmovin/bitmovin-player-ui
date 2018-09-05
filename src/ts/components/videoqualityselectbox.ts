import {SelectBox} from './selectbox';
import {ListSelectorConfig} from './listselector';
import {UIInstanceManager} from '../uimanager';

/**
 * A select box providing a selection between 'auto' and the available video qualities.
 */
export class VideoQualitySelectBox extends SelectBox {

  private hasAuto: boolean;

  constructor(config: ListSelectorConfig = {}) {
    super(config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let selectCurrentVideoQuality = () => {
      this.selectItem(player.getVideoQuality().id);
    };

    let updateVideoQualities = () => {
      let videoQualities = player.getAvailableVideoQualities();

      this.clearItems();

      // Progressive streams do not support automatic quality selection
      this.hasAuto = player.getStreamType() !== 'progressive';

      if (this.hasAuto) {
        // Add entry for automatic quality switching (default setting)
        this.addItem('auto', 'auto');
      }

      // Add video qualities
      for (let videoQuality of videoQualities) {
        this.addItem(videoQuality.id, videoQuality.label);
      }

      // Select initial quality
      selectCurrentVideoQuality();
    };

    this.onItemSelected.subscribe((sender: VideoQualitySelectBox, value: string) => {
      player.setVideoQuality(value);
    });

    // Update qualities when source goes away
    player.on(player.exports.Event.SourceUnloaded, updateVideoQualities);
    // Update qualities when the period within a source changes
    player.on(player.exports.Event.PeriodSwitched, updateVideoQualities);
    // Update quality selection when quality is changed (from outside)
    player.on(player.exports.Event.VideoQualityChanged, selectCurrentVideoQuality);

    // Listen to the UI event when components need to update them-self
    // Will also be triggered on player.exports.Event.SourceLoaded
    uimanager.getConfig().events.onUpdated.subscribe(updateVideoQualities);
  }

  /**
   * Returns true if the select box contains an 'auto' item for automatic quality selection mode.
   * @return {boolean}
   */
  hasAutoItem(): boolean {
    return this.hasAuto;
  }
}