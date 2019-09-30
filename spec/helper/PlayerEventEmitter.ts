import {
  AdBreakEvent,
  AdEvent,
  AirplayChangedEvent, AudioChangedEvent,
  AudioTrackEvent,
  ErrorEvent,
  LinearAd,
  PeriodSwitchedEvent,
  PlaybackEvent,
  PlayerEvent,
  PlayerEventBase,
  PlayerEventCallback,
  SeekEvent,
  SubtitleEvent,
  SubtitleTrack,
  TimeShiftEvent,
  VideoPlaybackQualityChangedEvent
} from 'bitmovin-player';

export class PlayerEventEmitter {
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

  fireSourceLoadedEvent(): void {
    this.fireEvent<PlayerEventBase>({
      timestamp: Date.now(),
      type: PlayerEvent.SourceLoaded,
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

  // Subtitle Events
  fireSubtitleAddedEvent(id: string, label: string): void {
    this.fireEvent<SubtitleEvent>({
      timestamp: Date.now(),
      subtitle: {
        id,
        label,
      } as SubtitleTrack,
      type: PlayerEvent.SubtitleAdded,
    });
  }

  fireSubtitleRemovedEvent(id: string): void {
    this.fireEvent<SubtitleEvent>({
      timestamp: Date.now(),
      subtitle: {
        id,
      } as SubtitleTrack,
      type: PlayerEvent.SubtitleRemoved,
    });
  }

  fireSubtitleDisabled(): void {
    this.fireEvent<SubtitleEvent>({
      timestamp: Date.now(),
      type: PlayerEvent.SubtitleDisabled,
    } as SubtitleEvent);
  }

  fireSubtitleEnabled(): void {
    this.fireEvent<SubtitleEvent>({
      timestamp: Date.now(),
      type: PlayerEvent.SubtitleEnabled,
    } as SubtitleEvent);
  }

  // Period switch
  firePeriodSwitchedEvent(): void {
    this.fireEvent<PeriodSwitchedEvent>({
      timestamp: Date.now(),
      type: PlayerEvent.PeriodSwitched,
    } as PeriodSwitchedEvent);
  }

  // Audio
  fireAudioAddedEvent(id: string, label: string): void {
    this.fireEvent<AudioTrackEvent>({
      time: 0,
      timestamp: Date.now(),
      type: PlayerEvent.AudioAdded,
      track: {
        id,
        label,
      },
    } as AudioTrackEvent);
  }

  fireAudioRemovedEvent(id: string): void {
    this.fireEvent<AudioTrackEvent>({
      time: 0,
      timestamp: Date.now(),
      type: PlayerEvent.AudioRemoved,
      track: {
        id,
      },
    } as AudioTrackEvent);
  }

  fireAudioChangedEvent(): void {
    this.fireEvent<AudioChangedEvent>({
      time: 0,
      timestamp: Date.now(),
      type: PlayerEvent.AudioChanged,
    } as AudioChangedEvent);
  }
}
