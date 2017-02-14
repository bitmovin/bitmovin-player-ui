import {SelectBox} from './selectbox';
import {ListSelectorConfig} from './listselector';
import {UIInstanceManager} from '../uimanager';

/**
 * A select box providing a selection between 'auto' and the available video qualities.
 */
export class VideoQualitySelectBox extends SelectBox {

  constructor(config: ListSelectorConfig = {}) {
    super(config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let updateVideoQualities = () => {
      let videoQualities = player.getAvailableVideoQualities();

      this.clearItems();

      // Add entry for automatic quality switching (default setting)
      this.addItem('auto', 'auto');

      // Add video qualities
      for (let videoQuality of videoQualities) {
        this.addItem(videoQuality.id, videoQuality.label);
      }
    };

    this.onItemSelected.subscribe((sender: VideoQualitySelectBox, value: string) => {
      player.setVideoQuality(value);
    });

    // Update qualities when source goes away
    player.addEventHandler(player.EVENT.ON_SOURCE_UNLOADED, updateVideoQualities);
    // Update qualities when a new source is loaded
    player.addEventHandler(player.EVENT.ON_READY, updateVideoQualities);
    // Update quality selection when quality is changed (from outside)
    player.addEventHandler(player.EVENT.ON_VIDEO_DOWNLOAD_QUALITY_CHANGED, () => {
      let data = player.getDownloadedVideoData();
      this.selectItem(data.isAuto ? 'auto' : data.id);
    });

    // Populate qualities at startup
    updateVideoQualities();
  }
}