import type { PlayerAPI } from 'bitmovin-player';
import type { UIInstanceManager } from '../UIManager';
import { Event, EventDispatcher } from '../EventDispatcher';
import { LocalizableText } from '../localization/i18n';
import { Timeout } from './Timeout';
import { PlayerInsightsUtils } from './PlayerInsightsUtils';

export type PlayerInsightValueProvider = (player: PlayerAPI) => LocalizableText | null | undefined;

interface PlayerInsights {
  video: PlayerInsightProperty;
  viewportFrames: PlayerInsightProperty;
  audio: PlayerInsightProperty;
  bufferVideoAudio: PlayerInsightProperty;
  time: PlayerInsightProperty;
  stream: PlayerInsightProperty;
  player: PlayerInsightProperty;
}

interface Properties extends PlayerInsights {
  [name: string]: PlayerInsightProperty;
}

export interface PlayerInsightSnapshot {
  value: LocalizableText | null | undefined;
  visible: boolean;
}

export class PlayerInsightsProvider {
  private readonly properties: Properties = {
    video: new PlayerInsightProperty('Video', player => PlayerInsightsUtils.formatVideoQualityInsight(player)),
    viewportFrames: new PlayerInsightProperty('Viewport / Frames', player =>
      PlayerInsightsUtils.formatViewportFramesInsight(player),
    ),
    audio: new PlayerInsightProperty('Audio', player => PlayerInsightsUtils.formatAudioQualityInsight(player)),
    bufferVideoAudio: new PlayerInsightProperty('Buffer Video / Audio', player =>
      PlayerInsightsUtils.formatBufferInsight(player),
    ),
    time: new PlayerInsightProperty('Time', player => PlayerInsightsUtils.formatTimeInsight(player)),
    stream: new PlayerInsightProperty('Stream', player => PlayerInsightsUtils.formatStreamInsight(player)),
    player: new PlayerInsightProperty('Player version', player => player.version),
  };

  private readonly events = {
    onChanged: new EventDispatcher<PlayerInsightsProvider, PlayerInsightSnapshot[]>(),
  };

  private playerApi: PlayerAPI | null = null;
  private uimanager: UIInstanceManager | null = null;
  private refreshTimer: Timeout | null = null;
  private refreshIntervalMs = 1000;
  private active = false;

  getInsights(): PlayerInsightProperty[] {
    const insights: PlayerInsightProperty[] = [];

    for (const propertyName in this.properties) {
      insights.push(this.properties[propertyName]);
    }

    return insights;
  }

  initialize(player: PlayerAPI, uimanager: UIInstanceManager, refreshIntervalMs: number): void {
    this.playerApi = player;
    this.uimanager = uimanager;
    this.refreshIntervalMs = refreshIntervalMs;

    player.on(player.exports.PlayerEvent.Play, this.updateAndStartTimer);
    player.on(player.exports.PlayerEvent.Playing, this.updateAndStartTimer);
    player.on(player.exports.PlayerEvent.Paused, this.dispatchChanged);
    player.on(player.exports.PlayerEvent.Seeked, this.dispatchChanged);
    player.on(player.exports.PlayerEvent.SourceLoaded, this.dispatchChanged);
    player.on(player.exports.PlayerEvent.SourceUnloaded, this.dispatchChanged);
    player.on(player.exports.PlayerEvent.VideoQualityChanged, this.dispatchChanged);
    player.on(player.exports.PlayerEvent.AudioQualityChanged, this.dispatchChanged);
    player.on(player.exports.PlayerEvent.PlayerResized, this.dispatchChanged);
    player.on(player.exports.PlayerEvent.StallStarted, this.dispatchChanged);
    player.on(player.exports.PlayerEvent.StallEnded, this.dispatchChanged);
    player.on(player.exports.PlayerEvent.PlaybackFinished, this.stopTimer);
    player.on(player.exports.PlayerEvent.Destroy, this.stopTimer);

    uimanager.getConfig().events.onUpdated.subscribe(this.dispatchChanged);
  }

