import {Container, ContainerConfig} from './container';
import {UIManager} from '../uimanager';
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

  configure(player: bitmovin.player.Player, uimanager: UIManager): void {
    super.configure(player, uimanager);

    let self = this;

    uimanager.onControlsShow.subscribe(function () {
      self.show();
    });
    uimanager.onControlsHide.subscribe(function () {
      self.hide();
    });
  }
}