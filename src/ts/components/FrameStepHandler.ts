import { Component, ComponentConfig } from './Component';
import { DOM } from '../DOM';
import { UIInstanceManager } from '../UIManager';
import { PlayerAPI } from 'bitmovin-player';

/**
 * Configuration interface for the {@link FrameStepHandler}.
 *
 * @category Configs
 */
export interface FrameStepHandlerConfig extends ComponentConfig {
  /**
   * The keyboard key that steps backward by one frame.
   * Default: ',' (matches YouTube convention)
   */
  stepBackKey?: string;
  /**
   * The keyboard key that steps forward by one frame.
   * Default: '.' (matches YouTube convention)
   */
  stepForwardKey?: string;
  /**
   * Fallback frame rate (frames per second) used when the player does not expose one
   * (e.g. progressive sources where `getPlaybackVideoData()` has no `frameRate`).
   * Default: 30
   */
  fallbackFps?: number;
}

/**
 * A no-DOM "service" component that adds keyboard-driven frame-by-frame stepping to the
 * player. Pressing {@link FrameStepHandlerConfig.stepBackKey} steps one frame back;
 * pressing {@link FrameStepHandlerConfig.stepForwardKey} steps one frame forward. If
 * playback is currently in progress, it is paused first so the step lands on a stable
 * frame.
 *
 * The component is keyboard-only by design and is meaningful primarily on devices with a
 * physical keyboard (desktop, attached BT keyboards). It does not register any TV remote
 * mappings — most TV remotes don't expose `,` / `.` codes — but it is harmless on those
 * devices. Form fields are excluded so typing in inputs / textareas isn't intercepted.
 *
 * @category Components
 */
export class FrameStepHandler extends Component<FrameStepHandlerConfig> {
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private uiContainerEl: HTMLElement | null = null;

  constructor(config: FrameStepHandlerConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-frame-step-handler',
        hidden: true,
        stepBackKey: ',',
        stepForwardKey: '.',
        fallbackFps: 30,
      } as FrameStepHandlerConfig,
      this.config,
    );
  }

  protected toDomElement(): DOM {
    // Service-only component — render a hidden placeholder so the framework's lifecycle
    // hooks still wire up correctly without contributing to the layout.
    return new DOM(
      this.config.tag,
      {
        id: this.config.id,
        class: this.getCssClasses(),
        'aria-hidden': 'true',
      },
      this,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    const config = this.getConfig();
    this.uiContainerEl = uimanager.getUI().getDomElement().get(0) as HTMLElement;
    if (!this.uiContainerEl) return;

    // Allow the UI container to receive keyboard focus so the listener fires when a user
    // tabs onto the player. Don't override an existing tabindex set by an integrator.
    if (!this.uiContainerEl.hasAttribute('tabindex')) {
      this.uiContainerEl.setAttribute('tabindex', '-1');
    }

    this.keydownHandler = (e: KeyboardEvent) => {
      if (isInsideEditableField(e.target)) return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

      let direction = 0;
      if (e.key === config.stepBackKey) direction = -1;
      else if (e.key === config.stepForwardKey) direction = 1;
      else return;

      e.preventDefault();
      this.step(player, direction);
    };
    this.uiContainerEl.addEventListener('keydown', this.keydownHandler);
  }

  release(): void {
    if (this.uiContainerEl && this.keydownHandler) {
      this.uiContainerEl.removeEventListener('keydown', this.keydownHandler);
    }
    this.keydownHandler = null;
    this.uiContainerEl = null;
    super.release();
  }

  private step(player: PlayerAPI, direction: number): void {
    if (player.isLive()) return;
    if (!player.isPaused()) {
      try {
        player.pause('ui');
      } catch {
        // pause() can throw briefly during source switches — best-effort.
      }
    }

    const fps = this.resolveFps(player);
    const delta = direction * (1 / fps);
    const target = Math.max(0, player.getCurrentTime() + delta);
    try {
      player.seek(target);
    } catch {
      // seek() can fail before the source is ready — best-effort.
    }
  }

  private resolveFps(player: PlayerAPI): number {
    const data = player.getPlaybackVideoData() as { frameRate?: number } | null | undefined;
    const fps = data && typeof data.frameRate === 'number' ? data.frameRate : 0;
    return fps > 0 ? fps : this.config.fallbackFps;
  }
}

function isInsideEditableField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}
