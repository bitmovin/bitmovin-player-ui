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

    let self = this;

    let updateVideoQualities = function() {
      let videoQualities = player.getAvailableVideoQualities();

      self.clearItems();

      // Add entry for automatic quality switching (default setting)
      self.addItem('auto', 'auto');

      // Add video qualities
      for (let videoQuality of videoQualities) {
        self.addItem(videoQuality.id, videoQuality.label);
      }
    };

    self.onItemSelected.subscribe(function(sender: VideoQualitySelectBox, value: string) {
      player.setVideoQuality(value);
    });

    // Update qualities when source goes away
    player.addEventHandler(player.EVENT.ON_SOURCE_UNLOADED, updateVideoQualities);
    // Update qualities when a new source is loaded
    player.addEventHandler(player.EVENT.ON_READY, updateVideoQualities);
    // Update quality selection when quality is changed (from outside)
    player.addEventHandler(player.EVENT.ON_VIDEO_DOWNLOAD_QUALITY_CHANGED, function() {
      let data = player.getDownloadedVideoData();
      self.selectItem(data.isAuto ? 'auto' : data.id);
    });

    // Populate qualities at startup
    updateVideoQualities();
  }
}