import { StorageUtils } from './StorageUtils';
import { PlayerAPI } from 'bitmovin-player';
import { UIConfig } from '../UIConfig';

const STORAGE_KEY_PREFIX = 'bitmovin.player.ui.resume.';
const ENTRY_TTL_MS = 1000 * 60 * 60 * 24 * 90; // 90 days

interface ResumeEntry {
  /** Saved playback time in seconds. */
  t: number;
  /** Source duration in seconds at the time of saving (used to skip near-finished entries). */
  d: number;
  /** Wall clock time when the entry was last written (`Date.now()`). */
  s: number;
}

/**
 * Persists per-source resume positions to localStorage so the player can offer to resume
 * playback where the user left off.
 *
 * Sources are identified by a stable hash of (in order): metadata.title, dash, hls,
 * smooth, progressive URL. If none of these are present the source is not eligible for
 * resume tracking — the source identity is too ambiguous to reliably key on.
 *
 * Storage is opt-in via {@link UIConfig.disableStorageApi}; if unavailable (private mode,
 * restricted WebViews, RDK / set-top boxes without persistent storage) all operations
 * become no-ops.
 *
 * @category Utils
 */
export namespace ResumeStorage {
  /**
   * Returns a stable, short storage key for the currently loaded source, or null if the
   * source can't be identified (so we should not save a resume entry for it).
   */
  export function keyFor(player: PlayerAPI, uiConfig: UIConfig): string | null {
    const id = sourceIdentifier(player, uiConfig);
    if (!id) return null;
    return STORAGE_KEY_PREFIX + djb2(id);
  }

  /**
   * Reads the saved resume entry for this source, or null if there isn't one (or it has
   * expired).
   */
  export function read(key: string): ResumeEntry | null {
    const entry = StorageUtils.getObject<ResumeEntry>(key);
    if (!entry || typeof entry.t !== 'number') return null;
    if (typeof entry.s === 'number' && Date.now() - entry.s > ENTRY_TTL_MS) {
      clear(key);
      return null;
    }
    return entry;
  }

  /**
   * Writes (or overwrites) the resume entry for this source. Skips writes when the time
   * is at the start (< 5 s in) or near the end (within 30 s of duration) — neither case
   * is worth offering a resume for.
   */
  export function write(key: string, time: number, duration: number): void {
    if (!isFinite(time) || time < 5) return;
    if (isFinite(duration) && duration > 0 && time > duration - 30) return;
    StorageUtils.setObject<ResumeEntry>(key, { t: time, d: duration || 0, s: Date.now() });
  }

  /**
   * Removes the resume entry, e.g. when the user picks "Start over" or playback finishes.
   */
  export function clear(key: string): void {
    StorageUtils.setItem(key, '');
  }
}

function sourceIdentifier(player: PlayerAPI, uiConfig: UIConfig): string | null {
  const source = player.getSource() as {
    dash?: string;
    hls?: string;
    smooth?: string;
    progressive?: string | { url: string }[];
  } | null;
  const title = uiConfig.metadata?.title;
  if (title) return 't:' + title;
  if (!source) return null;
  if (source.dash) return 'd:' + source.dash;
  if (source.hls) return 'h:' + source.hls;
  if (source.smooth) return 's:' + source.smooth;
  if (typeof source.progressive === 'string') return 'p:' + source.progressive;
  if (Array.isArray(source.progressive) && source.progressive[0]?.url) {
    return 'p:' + source.progressive[0].url;
  }
  return null;
}

/**
 * Tiny djb2 string hash (xor variant). Produces a short, stable, ES5-safe key derived
 * from the source identifier. Not cryptographic — only used for keying localStorage.
 */
function djb2(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}
