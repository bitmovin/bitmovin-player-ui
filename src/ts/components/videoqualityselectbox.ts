import {SelectBox} from './selectbox';
import {ListSelectorConfig} from './listselector';
import {UIInstanceManager} from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../localization/i18n';

/**
 * A select box providing a selection between 'auto' and the available video qualities.
 */
export class VideoQualitySelectBox extends SelectBox {

  private hasAuto: boolean;

  constructor(config: ListSelectorConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-videoqualityselectbox'],
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
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
        this.addItem('auto', i18n.getLocalizableCallback('auto'));
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
    player.on(player.exports.PlayerEvent.SourceUnloaded, updateVideoQualities);
    // Update qualities when the period within a source changes
    player.on(player.exports.PlayerEvent.PeriodSwitched, updateVideoQualities);
    // Update quality selection when quality is changed (from outside)
    player.on(player.exports.PlayerEvent.VideoQualityChanged, selectCurrentVideoQuality);

    if ((player.exports.PlayerEvent as any).VideoQualityAdded) {
      // Update qualities when their availability changed
      // TODO: remove any cast after next player release
      player.on((player.exports.PlayerEvent as any).VideoQualityAdded, updateVideoQualities);
      player.on((player.exports.PlayerEvent as any).VideoQualityRemoved, updateVideoQualities);
    }

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