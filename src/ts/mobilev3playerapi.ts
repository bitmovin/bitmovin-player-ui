import { PlayerAPI, PlayerEvent, PlayerEventBase, PlayerEventCallback } from 'bitmovin-player';

export enum MobileV3PlayerEvent {
  SourceError = 'sourceerror',
  PlayerError = 'playererror',
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
