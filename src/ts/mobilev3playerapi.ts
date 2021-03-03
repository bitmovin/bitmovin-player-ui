import { PlayerAPI, PlayerEvent, PlayerEventBase, PlayerEventCallback } from 'bitmovin-player';
import { WrappedPlayer } from './uimanager';

export enum MobileV3PlayerEvent {
  SourceError = 'sourceerror',
  PlayerError = 'playererror',
  PlaylistTransition = 'playlisttransition',
}

export interface MobileV3PlayerErrorEvent extends PlayerEventBase {
  name: 'onPlayerError';
  code: number;
  message: string;
}

export interface MobileV3SourceErrorEvent extends PlayerEventBase {
  name: 'onSourceError';
  code: number;
  message: string;
}

export type MobileV3PlayerEventType = PlayerEvent | MobileV3PlayerEvent;

export interface MobileV3PlayerAPI extends PlayerAPI {
  on(eventType: MobileV3PlayerEventType, callback: PlayerEventCallback): void;
  exports: PlayerAPI['exports'] & { PlayerEvent: MobileV3PlayerEventType };
}

export function isMobileV3PlayerAPI(player: WrappedPlayer | PlayerAPI | MobileV3PlayerAPI): player is MobileV3PlayerAPI {
  let everyKeyExists = true;

  for (const key in MobileV3PlayerEvent) {
    if (MobileV3PlayerEvent.hasOwnProperty(key) && !player.exports.PlayerEvent.hasOwnProperty(key)) {
      everyKeyExists = false;
    }
  }

  return everyKeyExists;
}
