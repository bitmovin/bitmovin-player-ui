import {ContainerConfig, Container} from './container';
import {UIInstanceManager} from '../uimanager';
import {Component, ComponentConfig} from './component';
import {Timeout} from '../timeout';
import { PlayerAPI } from 'bitmovin-player';

/**
 * Configuration interface for the {@link BufferingOverlay} component.
 */
export interface BufferingOverlayConfig extends ContainerConfig {
  /**
   * Delay in milliseconds after which the buffering overlay will be displayed. Useful to bypass short stalls without
   * displaying the overlay. Set to 0 to display the overlay instantly.
   * Default: 1000ms (1 second)
   */
  showDelayMs?: number;
}

/**
 * Overlays the player and displays a buffering indicator.
 */
export class BufferingOverlay extends Container<BufferingOverlayConfig> {

  private indicators: Component<ComponentConfig>[];

  constructor(config: BufferingOverlayConfig = {}) {
    super(config);

    this.indicators = [
      new Component<ComponentConfig>({ tag: 'div', cssClass: 'ui-buffering-overlay-indicator' }),
      new Component<ComponentConfig>({ tag: 'div', cssClass: 'ui-buffering-overlay-indicator' }),
      new Component<ComponentConfig>({ tag: 'div', cssClass: 'ui-buffering-overlay-indicator' }),
    ];

    this.config = this.mergeConfig(config, <BufferingOverlayConfig>{
      cssClass: 'ui-buffering-overlay',
      hidden: true,
      components: this.indicators,
      showDelayMs: 1000,
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = <BufferingOverlayConfig>this.getConfig();

    let overlayShowTimeout = new Timeout(config.showDelayMs, () => {
      this.show();
    });

    let showOverlay = () => {
      overlayShowTimeout.start();
    };

    let hideOverlay = () => {
      overlayShowTimeout.clear();
      this.hide();
    };

    player.on(player.exports.Event.StallStarted, showOverlay);
    player.on(player.exports.Event.StallEnded, hideOverlay);
    player.on(player.exports.Event.Play, showOverlay);
    player.on(player.exports.Event.Playing, hideOverlay);
    player.on(player.exports.Event.Paused, hideOverlay);
    player.on(player.exports.Event.Seek, showOverlay);
    player.on(player.exports.Event.Seeked, hideOverlay);
    player.on(player.exports.Event.TimeShift, showOverlay);
    player.on(player.exports.Event.TimeShifted, hideOverlay);
    player.on(player.exports.Event.SourceUnloaded, hideOverlay);

    // Show overlay if player is already stalled at init
    if (player.isStalled()) {
      this.show();
    }
  }
}
