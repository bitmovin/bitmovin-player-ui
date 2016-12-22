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

  private label: Label<LabelConfig>;

  constructor(config: TitleBarConfig = {}) {
    super(config);

    this.label = new Label({ cssClass: 'ui-titlebar-label' });

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-titlebar',
      hidden: true,
      components: [this.label]
    }, <TitleBarConfig>this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIManager): void {
    super.configure(player, uimanager);

    let self = this;

    if (uimanager.getConfig() && uimanager.getConfig().metadata) {
      self.label.setText(uimanager.getConfig().metadata.title);
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