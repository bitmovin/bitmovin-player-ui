import { StorageUtils } from './StorageUtils';
import { PlayerAPI } from 'bitmovin-player';

const STORAGE_KEY_PREFIX = 'bitmovin.player.ui.preferences.';
const KEY_ENABLED = STORAGE_KEY_PREFIX + 'enabled';
const KEY_VOLUME = STORAGE_KEY_PREFIX + 'volume';
const KEY_MUTED = STORAGE_KEY_PREFIX + 'muted';
const KEY_PLAYBACK_SPEED = STORAGE_KEY_PREFIX + 'playbackSpeed';

const ISSUER = 'ui-preferences';

/**
 * Persists a small set of cross-session UI preferences (volume, muted, playback speed)
 * into localStorage and reapplies them when a new player is configured.
 *
 * Defaults to a no-op when storage is unavailable (private browsing, restricted WebViews,
 * RDK / set-top boxes without persistent storage). All write paths route through
 * {@link StorageUtils} which already swallows storage errors.
 *
 * Persistence is gated by an end-user opt-in flag stored alongside the preferences
 * themselves (see {@link isEnabled} / {@link setEnabled}). When the integrator enables
 * the feature via `UIConfig.enablePersistentPreferences`, the bundled default UI exposes
 * a toggle in the settings panel that flips this flag.
 *
 * @category Utils
 */
export namespace UIPreferences {
  /**
   * Whether the end-user has opted in to having their preferences persisted across
   * sessions. Defaults to `false` when no value is stored.
   */
  export function isEnabled(): boolean {
    return readBoolean(KEY_ENABLED) === true;
  }

  /**
   * Sets the end-user opt-in flag.
   *
   * When turning on, the player's current volume, mute, and playback speed are captured
   * to storage so the preference takes effect immediately even if the user does not
   * change anything else in this session.
   *
   * When turning off, any previously stored preferences are removed so the next session
   * starts fresh.
   */
  export function setEnabled(player: PlayerAPI, enabled: boolean): void {
    saveBoolean(KEY_ENABLED, enabled);
    if (enabled) {
      saveNumber(KEY_VOLUME, player.getVolume());
      saveBoolean(KEY_MUTED, player.isMuted());
      saveNumber(KEY_PLAYBACK_SPEED, player.getPlaybackSpeed());
    } else {
      StorageUtils.removeItem(KEY_VOLUME);
      StorageUtils.removeItem(KEY_MUTED);
      StorageUtils.removeItem(KEY_PLAYBACK_SPEED);
    }
  }

  /**
   * Subscribes to the player events that change a tracked preference and writes the
   * latest value back to storage. Writes are skipped while {@link isEnabled} returns
   * `false`, so the listeners can be attached unconditionally.
   */
  export function attach(player: PlayerAPI): void {
    player.on(player.exports.PlayerEvent.VolumeChanged, () => {
      if (!isEnabled()) return;
      saveNumber(KEY_VOLUME, player.getVolume());
    });
    player.on(player.exports.PlayerEvent.Muted, () => {
      if (!isEnabled()) return;
      saveBoolean(KEY_MUTED, true);
    });
    player.on(player.exports.PlayerEvent.Unmuted, () => {
      if (!isEnabled()) return;
      saveBoolean(KEY_MUTED, false);
    });
    player.on(player.exports.PlayerEvent.PlaybackSpeedChanged, () => {
      if (!isEnabled()) return;
      saveNumber(KEY_PLAYBACK_SPEED, player.getPlaybackSpeed());
    });
  }

  /**
   * Applies the persisted preferences to the player. Should be called after the player is
   * ready to accept volume / mute / speed calls (typically on `Ready` or after the source
   * has been loaded). Each preference is applied independently — missing entries are skipped.
   * No-op when {@link isEnabled} returns `false`.
   */
  export function apply(player: PlayerAPI): void {
    if (!isEnabled()) return;

    const volume = readNumber(KEY_VOLUME);
    if (volume !== null && volume >= 0 && volume <= 100) {
      player.setVolume(volume, ISSUER);
    }

    const muted = readBoolean(KEY_MUTED);
    if (muted === true) {
      player.mute(ISSUER);
    } else if (muted === false) {
      player.unmute(ISSUER);
    }

    const speed = readNumber(KEY_PLAYBACK_SPEED);
    if (speed !== null && speed > 0 && speed <= 4) {
      player.setPlaybackSpeed(speed);
    }
  }
}

function saveNumber(key: string, value: number): void {
  if (typeof value !== 'number' || !isFinite(value)) return;
  StorageUtils.setItem(key, String(value));
}

function readNumber(key: string): number | null {
  const raw = StorageUtils.getItem(key);
  if (raw === null) return null;
  const n = parseFloat(raw);
  return isFinite(n) ? n : null;
}

function saveBoolean(key: string, value: boolean): void {
  StorageUtils.setItem(key, value ? '1' : '0');
}

function readBoolean(key: string): boolean | null {
  const raw = StorageUtils.getItem(key);
  if (raw === null) return null;
  return raw === '1';
}
