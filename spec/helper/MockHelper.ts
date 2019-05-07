import {
  AdBreakEvent,
  AdEvent,
  AirplayChangedEvent,
  ErrorEvent,
  LinearAd,
  PlaybackEvent,
  PlayerAPI,
  PlayerEvent,
  PlayerEventBase,
  PlayerEventCallback,
  SeekEvent,
  TimeShiftEvent,
  VideoPlaybackQualityChangedEvent,
} from 'bitmovin-player';

declare const global: any;
export namespace MockHelper {
  export function getPlayerMock(): TestingPlayerAPI {
    const eventHelper = new EventEmitter();

    const PlayerMockClass: jest.Mock<TestingPlayerAPI> = jest.fn().mockImplementation(() => {
      return {
        ads: jest.fn(),
        getSource: jest.fn(),
        exports: {
          PlayerEvent,
          ViewMode: {
            Fullscreen: 'fullscreen',
          },
        },
        isLive: jest.fn(),
        getConfig: jest.fn(() => {
          return {};
        }),
        isPlaying: jest.fn(),
        isPaused: jest.fn(),
        isAirplayActive: jest.fn(),
        isAirplayAvailable: jest.fn(),
        getPlayerType: jest.fn(),
        getStreamType: jest.fn(),
        getDuration: jest.fn(),
        getVolume: jest.fn(),
        getContainer: jest.fn(() => {
          return document.getElementById('player');
        }),
        getViewMode: jest.fn(),
        hasEnded: jest.fn(),
        isStalled: jest.fn(),
        isCasting: jest.fn(),

        // Event faker
        eventEmitter: eventHelper,
        on: eventHelper.on.bind(eventHelper),
      };
    });

    return new PlayerMockClass();
  }
}

export interface TestingPlayerAPI extends PlayerAPI {
  eventEmitter: EventEmitter;
}

class EventEmitter {
  private eventHandlers: { [eventType: string]: PlayerEventCallback[]; } = {};

  public on(eventType: PlayerEvent, callback: PlayerEventCallback) {
    if (!this.eventHandlers[eventType]) {
      this.eventHandlers[eventType] = [];
    }

    this.eventHandlers[eventType].push(callback);
  }

  public fireEvent<E extends PlayerEventBase>(event: E) {
    if (this.eventHandlers[event.type]) {
      this.eventHandlers[event.type].forEach((callback: PlayerEventCallback) => callback(event));
    }
  }

  // Fake Events
  public firePlayEvent() {
    this.fireEvent<PlaybackEvent>({
      time: 0,
      timestamp: Date.now(),
      type: PlayerEvent.Play,
    });
  }

  public firePauseEvent() {
    this.fireEvent<PlaybackEvent>({
      time: 10,
      timestamp: Date.now(),
      type: PlayerEvent.Paused,
    });
  }

  fireAdBreakFinishedEvent(): void {
    this.fireEvent<AdBreakEvent>({
      timestamp: Date.now(),
      type: PlayerEvent.AdBreakFinished,
      adBreak: {
        id: 'Break-ID',
        scheduleTime: -1,
      },
    });
  }

  fireAdBreakStartedEvent(startTime: number = 0, ads: LinearAd[] = []): void {
    this.fireEvent<AdBreakEvent>({
      timestamp: Date.now(),
      type: PlayerEvent.AdBreakStarted,
      adBreak: {
        id: 'Break-ID',
        scheduleTime: startTime,
        ads: ads,
      },
    });
  }

  fireAdErrorEvent(): void {
    this.fireEvent<ErrorEvent>({
      timestamp: Date.now(),
      type: PlayerEvent.AdError,
      code: 1001,
      name: 'AdErrorEvent',
    });
  }

  fireAdSkippedEvent(): void {
    this.fireEvent<AdEvent>({
      timestamp: Date.now(),
      type: PlayerEvent.AdSkipped,
      ad: {
        isLinear: true,
        width: null,
        height: null,
      } as any,
    });
  }

  fireAdStartedEvent(adData: object = {}): void {
    this.fireEvent<AdEvent>({
      timestamp: Date.now(),
      type: PlayerEvent.AdStarted,
      ad: {
        isLinear: true,
        width: null,
        height: null,
        ...adData,
      } as any,
    });
  }

  fireErrorEvent(): void {
    this.fireEvent<ErrorEvent>({
      timestamp: Date.now(),
      type: PlayerEvent.Error,
      code: 1000,
      name: 'ErrorEvent',
    });
  }

  firePlaybackFinishedEvent(): void {
    this.fireEvent<PlayerEventBase>({
      timestamp: Date.now(),
      type: PlayerEvent.PlaybackFinished,
    });
  }

  firePlayingEvent(): void {
    this.fireEvent<PlaybackEvent>({
      time: 0,
      timestamp: Date.now(),
      type: PlayerEvent.Playing,
    });
  }

  fireSeekEvent(seekTarget?: number): void {
    this.fireEvent<SeekEvent>({
      timestamp: Date.now(),
      type: PlayerEvent.Seek,
      position: 20,
      seekTarget: seekTarget || 40,
    });
  }

  fireSeekedEvent(): void {
    this.fireEvent<PlayerEventBase>({
      timestamp: Date.now(),
      type: PlayerEvent.Seeked,
    });
  }

  fireSourceUnloadedEvent(): void {
    this.fireEvent<PlayerEventBase>({
      timestamp: Date.now(),
      type: PlayerEvent.SourceUnloaded,
    });
  }

  fireStallStartedEvent(): void {
    this.fireEvent<PlayerEventBase>({
      timestamp: Date.now(),
      type: PlayerEvent.StallStarted,
    });
  }

  fireStallEndedEvent(): void {
    this.fireEvent<PlayerEventBase>({
      timestamp: Date.now(),
      type: PlayerEvent.StallEnded,
    });
  }

  fireTimeShiftEvent(): void {
    this.fireEvent<TimeShiftEvent>({
      timestamp: Date.now(),
      type: PlayerEvent.TimeShift,
      position: 0,
      target: -10,
    });
  }

  fireTimeShiftedEvent(): void {
    this.fireEvent<PlayerEventBase>({
      timestamp: Date.now(),
      type: PlayerEvent.TimeShifted,
    });
  }

  fireAdFinishedEvent(): void {
    this.fireEvent<AdEvent>({
      timestamp: Date.now(),
      type: PlayerEvent.AdFinished,
      ad: {
        isLinear: true,
        width: null,
        height: null,
      } as any,
    });
  }

  fireVideoPlaybackQualityChangedEvent(bitrate: number): void {
    this.fireEvent<VideoPlaybackQualityChangedEvent>({
      timestamp: Date.now(),
      type: PlayerEvent.VideoPlaybackQualityChanged,
      sourceQuality: {
        id: '1',
        bitrate: 250_000,
        width: null,
        height: null,
      },
      targetQuality: {
        id: '2',
        bitrate: bitrate,
        width: null,
        height: null,
      },
    });
  }

  fireAirPlayChangedEvent(): void {
    this.fireEvent<AirplayChangedEvent>({
      timestamp: Date.now(),
      time: Date.now(),
      type: PlayerEvent.AirplayChanged,
      airplayEnabled: true,
    });
  }
}