  activate(): void {
    this.active = true;
    this.dispatchChanged();
    this.startTimer();
  }

  deactivate(): void {
    this.active = false;
    this.stopTimer();
  }

  release(): void {
    this.active = false;
    this.stopTimer();

    if (this.playerApi) {
      this.playerApi.off(this.playerApi.exports.PlayerEvent.Play, this.updateAndStartTimer);
      this.playerApi.off(this.playerApi.exports.PlayerEvent.Playing, this.updateAndStartTimer);
      this.playerApi.off(this.playerApi.exports.PlayerEvent.Paused, this.dispatchChanged);
      this.playerApi.off(this.playerApi.exports.PlayerEvent.Seeked, this.dispatchChanged);
      this.playerApi.off(this.playerApi.exports.PlayerEvent.SourceLoaded, this.dispatchChanged);
      this.playerApi.off(this.playerApi.exports.PlayerEvent.SourceUnloaded, this.dispatchChanged);
      this.playerApi.off(this.playerApi.exports.PlayerEvent.VideoQualityChanged, this.dispatchChanged);
      this.playerApi.off(this.playerApi.exports.PlayerEvent.AudioQualityChanged, this.dispatchChanged);
      this.playerApi.off(this.playerApi.exports.PlayerEvent.PlayerResized, this.dispatchChanged);
      this.playerApi.off(this.playerApi.exports.PlayerEvent.StallStarted, this.dispatchChanged);
      this.playerApi.off(this.playerApi.exports.PlayerEvent.StallEnded, this.dispatchChanged);
      this.playerApi.off(this.playerApi.exports.PlayerEvent.PlaybackFinished, this.stopTimer);
      this.playerApi.off(this.playerApi.exports.PlayerEvent.Destroy, this.stopTimer);
    }

    this.uimanager?.getConfig().events.onUpdated.unsubscribe(this.dispatchChanged);
    this.events.onChanged.unsubscribeAll();
    this.playerApi = null;
    this.uimanager = null;
  }

  get onChanged(): Event<PlayerInsightsProvider, PlayerInsightSnapshot[]> {
    return this.events.onChanged.getEvent();
  }

  private readonly updateAndStartTimer = (): void => {
    this.dispatchChanged();
    this.startTimer();
  };

  private readonly dispatchChanged = (): void => {
    if (!this.active || !this.playerApi) {
      return;
    }

    this.events.onChanged.dispatch(this, this.getSnapshots(this.playerApi));
  };

  private getSnapshots(player: PlayerAPI): PlayerInsightSnapshot[] {
    const snapshots: PlayerInsightSnapshot[] = [];

    for (const propertyName in this.properties) {
      snapshots.push(this.properties[propertyName].getSnapshot(player));
    }

    return snapshots;
  }

  private startTimer(): void {
    this.stopTimer();

    if (!this.playerApi || !this.active || this.refreshIntervalMs === -1) {
      return;
    }

    this.refreshTimer = new Timeout(this.refreshIntervalMs, this.dispatchChanged, true).start();
  }

  private readonly stopTimer = (): void => {
    if (this.refreshTimer) {
      this.refreshTimer.clear();
      this.refreshTimer = null;
    }
  };
}

export class PlayerInsightProperty {
  private readonly label: LocalizableText;
  private readonly valueProvider: PlayerInsightValueProvider;

  constructor(leadingLabel: LocalizableText, valueProvider: PlayerInsightValueProvider) {
    this.label = leadingLabel;
    this.valueProvider = valueProvider;
  }

  get leadingLabel(): LocalizableText {
    return this.label;
  }

  getSnapshot(player: PlayerAPI): PlayerInsightSnapshot {
    const value = this.valueProvider(player);
    const hasValue = value != null && value !== '';

    return {
      value,
      visible: hasValue,
    };
  }
}
