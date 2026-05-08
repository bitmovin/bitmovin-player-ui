import { Container, ContainerConfig } from '../Container';
import { DOM } from '../../DOM';
import { UIInstanceManager } from '../../UIManager';
import { PlayerAPI } from 'bitmovin-player';

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
    }).html('video stats');

    const closeButton = new DOM('button', {
      type: 'button',
      class: this.prefixCss('ui-debug-info-overlay-close'),
      'aria-label': 'Hide video stats',
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

    // Detach the overlay from the UI container so it isn't hidden together with the
    // auto-hiding player controls. We reparent it to the player container (sibling of
    // the UI container), which still follows fullscreen mode but stays visible when
    // the controls fade out.
    const playerContainer = player.getContainer?.();
    const overlayEl = this.getDomElement().get(0) as HTMLElement;
    if (playerContainer && overlayEl.parentElement !== playerContainer) {
      playerContainer.appendChild(overlayEl);
    }

    const update = () => this.updateContent(player);

    const startTimer = () => {
      stopTimer();
      this.refreshTimer = window.setInterval(update, this.config.refreshIntervalMs);
    };

    const stopTimer = () => {
      if (this.refreshTimer !== null) {
        window.clearInterval(this.refreshTimer);
        this.refreshTimer = null;
      }
    };

    player.on(player.exports.PlayerEvent.Play, startTimer);
    player.on(player.exports.PlayerEvent.Playing, startTimer);
    player.on(player.exports.PlayerEvent.Paused, update);
    player.on(player.exports.PlayerEvent.Seeked, update);
    player.on(player.exports.PlayerEvent.SourceLoaded, update);
    player.on(player.exports.PlayerEvent.SourceUnloaded, update);
    player.on(player.exports.PlayerEvent.VideoQualityChanged, update);
    player.on(player.exports.PlayerEvent.AudioQualityChanged, update);
    player.on(player.exports.PlayerEvent.StallStarted, update);
    player.on(player.exports.PlayerEvent.StallEnded, update);
    player.on(player.exports.PlayerEvent.PlaybackFinished, stopTimer);
    player.on(player.exports.PlayerEvent.Destroy, stopTimer);

    uimanager.getConfig().events.onUpdated.subscribe(update);

    update();
  }

  private installDragHandlers(rootElement: DOM): void {
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let pointerId: number | null = null;
    const draggingClass = this.prefixCss('ui-debug-info-overlay-dragging');
    const draggableClass = this.prefixCss('ui-debug-info-overlay-draggable');
    const rootEl = rootElement.get(0) as HTMLElement;

    const onMove = (clientX: number, clientY: number) => {
      const x = clientX - dragOffsetX;
      const y = clientY - dragOffsetY;
      rootElement.css({
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        right: 'auto',
        bottom: 'auto',
      });
    };

    const onPointerMove = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      e.preventDefault();
      onMove(e.clientX, e.clientY);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      pointerId = null;
      try {
        rootEl.releasePointerCapture(e.pointerId);
      } catch {
        // ignore — pointer might already be released
      }
      rootElement.removeClass(draggingClass);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerUp);
    };

    this.headerElement.on('pointerdown', (e: PointerEvent) => {
      // Only react to primary button (left click / single touch)
      if (e.button !== 0) return;
      e.preventDefault();

      // On first drag, detach from the player container so the overlay can be moved
      // outside the player area without being clipped.
      if (!this.detachedFromPlayer) {
        const currentRect = rootEl.getBoundingClientRect();
        const parent = rootEl.parentElement;
        if (parent && parent !== document.body) {
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
        // ignore — capture is best-effort
      }
      rootElement.addClass(draggingClass);

      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      document.addEventListener('pointercancel', onPointerUp);
    });
  }

  private updateContent(player: PlayerAPI): void {
    const lines: string[] = [];

    const safeCall = <T>(fn: () => T): T | undefined => {
      try {
        return fn();
      } catch {
        return undefined;
      }
    };

    const videoQuality = safeCall(() => player.getPlaybackVideoData?.());
    const audioQuality = safeCall(() => player.getPlaybackAudioData?.());
    const downloadedVideo = safeCall(() => player.getDownloadedVideoData?.());
    const downloadedAudio = safeCall(() => player.getDownloadedAudioData?.());
    const dropped = safeCall(() => player.getDroppedVideoFrames?.());
    const videoBuffer = safeCall(() => player.getVideoBufferLength?.());
    const audioBuffer = safeCall(() => player.getAudioBufferLength?.());
    const streamType = safeCall(() => player.getStreamType?.());
    const playerType = safeCall(() => player.getPlayerType?.());
    const playerVersion = safeCall(() => (player as unknown as { version?: string }).version);
    const isLive = safeCall(() => player.isLive?.());
    const currentTime = safeCall(() => player.getCurrentTime?.());
    const duration = safeCall(() => player.getDuration?.());
    const speed = safeCall(() => player.getPlaybackSpeed?.());
    const timeShift = safeCall(() => player.getTimeShift?.());
    const videoQualities = safeCall(() => player.getAvailableVideoQualities?.());
    const audioTracks = safeCall(() => player.getAvailableAudio?.());
    const source = safeCall(() => player.getSource?.());
    const videoElement = safeCall(() => player.getContainer?.()?.querySelector('video') as HTMLVideoElement | null);

    if (videoQuality) {
      const w = videoQuality.width;
      const h = videoQuality.height;
      const fps = (videoQuality as { frameRate?: number }).frameRate;
      const res = w && h ? `${w}×${h}${fps ? `@${fps}` : ''}` : '–';
      lines.push(`Video: ${res} ${formatBitrate(videoQuality.bitrate)} (${videoQuality.codec || '?'})`);
    }
    if (downloadedVideo && downloadedVideo !== videoQuality) {
      lines.push(`  ↓ ${formatBitrate(downloadedVideo.bitrate)}`);
    }
    if (audioQuality) {
      lines.push(`Audio: ${formatBitrate(audioQuality.bitrate)} (${audioQuality.codec || '?'})`);
    }
    if (downloadedAudio && downloadedAudio !== audioQuality) {
      lines.push(`  ↓ ${formatBitrate(downloadedAudio.bitrate)}`);
    }
    if (videoElement && videoElement.videoWidth > 0) {
      const decoded = `${videoElement.videoWidth}×${videoElement.videoHeight}`;
      const rendered = `${videoElement.clientWidth}×${videoElement.clientHeight}`;
      lines.push(`Resolution: ${decoded} → ${rendered}`);
    }
    if (videoBuffer != null || audioBuffer != null) {
      const v = videoBuffer != null ? `${videoBuffer.toFixed(2)}s` : '–';
      const a = audioBuffer != null ? `${audioBuffer.toFixed(2)}s` : '–';
      lines.push(`Buffer: v ${v} / a ${a}`);
    }
    if (dropped != null) {
      lines.push(`Dropped frames: ${dropped}`);
    }
    if (currentTime != null) {
      const speedStr = speed != null && speed !== 1 ? ` @ ${speed.toFixed(2)}×` : '';
      if (isLive) {
        lines.push(`Time: ${formatSeconds(currentTime)}${speedStr}`);
      } else if (duration != null && isFinite(duration)) {
        lines.push(`Time: ${formatSeconds(currentTime)} / ${formatSeconds(duration)}${speedStr}`);
      } else {
        lines.push(`Time: ${formatSeconds(currentTime)}${speedStr}`);
      }
    }
    if (isLive && timeShift != null) {
      // timeShift is 0 at the live edge and negative when behind
      lines.push(`Live latency: ${(-timeShift).toFixed(2)}s behind edge`);
    }
    if (videoQualities || audioTracks) {
      const v = videoQualities ? videoQualities.length : '–';
      const a = audioTracks ? audioTracks.length : '–';
      lines.push(`Available: ${v} video / ${a} audio`);
    }
    const network = formatNetwork();
    if (network) {
      lines.push(`Network: ${network}`);
    }
    const drm = formatDrm(source);
    if (drm) {
      lines.push(`DRM: ${drm}`);
    }
    const manifest = pickManifestUrl(source);
    if (manifest) {
      lines.push(`Manifest: ${truncateMiddle(manifest, 60)}`);
    }
    if (streamType || playerType) {
      lines.push(`Stream: ${streamType || '?'} (${playerType || '?'})`);
    }
    if (playerVersion) {
      lines.push(`Player: ${playerVersion}`);
    }

    this.contentElement.html(lines.length > 0 ? escapeHtml(lines.join('\n')) : '');
  }
}

function formatSeconds(seconds: number): string {
  if (!isFinite(seconds)) return '∞';
  const sign = seconds < 0 ? '-' : '';
  const total = Math.floor(Math.abs(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${sign}${h}:${pad(m)}:${pad(s)}` : `${sign}${m}:${pad(s)}`;
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

function truncateMiddle(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const half = Math.floor((maxLength - 1) / 2);
  return `${text.slice(0, half)}…${text.slice(text.length - half)}`;
}

function formatBitrate(bitrate: number | undefined): string {
  if (!bitrate || !isFinite(bitrate)) {
    return '? kbps';
  }
  if (bitrate >= 1_000_000) {
    return `${(bitrate / 1_000_000).toFixed(2)} Mbps`;
  }
  return `${Math.round(bitrate / 1000)} kbps`;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
