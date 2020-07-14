import { PlayerAPI } from 'bitmovin-player';
import { Timeout } from './timeout';

export class PausedTimeshiftUpdatedHandler {
  private static instance: PausedTimeshiftUpdatedHandler;
  private static _player: PlayerAPI;
  private pausedTimeshiftUpdater: Timeout;
  private handlers: CallableFunction[] = [];

  private constructor() {}

  public static getInstance(player: PlayerAPI) {
    if (!this.instance) {
      this._player = player;
      this.instance = new PausedTimeshiftUpdatedHandler();
    }

    return this.instance;
  }

  private get player() {
    return PausedTimeshiftUpdatedHandler._player;
  }

  public addListener(handler: CallableFunction) {
    this.handlers.push(handler);
    this.createUpdater();
  }

  public removeListener(handler: CallableFunction) {
    this.handlers = this.handlers.filter(activeHandler => activeHandler !== handler);
  }

  public release() {
    this.pausedTimeshiftUpdater.clear();
    this.handlers = [];
  }

  private createUpdater() {
    if (!this.pausedTimeshiftUpdater) {
      // Regularly update the handlers while the timeout is active
      this.pausedTimeshiftUpdater = new Timeout(1000, () => this.runHandlers(), true);

      this.player.on(this.player.exports.PlayerEvent.Paused, () => {
        if (this.player.isLive() && this.player.getMaxTimeShift() < 0) {
          this.pausedTimeshiftUpdater.start();
        }
      });

      // Stop updater when playback continues (no matter if the updater was started before)
      this.player.on(this.player.exports.PlayerEvent.Play, () => this.pausedTimeshiftUpdater.clear());
    }
  }

  private runHandlers() {
    this.handlers.forEach(handler => handler());
  }
}