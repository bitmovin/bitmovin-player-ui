import { Container, ContainerConfig } from '../Container';
import { DOM } from '../../DOM';
import { UIInstanceManager } from '../../UIManager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';

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
 * The overlay can be hidden via its close button and dragged anywhere on the page,
 * including outside the player bounds.
 *
 * @category Components
 */
export class DebugInfoOverlay extends Container<DebugInfoOverlayConfig> {
  private contentElement: DOM;
  private headerElement: DOM;
  private refreshTimer: number | null = null;
  private detachedFromPlayer = false;
  private originalParent: HTMLElement | null = null;
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

    const title = new DOM('span', {
      class: this.prefixCss('ui-debug-info-overlay-title'),
    }).html(i18n.performLocalization(i18n.getLocalizer('videoStats.title')));

    const closeButton = new DOM('button', {
      type: 'button',
      class: this.prefixCss('ui-debug-info-overlay-close'),
      'aria-label': i18n.performLocalization(i18n.getLocalizer('videoStats.hide')),
    }).html('×');

    const stop = (e: Event) => e.stopPropagation();
    closeButton.on('pointerdown', stop);
    closeButton.on('mousedown', stop);
    closeButton.on('click', (e: MouseEvent) => {
      e.stopPropagation();
      this.hide();
    });

    this.headerElement = new DOM('div', {
      class: this.prefixCss('ui-debug-info-overlay-header'),
    });
    this.headerElement.append(title);
    this.headerElement.append(closeButton);

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

    // Reparent the overlay to the player container so it stays visible when the
    // surrounding UI auto-hides (which sets `display: none` on the UI container).
    const playerContainer = player.getContainer();
    const overlayEl = this.getDomElement().get(0) as HTMLElement;
    this.originalParent = overlayEl.parentElement;
    if (overlayEl.parentElement !== playerContainer) {
      playerContainer.appendChild(overlayEl);
    }

    this.update = () => this.updateContent(player);
    this.onUpdatedHandler = this.update;
    this.uiManagerRef = uimanager;

    const startTimer = () => {
      this.stopTimer();
      if (!this.isShown()) return;
      this.refreshTimer = window.setInterval(this.update, this.config.refreshIntervalMs);
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
    // Restore the overlay to the UI container so the next UI re-init owns the DOM node.
    const overlayEl = this.getDomElement().get(0) as HTMLElement;
    if (this.originalParent && overlayEl.parentElement !== this.originalParent) {
      this.originalParent.appendChild(overlayEl);
    }
    super.release();
  }

  private stopTimer(): void {
    if (this.refreshTimer !== null) {
      window.clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private installDragHandlers(rootElement: DOM): void {
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let pointerId: number | null = null;
    const draggingClass = this.prefixCss('ui-debug-info-overlay-dragging');
    const draggableClass = this.prefixCss('ui-debug-info-overlay-draggable');
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

      // First drag detaches the overlay to <body> so it can move past any clipping ancestor.
      if (!this.detachedFromPlayer) {
        const currentRect = rootEl.getBoundingClientRect();
        if (rootEl.parentElement && rootEl.parentElement !== document.body) {
          document.body.appendChild(rootEl);
        }
        rootElement.css({
          position: 'fixed',
          left: `${currentRect.left}px`,
          top: `${currentRect.top}px`,
          right: 'auto',
          bottom: 'auto',
        });
        rootElement.addClass(draggableClass);
        this.detachedFromPlayer = true;
      }

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

    const videoQuality = player.getPlaybackVideoData();
    const audioQuality = player.getPlaybackAudioData();
    const downloadedVideo = player.getDownloadedVideoData();
    const downloadedAudio = player.getDownloadedAudioData();
    const dropped = player.getDroppedVideoFrames();
    const videoBuffer = player.getVideoBufferLength();
    const audioBuffer = player.getAudioBufferLength();
    const streamType = player.getStreamType();
    const playerType = player.getPlayerType();
    const playerVersion = player.version;
    const isLive = player.isLive();
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    const speed = player.getPlaybackSpeed();
    const timeShift = player.getTimeShift();
    const videoQualities = player.getAvailableVideoQualities();
    const audioTracks = player.getAvailableAudio();
    const source = player.getSource();
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
      const decoded = `${videoElement.videoWidth}×${videoElement.videoHeight}`;
      const rendered = `${videoElement.clientWidth}×${videoElement.clientHeight}`;
      lines.push(`Resolution: ${decoded} → ${rendered}`);
    }
    lines.push(`Buffer: v ${videoBuffer.toFixed(2)}s / a ${audioBuffer.toFixed(2)}s`);
    lines.push(`Dropped frames: ${dropped}`);
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
    lines.push(`Available: ${videoQualities.length} video / ${audioTracks.length} audio`);
    const network = formatNetwork();
    if (network) lines.push(`Network: ${network}`);
    const drm = formatDrm(source);
    if (drm) lines.push(`DRM: ${drm}`);
    const manifest = pickManifestUrl(source);
    if (manifest) lines.push(`Manifest: ${truncateMiddle(manifest, 60)}`);
    lines.push(`Stream: ${streamType} (${playerType})`);
    lines.push(`Player: ${playerVersion}`);

    this.contentElement.html(escapeHtml(lines.join('\n')));
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

function formatNetwork(): string | null {
  const conn = (navigator as unknown as { connection?: { effectiveType?: string; downlink?: number; rtt?: number } })
    .connection;
  if (!conn) return null;
  const parts: string[] = [];
  if (conn.effectiveType) parts.push(conn.effectiveType);
  if (typeof conn.downlink === 'number') parts.push(`~${conn.downlink} Mbps`);
  if (typeof conn.rtt === 'number') parts.push(`${conn.rtt}ms rtt`);
  return parts.length > 0 ? parts.join(', ') : null;
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
