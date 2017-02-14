import {ContainerConfig, Container} from './container';
import {Label, LabelConfig} from './label';
import {UIInstanceManager} from '../uimanager';
import ErrorEvent = bitmovin.player.ErrorEvent;
import {TvNoiseCanvas} from './tvnoisecanvas';
import PlayerEvent = bitmovin.player.PlayerEvent;

/**
 * Overlays the player and displays error messages.
 */
export class ErrorMessageOverlay extends Container<ContainerConfig> {

  private errorLabel: Label<LabelConfig>;
  private tvNoiseBackground: TvNoiseCanvas;

  constructor(config: ContainerConfig = {}) {
    super(config);

    this.errorLabel = new Label<LabelConfig>({ cssClass: 'ui-errormessage-label' });
    this.tvNoiseBackground = new TvNoiseCanvas();

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-errormessage-overlay',
      components: [this.tvNoiseBackground, this.errorLabel],
      hidden: true
    }, this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    player.addEventHandler(player.EVENT.ON_ERROR, (event: ErrorEvent) => {
      this.errorLabel.setText(event.message);
      this.tvNoiseBackground.start();
      this.show();
    });

    player.addEventHandler(player.EVENT.ON_SOURCE_LOADED, (event: PlayerEvent) => {
      if (this.isShown()) {
        this.tvNoiseBackground.stop();
        this.hide();
      }
    });
  }
}