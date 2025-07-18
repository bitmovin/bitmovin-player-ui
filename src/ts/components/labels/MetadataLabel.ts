import {LabelConfig, Label} from './Label';
import {UIInstanceManager} from '../../UIManager';
import { AdEvent, LinearAd, PlayerAPI } from 'bitmovin-player';

/**
 * Enumerates the types of content that the {@link MetadataLabel} can display.
 */
export enum MetadataLabelContent {
  /**
   * Title of the data source.
   */
  Title,
  /**
   * Description of the data source.
   */
  Description,
  /**
   * Message displayed when an ad is playing.
   */
  AdMessage,
}

/**
 * Configuration interface for {@link MetadataLabel}.
 *
 * @category Configs
 */
export interface MetadataLabelConfig extends LabelConfig {
  /**
   * The type of content that should be displayed in the label.
   */
  content: MetadataLabelContent;
}

/**
 * A label that can be configured to display certain metadata.
 *
 * @category Labels
 */
export class MetadataLabel extends Label<MetadataLabelConfig> {
  private adMessage: string = '';

  constructor(config: MetadataLabelConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['label-metadata', 'label-metadata-' + MetadataLabelContent[config.content].toLowerCase()],
    } as MetadataLabelConfig, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();
    let uiconfig = uimanager.getConfig();

    let init = () => {
      switch (config.content) {
        case MetadataLabelContent.Title:
          this.setText(uiconfig.metadata.title);
          break;
        case MetadataLabelContent.Description:
          this.setText(uiconfig.metadata.description);
          break;
        case MetadataLabelContent.AdMessage:
          this.setText(this.adMessage);
          break;
      }
    };

    let unload = () => {
      this.setText(null);
      this.adMessage = '';
    };

    // Init label
    init();
    // Clear labels when source is unloaded
    player.on(player.exports.PlayerEvent.SourceUnloaded, unload);

    player.on(player.exports.PlayerEvent.AdStarted, (event) => {
      const ad = (event as AdEvent).ad;
      if (!ad.isLinear) {
        return;
      }

      const linearAd = ad as LinearAd;
      this.adMessage = linearAd.uiConfig?.message ?? '';
      init();
    });

    uimanager.getConfig().events.onUpdated.subscribe(init);
  }
}