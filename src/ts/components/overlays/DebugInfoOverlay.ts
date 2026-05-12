import { Container, ContainerConfig } from '../Container';
import { DOM } from '../../DOM';
import { UIInstanceManager } from '../../UIManager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';
import { Timeout } from '../../utils/Timeout';

/**
 * Configuration interface for the {@link DebugInfoOverlay}.
 *
 * @category Configs
 */
export interface DebugInfoOverlayConfig extends ContainerConfig {
  /**
   * The interval (in milliseconds) at which the displayed stats are refreshed while playback is active.
   * Default: 1000
   */
  refreshIntervalMs?: number;
}

/**
 * A small "stats for nerds"-style overlay that displays live playback diagnostics
 * (resolution, codec, bitrate, buffer level, dropped frames, …) in the corner of the player.
 *
 * Toggled from the {@link PlayerContextMenu}. Draggable by its header.
 *
 * @category Components
 */
export class DebugInfoOverlay extends Container<DebugInfoOverlayConfig> {
  private contentElement: DOM;
  private headerElement: DOM;
  private titleElement: DOM;
  private refreshTimer: Timeout | null = null;
  private update: () => void = () => undefined;
  private onUpdatedHandler: () => void = () => undefined;
  private uiManagerRef: UIInstanceManager | null = null;
  private onPointerMoveDocument: ((e: PointerEvent) => void) | null = null;
  private onPointerUpDocument: ((e: PointerEvent) => void) | null = null;

