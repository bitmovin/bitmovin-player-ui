import { PlayerAPI, SourceConfig, TimeChangedEvent } from 'bitmovin-player';
import { StorageUtils } from './StorageUtils';
import { prefixCss } from '../components/DummyComponent';

const STORAGE_KEY_PREFIX = `${prefixCss('resume')}.`;
const MIN_RESUME_POSITION = 5;

/**
 * Watches player events and stores the last known playback position for the active source.
 *
 * @category Utils
 */
export class ResumePositionTracker {
  private activeSourceKey: string | null = null;
  private lastPosition: number | null = null;

  constructor(private readonly player: PlayerAPI) {
    player.on(player.exports.PlayerEvent.SourceLoaded, this.startPositionTracking);
    player.on(player.exports.PlayerEvent.SourceUnloaded, this.unloadSource);
    player.on(player.exports.PlayerEvent.Play, this.restartPositionTracking);

    if (player.getSource() !== null) this.startPositionTracking();
  }

  release(): void {
    this.storeCurrentPosition();
    window.removeEventListener('beforeunload', this.storeCurrentPosition);
    this.activeSourceKey = null;
    this.lastPosition = null;
  }

  getStoredPosition(): number | null {
    if (this.player.isLive()) return null;

    const activeSourceKey = storageKeyFor(this.player.getSource());
    if (!activeSourceKey) return null;

    const time = Number(StorageUtils.getItem(activeSourceKey));
    return isFinite(time) && time >= MIN_RESUME_POSITION ? time : null;
  }

  private readonly updatePosition = (event: TimeChangedEvent) => {
    if (this.player.ads?.isLinearAdActive?.() === true) return;

    if (isFinite(event.time)) {
      this.lastPosition = event.time;
      this.savePosition(this.lastPosition);
    }
  };

  private readonly savePosition = (time: number | null) => {
    if (!this.activeSourceKey) return;
    if (time === null) return;

    if (!isFinite(time) || time < MIN_RESUME_POSITION) {
      StorageUtils.removeItem(this.activeSourceKey);
      return;
    }

    StorageUtils.setItem(this.activeSourceKey, String(time));
  };

  private readonly pausePositionTracking = () => {
    if (this.player.ads?.isLinearAdActive?.() === true) return;

    const time = this.player.getCurrentTime();
    if (isFinite(time)) {
      this.lastPosition = time;
    }
    this.savePosition(this.lastPosition);
  };

  private readonly storeCurrentPosition = () => {
    this.savePosition(this.lastPosition);
  };

  private readonly startPositionTracking = () => {
    this.stopPositionTracking();
    this.activeSourceKey = null;
    this.lastPosition = null;

    if (this.player.isLive()) return;

    const activeSourceKey = storageKeyFor(this.player.getSource());
    if (!activeSourceKey) return;

    this.activeSourceKey = activeSourceKey;
    this.player.on(this.player.exports.PlayerEvent.TimeChanged, this.updatePosition);
    this.player.on(this.player.exports.PlayerEvent.Paused, this.pausePositionTracking);
    this.player.on(this.player.exports.PlayerEvent.PlaybackFinished, this.finishPositionTracking);
    window.addEventListener('beforeunload', this.storeCurrentPosition);
  };

  private readonly restartPositionTracking = () => {
    if (!this.activeSourceKey && this.player.getSource() !== null) {
      this.startPositionTracking();
    }
  };

  private readonly unloadSource = () => {
    this.savePosition(this.lastPosition);
    this.stopPositionTracking();
    this.activeSourceKey = null;
    this.lastPosition = null;
  };

  private readonly finishPositionTracking = () => {
    if (this.activeSourceKey) {
      StorageUtils.removeItem(this.activeSourceKey);
    }
    this.stopPositionTracking();
    this.activeSourceKey = null;
    this.lastPosition = null;
  };

  private stopPositionTracking(): void {
    this.player.off(this.player.exports.PlayerEvent.TimeChanged, this.updatePosition);
    this.player.off(this.player.exports.PlayerEvent.Paused, this.pausePositionTracking);
    this.player.off(this.player.exports.PlayerEvent.PlaybackFinished, this.finishPositionTracking);
    window.removeEventListener('beforeunload', this.storeCurrentPosition);
  }
}

function storageKeyFor(source: SourceConfig | null): string | null {
  const id = sourceIdentifier(source);
  return id ? STORAGE_KEY_PREFIX + hashSourceIdentifier(id) : null;
}

function sourceIdentifier(source: SourceConfig | null): string | null {
  if (!source) return null;
  if (source.title) return 'title:' + source.title;
  if (source.dash) return 'dash:' + source.dash;
  if (source.hls) return 'hls:' + source.hls;
  if (source.smooth) return 'smooth:' + source.smooth;
  if (typeof source.progressive === 'string') return 'progressive:' + source.progressive;
  if (Array.isArray(source.progressive) && source.progressive[0]?.url) {
    return 'progressive:' + source.progressive[0].url;
  }
  return null;
}

function hashSourceIdentifier(sourceIdentifier: string): string {
  let hash = 0;
  for (let i = 0; i < sourceIdentifier.length; i++) {
    hash = (hash << 5) - hash + sourceIdentifier.charCodeAt(i);
    hash |= 0;
  }
  return (hash >>> 0).toString(36);
}
