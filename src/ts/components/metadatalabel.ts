import {LabelConfig, Label} from './label';
import {UIInstanceManager} from '../uimanager';

/**
 * Enumerates the types of content that the {@link MetadataLabel} can display.
 */
export enum MetadataLabelContent {
  /**
   * Title of the data source.
   */
  Title,
  /**
   * Description fo the data source.
   */
  Description,
}

/**
 * Configuration interface for {@link MetadataLabel}.
 */
export interface MetadataLabelConfig extends LabelConfig {
  /**
   * The type of content that should be displayed in the label.
   */
  content: MetadataLabelContent;
}

/**
 * A label that can be configured to display certain metadata.
 */
export class MetadataLabel extends Label<MetadataLabelConfig> {

  constructor(config: MetadataLabelConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['label-metadata', 'label-metadata-' + MetadataLabelContent[config.content].toLowerCase()]
    }, this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = <MetadataLabelConfig>this.getConfig();
    let uiconfig = uimanager.getConfig();

    let init = () => {
      switch (config.content) {
        case MetadataLabelContent.Title:
          if (uiconfig && uiconfig.metadata && uiconfig.metadata.title) {
            this.setText(uiconfig.metadata.title);
          } else if (player.getConfig().source && player.getConfig().source.title) {
            this.setText(player.getConfig().source.title);
          }
          break;
        case MetadataLabelContent.Description:
          if (uiconfig && uiconfig.metadata && uiconfig.metadata.description) {
            this.setText(uiconfig.metadata.description);
          } else if (player.getConfig().source && player.getConfig().source.description) {
            this.setText(player.getConfig().source.description);
          }
          break;
      }
    };

    let unload = () => {
      this.setText(null);
    };

    // Init label
    init();
    // Reinit label when a new source is loaded
    player.addEventHandler(player.EVENT.ON_SOURCE_LOADED, init);
    // Clear labels when source is unloaded
    player.addEventHandler(player.EVENT.ON_SOURCE_UNLOADED, unload);
  }
}