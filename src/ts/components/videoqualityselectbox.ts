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
      if (player.getVideoQuality) {
        // Since player 7.3.1
        this.selectItem(player.getVideoQuality().id);
      } else {
        // Backwards compatibility for players <= 7.3.0
        // TODO remove in next major release
        let data = player.getDownloadedVideoData();
        this.selectItem(data.isAuto ? 'auto' : data.id);
      }
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
    player.addEventHandler(player.EVENT.ON_SOURCE_UNLOADED, updateVideoQualities);
    // Update qualities when a new source is loaded
    player.addEventHandler(player.EVENT.ON_READY, updateVideoQualities);
    // Update quality selection when quality is changed (from outside)
    if (player.EVENT.ON_VIDEO_QUALITY_CHANGED) {
      // Since player 7.3.1
      player.addEventHandler(player.EVENT.ON_VIDEO_QUALITY_CHANGED, selectCurrentVideoQuality);
    } else {
      // Backwards compatibility for players <= 7.3.0
      // TODO remove in next major release
      player.addEventHandler(player.EVENT.ON_VIDEO_DOWNLOAD_QUALITY_CHANGE, selectCurrentVideoQuality);
    }
  }

  /**
   * Returns true if the select box contains an 'auto' item for automatic quality selection mode.
   * @return {boolean}
   */
  hasAutoItem(): boolean {
    return this.hasAuto;
  }
}