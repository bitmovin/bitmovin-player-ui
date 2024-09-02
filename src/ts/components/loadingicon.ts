import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../uimanager';
import { Container, ContainerConfig } from './container';
import { Timeout } from '../timeout';
import { EventDispatcher, NoArgs, Event } from '../eventdispatcher';

export interface LoadingIconConfig extends ContainerConfig {
  /**
   * Delay in milliseconds after which the buffering overlay will be displayed. Useful to bypass short stalls without
   * displaying the overlay. Set to 0 to display the overlay instantly.
   * Default: 1000ms (1 second)
   */
  showDelayMs?: number;
}

export class LoadingIcon extends Container<LoadingIconConfig> {
  private isLoading: boolean = false;

  private loadingEvents = {
    loadingStartEvent: new EventDispatcher<LoadingIcon, NoArgs>(),
    loadingEndEvent: new EventDispatcher<LoadingIcon, NoArgs>(),
  };

  constructor(config: LoadingIconConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-loading-icon',
      role: 'icon',
      showDelayMs: 1000,
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();

    let overlayShowTimeout = new Timeout(config.showDelayMs, () => {
      this.startLoader();
    });

    let showOverlay = () => {
      overlayShowTimeout.start();
    };

    let hideOverlay = () => {
      overlayShowTimeout.clear();
      this.stopLoader();
    };

    player.on(player.exports.PlayerEvent.StallStarted, showOverlay);
    player.on(player.exports.PlayerEvent.StallEnded, hideOverlay);
    player.on(player.exports.PlayerEvent.Play, showOverlay);
    player.on(player.exports.PlayerEvent.Playing, hideOverlay);
    player.on(player.exports.PlayerEvent.Paused, hideOverlay);
    player.on(player.exports.PlayerEvent.Seek, showOverlay);
    player.on(player.exports.PlayerEvent.Seeked, hideOverlay);
    player.on(player.exports.PlayerEvent.TimeShift, showOverlay);
    player.on(player.exports.PlayerEvent.TimeShifted, hideOverlay);
    player.on(player.exports.PlayerEvent.SourceUnloaded, hideOverlay);

    // Show overlay if player is already stalled at init
    if (player.isStalled()) {
      this.startLoader();
    }
  }

  private startLoader(): void {
    if (!this.isLoading) {
      this.isLoading = true;
      this.onLoadingStartEvent();
      this.getDomElement().addClass(this.prefixCss('loading'));
    }
  }

  private stopLoader(): void {
    if (this.isLoading) {
      this.isLoading = false;
      this.onLoadingEndEvent();
      this.getDomElement().removeClass(this.prefixCss('loading'));
    }
  }

  public onLoadingStartEvent(): void {
    this.loadingEvents.loadingStartEvent.dispatch(this);
  }

  public onLoadingEndEvent(): void {
    this.loadingEvents.loadingEndEvent.dispatch(this);
  }

  public isSpinning(): boolean {
    return this.isLoading;
  }

  get loadingStartEvent(): Event<LoadingIcon, NoArgs> {
    return this.loadingEvents.loadingStartEvent.getEvent();
  }

  get loadingEndEvent(): Event<LoadingIcon, NoArgs> {
    return this.loadingEvents.loadingEndEvent.getEvent();
  }
}