  constructor(config: DebugInfoOverlayConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-debug-info-overlay',
        refreshIntervalMs: 1000,
      } as DebugInfoOverlayConfig,
      this.config,
    );
  }

  protected toDomElement(): DOM {
    const element = super.toDomElement();

    this.titleElement = new DOM('span', {
      class: this.prefixCss('ui-debug-info-overlay-title'),
    });

    this.refreshLocalizedText();

    this.headerElement = new DOM('div', {
      class: this.prefixCss('ui-debug-info-overlay-header'),
    });
    this.headerElement.append(this.titleElement);

    this.contentElement = new DOM('pre', {
      class: this.prefixCss('ui-debug-info-overlay-content'),
    });

    element.append(this.headerElement);
    element.append(this.contentElement);

    this.installDragHandlers(element);

    return element;
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.update = () => this.updateContent(player);
    this.onUpdatedHandler = this.update;
    this.uiManagerRef = uimanager;

    const startTimer = () => {
      this.stopTimer();
      if (!this.isShown()) return;
      this.refreshTimer = new Timeout(this.config.refreshIntervalMs, this.update, true).start();
    };

    player.on(player.exports.PlayerEvent.Play, startTimer);
    player.on(player.exports.PlayerEvent.Playing, startTimer);
    player.on(player.exports.PlayerEvent.Paused, this.update);
    player.on(player.exports.PlayerEvent.Seeked, this.update);
    player.on(player.exports.PlayerEvent.SourceLoaded, this.update);
    player.on(player.exports.PlayerEvent.SourceUnloaded, this.update);
    player.on(player.exports.PlayerEvent.VideoQualityChanged, this.update);
    player.on(player.exports.PlayerEvent.AudioQualityChanged, this.update);
    player.on(player.exports.PlayerEvent.StallStarted, this.update);
    player.on(player.exports.PlayerEvent.StallEnded, this.update);
    player.on(player.exports.PlayerEvent.PlaybackFinished, () => this.stopTimer());
    player.on(player.exports.PlayerEvent.Destroy, () => this.stopTimer());

    this.onShow.subscribe(() => {
      this.update();
      if (!player.isPaused()) startTimer();
    });
    this.onHide.subscribe(() => this.stopTimer());

    uimanager.getConfig().events.onUpdated.subscribe(this.onUpdatedHandler);

    this.update();
  }

  protected onLanguageChanged(): void {
    super.onLanguageChanged();
    this.refreshLocalizedText();
  }

  private refreshLocalizedText(): void {
    this.titleElement?.html(i18n.performLocalization(i18n.getLocalizer('videoStats.title')));
  }

  release(): void {
    this.stopTimer();
    if (this.onPointerMoveDocument) {
      document.removeEventListener('pointermove', this.onPointerMoveDocument);
      document.removeEventListener('pointerup', this.onPointerUpDocument!);
      document.removeEventListener('pointercancel', this.onPointerUpDocument!);
      this.onPointerMoveDocument = null;
      this.onPointerUpDocument = null;
    }
    if (this.uiManagerRef) {
      this.uiManagerRef.getConfig().events.onUpdated.unsubscribe(this.onUpdatedHandler);
      this.uiManagerRef = null;
    }
    super.release();
  }

  private stopTimer(): void {
    if (this.refreshTimer !== null) {
      this.refreshTimer.clear();
      this.refreshTimer = null;
    }
  }

  private installDragHandlers(rootElement: DOM): void {
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let pointerId: number | null = null;
    const draggingClass = this.prefixCss('ui-debug-info-overlay-dragging');
    const rootEl = rootElement.get(0) as HTMLElement;

    const onPointerMove = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      e.preventDefault();
      rootElement.css({
        position: 'fixed',
        left: `${e.clientX - dragOffsetX}px`,
        top: `${e.clientY - dragOffsetY}px`,
        right: 'auto',
        bottom: 'auto',
      });
    };

    const onPointerUp = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      pointerId = null;
      try {
        rootEl.releasePointerCapture(e.pointerId);
      } catch {
        // pointer capture may already have been released by the browser
      }
      rootElement.removeClass(draggingClass);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerUp);
    };

    this.onPointerMoveDocument = onPointerMove;
    this.onPointerUpDocument = onPointerUp;

    this.headerElement.on('pointerdown', (e: PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();

      const rect = rootEl.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
      pointerId = e.pointerId;

      try {
        rootEl.setPointerCapture(e.pointerId);
      } catch {
        // pointer capture is best-effort
      }
      rootElement.addClass(draggingClass);

      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      document.addEventListener('pointercancel', onPointerUp);
    });
  }

  private updateContent(player: PlayerAPI): void {
    const lines: string[] = [];

    // Some player calls throw on iOS native HLS or muxed HLS where the underlying API
    // can't separate audio/video data. Skip lines we couldn't fetch rather than failing.
    const videoQuality = safe(() => player.getPlaybackVideoData());
    const audioQuality = safe(() => player.getPlaybackAudioData());
    const downloadedVideo = safe(() => player.getDownloadedVideoData());
    const downloadedAudio = safe(() => player.getDownloadedAudioData());
    const dropped = safe(() => player.getDroppedVideoFrames());
    const videoBuffer = safe(() => player.getVideoBufferLength());
    const audioBuffer = safe(() => player.getAudioBufferLength());
    const streamType = safe(() => player.getStreamType());
    const playerType = safe(() => player.getPlayerType());
    const playerVersion = player.version;
    const isLive = safe(() => player.isLive()) === true;
    const currentTime = safe(() => player.getCurrentTime()) ?? 0;
    const duration = safe(() => player.getDuration()) ?? NaN;
    const speed = safe(() => player.getPlaybackSpeed()) ?? 1;
    const timeShift = safe(() => player.getTimeShift()) ?? 0;
    const videoQualities = safe(() => player.getAvailableVideoQualities()) ?? [];
    const audioTracks = safe(() => player.getAvailableAudio()) ?? [];
    const source = safe(() => player.getSource());
    const videoElement = player.getContainer().querySelector('video') as HTMLVideoElement | null;

    if (videoQuality) {
      const fps = (videoQuality as { frameRate?: number }).frameRate;
      const res =
        videoQuality.width && videoQuality.height
          ? `${videoQuality.width}×${videoQuality.height}${fps ? `@${fps}` : ''}`
          : '–';
      lines.push(`Video: ${res} ${formatBitrate(videoQuality.bitrate)} (${videoQuality.codec || '?'})`);
    }
    if (downloadedVideo && !sameQuality(videoQuality, downloadedVideo)) {
      lines.push(`  ↓ ${formatBitrate(downloadedVideo.bitrate)}`);
    }
    if (audioQuality) {
      lines.push(`Audio: ${formatBitrate(audioQuality.bitrate)} (${audioQuality.codec || '?'})`);
    }
    if (downloadedAudio && !sameQuality(audioQuality, downloadedAudio)) {
      lines.push(`  ↓ ${formatBitrate(downloadedAudio.bitrate)}`);
    }
    if (videoElement && videoElement.videoWidth > 0) {
      lines.push(`Decoded: ${videoElement.videoWidth}×${videoElement.videoHeight}`);
      lines.push(`Rendered: ${videoElement.clientWidth}×${videoElement.clientHeight}`);
    }
    if (typeof videoBuffer === 'number' && typeof audioBuffer === 'number') {
      lines.push(`Buffer: v ${videoBuffer.toFixed(2)}s / a ${audioBuffer.toFixed(2)}s`);
    }
    if (typeof dropped === 'number' && dropped > 0) {
      lines.push(`Dropped frames: ${dropped}`);
    }
    const speedStr = speed !== 1 ? ` @ ${speed.toFixed(2)}×` : '';
    if (isLive) {
      lines.push(`Time: ${formatSeconds(currentTime)}${speedStr}`);
      // timeShift: 0 at the live edge, negative when behind.
      lines.push(`Live latency: ${(-timeShift).toFixed(2)}s behind edge`);
    } else if (isFinite(duration)) {
      lines.push(`Time: ${formatSeconds(currentTime)} / ${formatSeconds(duration)}${speedStr}`);
    } else {
      lines.push(`Time: ${formatSeconds(currentTime)}${speedStr}`);
    }
    if (videoQualities.length > 0 || audioTracks.length > 0) {
      lines.push(`Available: ${videoQualities.length} video / ${audioTracks.length} audio`);
    }
    const videoCodecFamilies = collectCodecFamilies(videoQualities.map(q => q.codec));
    if (videoCodecFamilies.length > 0) {
      lines.push(`Video codecs: ${videoCodecFamilies.join(', ')}`);
    }
    const audioCodecFamilies = collectAudioCodecs(player);
    if (audioCodecFamilies.length > 0) {
      lines.push(`Audio codecs: ${audioCodecFamilies.join(', ')}`);
    }
    const drm = formatDrm(source);
    if (drm) lines.push(`DRM: ${drm}`);
    const manifest = pickManifestUrl(source);
    if (manifest) lines.push(`Manifest: ${truncateMiddle(manifest, 60)}`);
    if (streamType && playerType) {
      lines.push(`Stream: ${streamType} (${playerType})`);
    }
    lines.push(`Player: ${playerVersion}`);

    // Don't clobber a user's text selection inside the overlay. Reassigning innerHTML
    // tears down the text node and collapses any active selection range, so skip writes
    // while the user is mid-copy.
    if (this.hasSelectionInside()) return;

    const playerStatsHtml = escapeHtml(lines.join('\n'));
    // Only update when the rendered text actually changed — avoids unnecessary innerHTML
    // writes that would still nuke a selection that re-establishes on the next tick.
    if (this.contentElement.html() === playerStatsHtml) return;

    this.contentElement.html(playerStatsHtml);
  }

  private hasSelectionInside(): boolean {
    const selection = typeof window !== 'undefined' ? window.getSelection() : null;
    if (!selection || selection.isCollapsed || !selection.anchorNode) return false;
    const contentEl = this.contentElement?.get(0);
    if (!contentEl) return false;
    const anchor = selection.anchorNode;
    return contentEl === anchor || contentEl.contains(anchor);
  }
}

