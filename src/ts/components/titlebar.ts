import {Container, ContainerConfig} from './container';
import {UIInstanceManager} from '../uimanager';
import {MetadataLabel, MetadataLabelContent} from './metadatalabel';

/**
 * Configuration interface for a {@link TitleBar}.
 */
export interface TitleBarConfig extends ContainerConfig {
  // nothing yet
}

/**
 * Displays a title bar containing a label with the title of the video.
 */
export class TitleBar extends Container<TitleBarConfig> {

  constructor(config: TitleBarConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-titlebar',
      hidden: true,
      components: [
        new MetadataLabel({ content: MetadataLabelContent.Title }),
        new MetadataLabel({ content: MetadataLabelContent.Description })
      ]
    }, <TitleBarConfig>this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    uimanager.onControlsShow.subscribe(() => {
      this.show();
    });
    uimanager.onControlsHide.subscribe(() => {
      this.hide();
    });
  }
}