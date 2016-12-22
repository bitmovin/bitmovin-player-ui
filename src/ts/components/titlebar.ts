import {Container, ContainerConfig} from './container';
import {UIManager} from '../uimanager';
import {LabelConfig, Label} from './label';

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

  private titleLabel: Label<LabelConfig>;
  private descriptionLabel: Label<LabelConfig>;

  constructor(config: TitleBarConfig = {}) {
    super(config);

    this.titleLabel = new Label({ cssClass: 'ui-titlebar-title' });
    this.descriptionLabel = new Label({ cssClass: 'ui-titlebar-description' });

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-titlebar',
      hidden: true,
      components: [this.titleLabel, this.descriptionLabel]
    }, <TitleBarConfig>this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIManager): void {
    super.configure(player, uimanager);

    let self = this;
    let uiconfig = uimanager.getConfig();

    if (uiconfig && uiconfig.metadata) {
      self.titleLabel.setText(uiconfig.metadata.title);

      if (uiconfig.metadata.description) {
        self.descriptionLabel.setText(uiconfig.metadata.description);
      }
    } else {
      // Cancel configuration if there is no metadata to display
      // TODO this probably won't work if we put the share buttons into the title bar
      return;
    }

    uimanager.onControlsShow.subscribe(function () {
      self.show();
    });
    uimanager.onControlsHide.subscribe(function () {
      self.hide();
    });
  }
}