interface QualityIdentity {
  id?: string;
  bitrate?: number;
}

function sameQuality(a: QualityIdentity | undefined, b: QualityIdentity): boolean {
  if (!a) return false;
  if (a.id && b.id) return a.id === b.id;
  return a.bitrate === b.bitrate;
}

// Wrap player calls that can throw on platforms with partial API support
// (iOS native HLS, muxed HLS where audio data isn't separately retrievable).
function safe<T>(fn: () => T): T | undefined {
  try {
    return fn();
  } catch {
    return undefined;
  }
}

export function formatBitrate(bitrate: number | undefined): string {
  if (!bitrate || !isFinite(bitrate)) {
    return '? kbps';
  }
  if (bitrate >= 1_000_000) {
    return `${(bitrate / 1_000_000).toFixed(2)} Mbps`;
  }
  return `${Math.round(bitrate / 1000)} kbps`;
}

export function formatSeconds(seconds: number): string {
  if (!isFinite(seconds)) return '∞';
  const sign = seconds < 0 ? '-' : '';
  const total = Math.floor(Math.abs(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${sign}${h}:${pad(m)}:${pad(s)}` : `${sign}${m}:${pad(s)}`;
}

export function truncateMiddle(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const half = Math.floor((maxLength - 1) / 2);
  return `${text.slice(0, half)}…${text.slice(text.length - half)}`;
}

/**
 * Returns the distinct codec families across the supplied codec strings, preserving the
 * order in which each family is first seen. The "family" is the prefix before the first
 * `.` (e.g. `avc1`, `hevc`, `av01`, `vp09`, `mp4a`), which gives a compact, scannable
 * summary instead of a long list of profile/level variants.
 */
export function collectCodecFamilies(codecs: (string | undefined)[]): string[] {
  const families: string[] = [];
  for (const c of codecs) {
    if (!c) continue;
    const family = c.split('.')[0] || c;
    if (!families.includes(family)) families.push(family);
  }
  return families;
}

/**
 * Gathers the codec strings of all available audio variants across all audio tracks. The
 * Bitmovin API exposes audio qualities indirectly via the active audio track; iterating
 * `getAvailableAudio()` and merging `getAvailableAudioQualities()` per track gives the
 * full set the source advertises.
 */
function collectAudioCodecs(player: PlayerAPI): string[] {
  const getQualities = (
    player as PlayerAPI & {
      getAvailableAudioQualities?: () => Array<{ codec?: string }>;
    }
  ).getAvailableAudioQualities;
  if (!getQualities) return [];
  try {
    const qualities: Array<{ codec?: string }> = getQualities.call(player) ?? [];
    return collectCodecFamilies(qualities.map(q => q.codec));
  } catch {
    // Some player versions throw before a source is loaded.
    return [];
  }
}

function formatDrm(source: unknown): string | null {
  const drm = (source as { drm?: Record<string, unknown> } | undefined)?.drm;
  if (!drm) return null;
  const systems = Object.keys(drm);
  return systems.length > 0 ? systems.join(', ') : null;
}

function pickManifestUrl(source: unknown): string | null {
  const s = source as
    | { dash?: string; hls?: string; smooth?: string; progressive?: string | { url: string }[] }
    | undefined;
  if (!s) return null;
  if (s.dash) return s.dash;
  if (s.hls) return s.hls;
  if (s.smooth) return s.smooth;
  if (typeof s.progressive === 'string') return s.progressive;
  if (Array.isArray(s.progressive) && s.progressive[0]?.url) return s.progressive[0].url;
  return null;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
