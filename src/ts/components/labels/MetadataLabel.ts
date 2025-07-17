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

    let mainContentTitle = uiconfig.metadata.title; // TODO: get's updated with 'my lovely title' !!! prevent that!
    let mainContentDescription = uiconfig.metadata.description;

    let init = () => {
      switch (config.content) {
        case MetadataLabelContent.Title:
          this.setText(uiconfig.metadata.title);
          break;
        case MetadataLabelContent.Description:
          this.setText(uiconfig.metadata.description);
          break;
      }
    };

    let unload = () => {
      this.setText(null);
    };

    let restoreMainContentData = () => {
      uiconfig.metadata.title = mainContentTitle;
      uiconfig.metadata.description = mainContentDescription;
      init();
    };

    // Init label
    init();
    // Clear labels when source is unloaded
    player.on(player.exports.PlayerEvent.SourceUnloaded, unload);

    player.on(player.exports.PlayerEvent.AdBreakStarted, () => {
      mainContentTitle = uiconfig.metadata.title;
      mainContentDescription = uiconfig.metadata.description;
    });
    player.on(player.exports.PlayerEvent.AdStarted, (event) => {
      const ad = (event as AdEvent).ad;
      if (!ad.isLinear) {
        return;
      }

      const linearAd = ad as LinearAd;
      uiconfig.metadata.title = linearAd.uiConfig?.message ?? '';
      uiconfig.metadata.description = '';
      init();
    });
    player.on(player.exports.PlayerEvent.AdBreakFinished, restoreMainContentData);

    uimanager.getConfig().events.onUpdated.subscribe(() => {
      init();
    });
  }
}