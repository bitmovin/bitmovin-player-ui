import { StorageUtils } from './StorageUtils';
import { PlayerAPI, PlayerEvent, PlayerEventCallback } from 'bitmovin-player';
import { prefixCss } from '../components/DummyComponent';

// Resolved lazily: prefixCss() instantiates a Component, and component construction must not run at
// module-evaluation time — on legacy platforms (webOS 3.x / Chromium 38) the ES5 polyfills are not
// installed yet, so Object.assign in the Component constructor would throw while the bundle evaluates.
let storageKeyPrefix: string;

function storageKey(name: string): string {
  if (storageKeyPrefix == null) {
    storageKeyPrefix = `${prefixCss('preferences')}.`;
  }

  return storageKeyPrefix + name;
}

const KEY_ENABLED = 'enabled';
const KEY_VOLUME = 'volume';
const KEY_MUTED = 'muted';
const KEY_PLAYBACK_SPEED = 'playbackSpeed';

const ISSUER = 'ui-preferences';

/**
 * Persists a small set of cross-session UI preferences (volume, mute state, playback
 * speed) into localStorage and reapplies them whenever a player using this UI is
 * initialized.
 *
 * Follows the same ownership model as {@link SubtitleSettingsManager}: the manager
 * subscribes to the relevant player events itself and tears them down on {@link release},
 * so the `UIManager` only has to create, {@link configure} and {@link release} it rather
 * than wiring up the player lifecycle by hand.
 *
 * Persistence is gated by an `enabled` flag that is itself persisted. Integrators can
 * switch it on by default via `UIConfig.enablePersistentPreferences`, and/or expose an
 * end-user opt-in toggle via `UIConfig.showPersistentPreferencesToggle`. While disabled
 * the manager holds no player subscriptions and stores nothing.
 *
 * All storage access routes through {@link StorageUtils}, which no-ops when storage is
 * unavailable (private browsing, restricted WebViews, `disableStorageApi`).
 *
 * @category Utils
 */
export class UIPreferencesManager {
  private player: PlayerAPI = null;
  private enabled = false;
  private unsubscribeHandlers: (() => void)[] = [];

  /**
   * Wires the manager to a player. When the end-user toggle is configured, the persisted
   * `enabled` flag takes precedence; otherwise `enabledByDefault` (the integrator's
   * `UIConfig.enablePersistentPreferences`) decides. When enabled, the stored preferences
   * are reapplied and subsequent changes are tracked.
   */
  public configure(player: PlayerAPI, enabledByDefault: boolean, respectStoredEnabled: boolean): void {
    this.player = player;
    const localStorageEnabled = respectStoredEnabled ? readBoolean(storageKey(KEY_ENABLED)) : null;
    // Stored end-user toggle choice wins only when the toggle is configured.
    // otherwise the integrator default is the source of truth.
    this.enabled = localStorageEnabled !== null ? localStorageEnabled : enabledByDefault;
    if (this.enabled) {
      this.startTracking();
      this.apply();
    }
  }

  /**
   * Whether preferences are currently being persisted.
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Enables or disables persistence as an explicit end-user choice (via the toggle) and
   * stores that choice.
   *
   * Enabling captures the player's current volume / mute / speed right away so it takes
   * effect immediately, then tracks subsequent changes. Disabling stops tracking and clears
   * the stored preferences so the next session starts fresh.
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    saveBoolean(storageKey(KEY_ENABLED), enabled);

    this.stopTracking();
    if (enabled) {
      this.capture();
      this.startTracking();
      this.apply();
    } else {
      this.clear();
    }
  }

  /**
   * Detaches all player event listeners. Call when the UI instance is released.
   */
  public release(): void {
    this.stopTracking();
    this.player = null;
  }

  private startTracking(): void {
    if (this.player == null) {
      return;
    }
    const { PlayerEvent: Event } = this.player.exports;
    this.track(Event.VolumeChanged, () => saveNumber(storageKey(KEY_VOLUME), this.player.getVolume()));
    this.track(Event.Muted, () => saveBoolean(storageKey(KEY_MUTED), true));
    this.track(Event.Unmuted, () => saveBoolean(storageKey(KEY_MUTED), false));
    this.track(Event.PlaybackSpeedChanged, () =>
      saveNumber(storageKey(KEY_PLAYBACK_SPEED), this.player.getPlaybackSpeed()),
    );
    // Reapply the stored preferences whenever a new source becomes ready while enabled.
    this.track(Event.Ready, () => this.apply());
  }

  private track<E extends PlayerEvent>(event: E, callback: PlayerEventCallback<E>): void {
    this.player.on(event, callback);
    this.unsubscribeHandlers.push(() => this.player.off(event, callback));
  }

  private stopTracking(): void {
    for (const unsubscribe of this.unsubscribeHandlers) {
      unsubscribe();
    }
    this.unsubscribeHandlers = [];
  }

  private capture(): void {
    saveNumber(storageKey(KEY_VOLUME), this.player.getVolume());
    saveBoolean(storageKey(KEY_MUTED), this.player.isMuted());
    saveNumber(storageKey(KEY_PLAYBACK_SPEED), this.player.getPlaybackSpeed());
  }

  private clear(): void {
    StorageUtils.removeItem(storageKey(KEY_VOLUME));
    StorageUtils.removeItem(storageKey(KEY_MUTED));
    StorageUtils.removeItem(storageKey(KEY_PLAYBACK_SPEED));
  }

  private apply(): void {
    if (this.player == null) {
      return;
    }

    const volume = readNumber(storageKey(KEY_VOLUME));
    if (volume !== null && volume >= 0 && volume <= 100) {
      this.player.setVolume(volume, ISSUER);
    }

    const muted = readBoolean(storageKey(KEY_MUTED));
    if (muted !== null) {
      if (muted) {
        this.player.mute(ISSUER);
      } else {
        this.player.unmute(ISSUER);
      }
    }

    const speed = readNumber(storageKey(KEY_PLAYBACK_SPEED));
    if (speed !== null && speed > 0) {
      this.player.setPlaybackSpeed(speed);
    }
  }
}

function saveNumber(key: string, value: number): void {
  if (typeof value !== 'number' || !isFinite(value)) {
    return;
  }
  StorageUtils.setItem(key, String(value));
}

function readNumber(key: string): number | null {
  const raw = StorageUtils.getItem(key);
  if (raw === null) {
    return null;
  }
  const n = parseFloat(raw);
  return isFinite(n) ? n : null;
}

function saveBoolean(key: string, value: boolean): void {
  StorageUtils.setItem(key, value ? '1' : '0');
}

function readBoolean(key: string): boolean | null {
  const raw = StorageUtils.getItem(key);
  if (raw === null) {
    return null;
  }
  return raw === '1';
}
