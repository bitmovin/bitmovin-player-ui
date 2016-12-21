import {ContainerConfig, Container} from './container';
import {UIManager} from '../uimanager';
import {Timeout} from '../timeout';

/**
 * Configuration interface for the {@link ControlBar}.
 */
export interface ControlBarConfig extends ContainerConfig {
  /**
   * The delay in milliseconds after which the control bar will be hidden when there is no user interaction.
   * Default: 5 seconds (5000)
   */
  hideDelay?: number;
}

/**
 * A container for main player control components, e.g. play toggle button, seek bar, volume control, fullscreen toggle
 * button.
 */
export class ControlBar extends Container<ControlBarConfig> {

  constructor(config: ControlBarConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass : 'ui-controlbar',
      hidden   : true,
      hideDelay: 5000
    }, <ControlBarConfig>this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIManager): void {
    super.configure(player, uimanager);

    let self      = this;
    let isSeeking = false;

    let timeout = new Timeout((<ControlBarConfig>self.getConfig()).hideDelay, function() { // TODO fix generics to spare these damn casts... is that even possible in TS?
      self.hide();
    });

    uimanager.onMouseEnter.subscribe(function(sender, args) {
      // Show control bar when the mouse enters the UI
      self.show();

      // Clear timeout to avoid hiding the control bar if the mouse moves back into the UI during the timeout period
      timeout.clear();
    });
    uimanager.onMouseMove.subscribe(function(sender, args) {
      if (self.isHidden()) {
        self.show();
      }
      if (isSeeking) {
        // Don't create/update timeout while seeking
        return;
      }

      // Hide the control bar if mouse does not move during the timeout time
      timeout.reset();
    });
    uimanager.onMouseLeave.subscribe(function(sender, args) {
      if (isSeeking) {
        // Don't create/update timeout while seeking
        return;
      }

      // Hide control bar some time after the mouse left the UI
      timeout.reset();
    });
    uimanager.onSeek.subscribe(function() {
      timeout.clear(); // Don't hide control bar while a seek is in progress
      isSeeking = true;
    });
    uimanager.onSeeked.subscribe(function() {
      isSeeking = false;
      timeout.start(); // Hide control bar some time after a seek has finished
    });
  }
}