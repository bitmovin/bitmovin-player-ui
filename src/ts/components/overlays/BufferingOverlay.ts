import {ContainerConfig, Container} from '../Container';
import {UIInstanceManager} from '../../UIManager';
import {Component, ComponentConfig} from '../Component';
import {Timeout} from '../../utils/Timeout';
import { PlayerAPI } from 'bitmovin-player';

/**
 * Configuration interface for the {@link BufferingOverlay} component.
 *
 * @category Configs
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
 *
 * @category Components
 */
export class BufferingOverlay extends Container<BufferingOverlayConfig> {

  private indicators: Component<ComponentConfig>[];

  constructor(config: BufferingOverlayConfig = {}) {
    super(config);

    this.indicators = [
      new Component<ComponentConfig>({ tag: 'div', cssClass: 'ui-buffering-overlay-indicator', role: 'img' }),
      new Component<ComponentConfig>({ tag: 'div', cssClass: 'ui-buffering-overlay-indicator', role: 'img' }),
      new Component<ComponentConfig>({ tag: 'div', cssClass: 'ui-buffering-overlay-indicator', role: 'img' }),
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

    const config = this.getConfig();

    const overlayShowTimeout = new Timeout(config.showDelayMs, () => {
      uimanager.onBufferingShow.dispatch(this);
      this.show();
    });

    const showOverlay = () => {
      overlayShowTimeout.start();
    };

    // Only show overlay if player is playing, otherwise e.g. when doing paused seeks, the overlay should stay hidden
    const showOverlayIfPlaying = () => {
      if (player.isPlaying()) {
        showOverlay();
      }
    }

    const hideOverlay = () => {
      overlayShowTimeout.clear();
      uimanager.onBufferingHide.dispatch(this);
      this.hide();
    };

    player.on(player.exports.PlayerEvent.StallStarted, showOverlay);
    player.on(player.exports.PlayerEvent.StallEnded, hideOverlay);
    player.on(player.exports.PlayerEvent.Play, showOverlay);
    player.on(player.exports.PlayerEvent.Playing, hideOverlay);
    player.on(player.exports.PlayerEvent.Paused, hideOverlay);
    player.on(player.exports.PlayerEvent.Seek, showOverlayIfPlaying);
    player.on(player.exports.PlayerEvent.Seeked, hideOverlay);
    player.on(player.exports.PlayerEvent.TimeShift, showOverlayIfPlaying);
    player.on(player.exports.PlayerEvent.TimeShifted, hideOverlay);
    player.on(player.exports.PlayerEvent.SourceUnloaded, hideOverlay);

    // Show overlay if player is already stalled at init
    if (player.isStalled()) {
      this.show();
    }
  }
}
