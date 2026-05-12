import { Container, ContainerConfig } from './Container';
import { DOM } from '../DOM';
import { UIInstanceManager } from '../UIManager';
import { PlayerAPI } from 'bitmovin-player';
import { DebugInfoOverlay } from './overlays/DebugInfoOverlay';
import { i18n } from '../localization/i18n';
import { version as UI_VERSION_RAW } from '../main';
import { SettingsPanelItem, SettingsPanelItemConfig } from './settings/SettingsPanelItem';
import { SettingsPanel, SettingsPanelConfig } from './settings/SettingsPanel';
import { Label, LabelConfig } from './labels/Label';
import { Button, ButtonConfig, ButtonStyle } from './buttons/Button';

// `version` in `main.ts` carries the JSON-stringified package version (i.e. surrounded
// by quotes from the build-time replacement). Peel them off for display.
const UI_VERSION: string = UI_VERSION_RAW.replace(/^"|"$/g, '');

/**
 * Configuration interface for the {@link PlayerContextMenu}.
 *
 * @category Configs
 */
export interface PlayerContextMenuConfig extends ContainerConfig {
  /**
   * The {@link DebugInfoOverlay} that the context menu's toggle button controls.
   * If omitted, the toggle button is hidden.
   */
  debugInfoOverlay?: DebugInfoOverlay;
}

/**
 * A floating context menu shown when the user right-clicks on the player.
 * Displays Bitmovin info, the Player and UI versions, and an action button to
 * toggle the {@link DebugInfoOverlay}.
 *
 * @category Components
 */
export class PlayerContextMenu extends Container<PlayerContextMenuConfig> {
  private headerElement: DOM;
  private subtitleElement: DOM;
  private playerVersionElement: DOM;
  private toggleButton: Button<ButtonConfig>;
  private copyDebugInfoButton: Button<ButtonConfig>;
  private copySourceButton: Button<ButtonConfig>;
  private copyConfigButton: Button<ButtonConfig>;

  private uiContextMenuHandler: ((e: MouseEvent) => void) | null = null;
  private documentKeyDownHandler: ((e: KeyboardEvent) => void) | null = null;
  private documentScrollDismissHandler: ((e: Event) => void) | null = null;
  private uiContainerElement: HTMLElement | null = null;
  private playerContainerElement: HTMLElement | null = null;
  private debugOverlayLabelHandler: (() => void) | null = null;

  constructor(config: PlayerContextMenuConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-player-context-menu',
        hidden: true,
        role: 'menu',
      } as PlayerContextMenuConfig,
      this.config,
    );
  }

  protected toDomElement(): DOM {
    const element = super.toDomElement();

    this.headerElement = new DOM('div', {
      class: this.prefixCss('ui-player-context-menu-header'),
    });

    this.subtitleElement = new DOM('div', {
      class: this.prefixCss('ui-player-context-menu-subtitle'),
    });

    this.playerVersionElement = new DOM('div', {
      class: this.prefixCss('ui-player-context-menu-info'),
    }).html('Player: –');

    const uiVersionElement = new DOM('div', {
      class: this.prefixCss('ui-player-context-menu-info'),
    }).html(`UI: ${UI_VERSION}`);

    const separator = new DOM('div', {
      class: this.prefixCss('ui-player-context-menu-separator'),
    });

    const actionButton = () =>
      new Button<ButtonConfig>({
        cssClass: 'ui-player-context-menu-button',
        role: 'menuitem',
        buttonStyle: ButtonStyle.Text,
        text: '',
      });

    this.toggleButton = actionButton();
    this.copyDebugInfoButton = actionButton();
    this.copySourceButton = actionButton();
    this.copyConfigButton = actionButton();

    this.refreshLocalizedText();

    element.append(this.headerElement);
    element.append(this.subtitleElement);
    element.append(this.playerVersionElement);
    element.append(uiVersionElement);
    element.append(separator);
    element.append(this.toggleButton.getDomElement());
    element.append(this.copyDebugInfoButton.getDomElement());
    element.append(this.copySourceButton.getDomElement());
    element.append(this.copyConfigButton.getDomElement());

    return element;
  }

  protected onLanguageChanged(): void {
    super.onLanguageChanged();
    this.refreshLocalizedText();
  }

  private refreshLocalizedText(): void {
    this.headerElement?.html(i18n.performLocalization(i18n.getLocalizer('contextMenu.title')));
    this.subtitleElement?.html(i18n.performLocalization(i18n.getLocalizer('contextMenu.subtitle')));
    this.copyDebugInfoButton?.setText(i18n.getLocalizer('contextMenu.copyDebugInfo'));
    this.copySourceButton?.setText(i18n.getLocalizer('contextMenu.copySource'));
    this.copyConfigButton?.setText(i18n.getLocalizer('contextMenu.copyConfig'));
    // The toggle button label reflects the current `DebugInfoOverlay` state and is kept
    // in sync by the `updateLabel` handler in `configure()`; nothing to do here.
    const debugOverlay = this.config.debugInfoOverlay;
    if (this.toggleButton) {
      const showLabel = i18n.getLocalizer('videoStats.show');
      const hideLabel = i18n.getLocalizer('videoStats.hide');
      this.toggleButton.setText(debugOverlay?.isShown() ? hideLabel : showLabel);
    }
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.playerVersionElement.html(`Player: ${player.version}`);

    const uiContainerEl = uimanager.getUI().getDomElement().get(0) as HTMLElement;
    this.uiContainerElement = uiContainerEl;
    this.playerContainerElement = player.getContainer();
    const rootEl = this.getDomElement().get(0) as HTMLElement;

    this.uiContextMenuHandler = (e: MouseEvent) => {
      // Skip the <video> element so the browser's native video context menu
      // (Save video as, Picture-in-Picture, …) keeps working.
      if ((e.target as HTMLElement).tagName === 'VIDEO') return;
      e.preventDefault();
      this.showAt(e.clientX, e.clientY);
    };
    uiContainerEl.addEventListener('contextmenu', this.uiContextMenuHandler);

    // Outside-click dismissal is handled by the sibling `DismissClickOverlay` that the
    // UIFactory wires up against this menu; only Escape + scroll need direct hookup.
    this.documentKeyDownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isShown()) this.hide();
    };
    // Hide as soon as the user starts scrolling — `position: fixed` keeps the menu glued
    // to the viewport, which looks broken once the page moves underneath it. Use `wheel`
    // and `touchmove` (both bubble) rather than `scroll` (doesn't bubble; a window-level
    // capture listener misses scrolls that happen inside nested scroll containers).
    this.documentScrollDismissHandler = () => {
      if (this.isShown()) this.hide();
    };
    document.addEventListener('keydown', this.documentKeyDownHandler);
    document.addEventListener('wheel', this.documentScrollDismissHandler, { capture: true, passive: true });
    document.addEventListener('touchmove', this.documentScrollDismissHandler, { capture: true, passive: true });

    const copiedLabel = i18n.getLocalizer('contextMenu.copied');
    const sourceLabel = i18n.getLocalizer('contextMenu.copySource');
    const configLabel = i18n.getLocalizer('contextMenu.copyConfig');
    const debugInfoLabel = i18n.getLocalizer('contextMenu.copyDebugInfo');
    const wireCopyButton = (
      button: Button<ButtonConfig>,
      label: ReturnType<typeof i18n.getLocalizer>,
      getValue: () => unknown,
    ) => {
      button.onClick.subscribe(() => {
        copyToClipboard(JSON.stringify(getValue() ?? null, jsonReplacer, 2));
        button.setText(copiedLabel);
        window.setTimeout(() => button.setText(label), 1200);
      });
    };
    wireCopyButton(this.copyDebugInfoButton, debugInfoLabel, () => buildDebugInfo(player));
    wireCopyButton(this.copySourceButton, sourceLabel, () => player.getSource());
    wireCopyButton(this.copyConfigButton, configLabel, () => player.getConfig());

    const debugOverlay = this.config.debugInfoOverlay;
    if (debugOverlay) {
      const showLabel = i18n.getLocalizer('videoStats.show');
      const hideLabel = i18n.getLocalizer('videoStats.hide');
      const updateLabel = () => {
        this.toggleButton.setText(debugOverlay.isShown() ? hideLabel : showLabel);
      };
      this.debugOverlayLabelHandler = updateLabel;
      this.toggleButton.onClick.subscribe(() => {
        debugOverlay.toggleHidden();
        updateLabel();
        this.hide();
      });
      debugOverlay.onShow.subscribe(updateLabel);
      debugOverlay.onHide.subscribe(updateLabel);
      updateLabel();
    } else {
      this.toggleButton.getDomElement().css('display', 'none');
    }
  }

  release(): void {
    if (this.uiContainerElement && this.uiContextMenuHandler) {
      this.uiContainerElement.removeEventListener('contextmenu', this.uiContextMenuHandler);
    }
    if (this.documentKeyDownHandler) {
      document.removeEventListener('keydown', this.documentKeyDownHandler);
    }
    if (this.documentScrollDismissHandler) {
      document.removeEventListener('wheel', this.documentScrollDismissHandler, {
        capture: true,
      } as EventListenerOptions);
      document.removeEventListener('touchmove', this.documentScrollDismissHandler, {
        capture: true,
      } as EventListenerOptions);
    }
    const debugOverlay = this.config.debugInfoOverlay;
    if (debugOverlay && this.debugOverlayLabelHandler) {
      debugOverlay.onShow.unsubscribe(this.debugOverlayLabelHandler);
      debugOverlay.onHide.unsubscribe(this.debugOverlayLabelHandler);
    }
    this.uiContextMenuHandler = null;
    this.documentKeyDownHandler = null;
    this.documentScrollDismissHandler = null;
    this.debugOverlayLabelHandler = null;
    this.uiContainerElement = null;
    this.playerContainerElement = null;
    super.release();
  }

  /**
   * Returns a `SettingsPanelItem` that opens this context menu centered over the player.
   * Use this on layouts where right-click isn't available (touch / TV remote / set-top
   * box / game console) so the same actions can be reached via the settings panel.
   *
   * The item closes `parentSettingsPanel` before showing the menu.
   */
  public createSettingsPanelOpenerItem(
    parentSettingsPanel: SettingsPanel<SettingsPanelConfig>,
  ): SettingsPanelItem<SettingsPanelItemConfig> {
    const label = new Label<LabelConfig>({ text: i18n.getLocalizer('settings.playerInfo') });
    const item = new SettingsPanelItem({
      label,
      isSetting: false,
      cssClasses: ['player-info-item'],
      ariaLabel: i18n.getLocalizer('settings.playerInfo'),
      role: 'menuitem',
      tabIndex: 0,
    });
    const openMenu = () => {
      parentSettingsPanel.hide();
      this.showCentered();
    };
    const itemEl = item.getDomElement();
    itemEl.css('cursor', 'pointer');
    itemEl.on('click', openMenu);
    itemEl.on('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openMenu();
      }
    });
    return item;
  }

  /**
   * Opens the context menu centered over the player. Provided so platforms without a
   * `contextmenu` event (touch devices, TV remotes, set-top boxes, game consoles) can
   * reach the same actions via an alternative trigger (e.g. a settings-panel button).
   */
  public showCentered(): void {
    // Use the player container (always laid out) rather than the UI container (which can
    // be hidden by the auto-hide controls timer, returning a 0×0 rect when measured).
    const anchor = this.playerContainerElement ?? this.uiContainerElement;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const rootEl = this.getDomElement().get(0) as HTMLElement;
    const x = rect.left + rect.width / 2 - rootEl.offsetWidth / 2;
    const y = rect.top + rect.height / 2 - rootEl.offsetHeight / 2;
    this.showAt(x, y);
  }

  private showAt(clientX: number, clientY: number): void {
    const el = this.getDomElement();
    const rootEl = el.get(0) as HTMLElement;

    // The element is still laid out while hidden (visibility: hidden, not display: none),
    // so offsetWidth/Height return the real dimensions.
    const { offsetWidth, offsetHeight } = rootEl;
    const maxX = Math.max(0, window.innerWidth - offsetWidth - 4);
    const maxY = Math.max(0, window.innerHeight - offsetHeight - 4);

    el.css({
      left: `${Math.max(0, Math.min(clientX, maxX))}px`,
      top: `${Math.max(0, Math.min(clientY, maxY))}px`,
    });

    this.show();
  }
}

/**
 * Builds a structured snapshot of the current playback state for the "Copy debug info"
 * action. Captures everything a Bitmovin support engineer would normally have to ask the
 * user to gather manually — player + UI version, source URL, current quality, buffer
 * levels, dropped frames, current time, page URL, user agent.
 */
function buildDebugInfo(player: PlayerAPI): Record<string, unknown> {
  // Only the playback/downloaded-data getters can throw (on muxed HLS or before a source
  // is loaded). Everything else is contractually safe per the PlayerAPI surface.
  const videoQuality = tryGet(() => player.getPlaybackVideoData());
  const audioQuality = tryGet(() => player.getPlaybackAudioData());
  const downloadedVideo = tryGet(() => player.getDownloadedVideoData());
  const downloadedAudio = tryGet(() => player.getDownloadedAudioData());
  const source = player.getSource() as
    | {
        dash?: string;
        hls?: string;
        smooth?: string;
        progressive?: string | { url: string }[];
        drm?: Record<string, unknown>;
      }
    | undefined;
  return {
    timestamp: new Date().toISOString(),
    pageUrl: window.location.href,
    userAgent: navigator.userAgent,
    player: {
      version: player.version,
      type: player.getPlayerType(),
      streamType: player.getStreamType(),
      isLive: player.isLive(),
    },
    ui: { version: UI_VERSION },
    source: source
      ? {
          dash: source.dash,
          hls: source.hls,
          smooth: source.smooth,
          progressive: source.progressive,
          drm: source.drm ? Object.keys(source.drm) : undefined,
        }
      : null,
    playback: {
      currentTime: player.getCurrentTime(),
      duration: player.getDuration(),
      timeShift: player.getTimeShift(),
      maxTimeShift: player.getMaxTimeShift(),
      speed: player.getPlaybackSpeed(),
      videoBuffer: player.getVideoBufferLength(),
      audioBuffer: player.getAudioBufferLength(),
      droppedFrames: player.getDroppedVideoFrames(),
    },
    quality: videoQuality
      ? {
          id: videoQuality.id,
          width: videoQuality.width,
          height: videoQuality.height,
          frameRate: (videoQuality as { frameRate?: number }).frameRate,
          bitrate: videoQuality.bitrate,
          codec: videoQuality.codec,
          downloadedBitrate: downloadedVideo?.bitrate,
        }
      : null,
    audio: audioQuality
      ? { bitrate: audioQuality.bitrate, codec: audioQuality.codec, downloadedBitrate: downloadedAudio?.bitrate }
      : null,
    counts: {
      videoQualities: player.getAvailableVideoQualities()?.length,
      audioTracks: player.getAvailableAudio()?.length,
    },
    availableCodecs: {
      video: Array.from(
        new Set(
          player
            .getAvailableVideoQualities()
            .map(q => q.codec)
            .filter(Boolean),
        ),
      ),
      audio: collectAvailableAudioCodecs(player),
    },
  };
}

function collectAvailableAudioCodecs(player: PlayerAPI): string[] {
  // `getAvailableAudioQualities` isn't part of the public PlayerAPI surface on every
  // build, so feature-detect rather than assume.
  const getAudioQualities = (
    player as PlayerAPI & {
      getAvailableAudioQualities?: () => Array<{ codec?: string }>;
    }
  ).getAvailableAudioQualities;
  if (!getAudioQualities) return [];
  const qualities: Array<{ codec?: string }> = getAudioQualities.call(player) ?? [];
  const codecs = qualities.map(q => q.codec).filter((c): c is string => Boolean(c));
  return Array.from(new Set(codecs));
}

function tryGet<T>(fn: () => T): T | undefined {
  try {
    return fn();
  } catch {
    return undefined;
  }
}

export function copyToClipboard(text: string): void {
  // The Clipboard API rejects in insecure contexts, when the document isn't focused, or
  // when permission is denied. Catch the rejection and fall back to the textarea path so
  // copy still works on http://, in iframes that lose focus, and on older WebKit / TV
  // browsers that don't expose the API.
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => copyViaTextarea(text));
    return;
  }
  copyViaTextarea(text);
}

function copyViaTextarea(text: string): void {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
}

// Strip non-serializable values (DOM nodes, functions) so JSON.stringify doesn't throw on
// player config objects that may hold element references.
export function jsonReplacer(_key: string, value: unknown): unknown {
  if (typeof value === 'function') return undefined;
  if (value instanceof Node) return `[${(value as Node).nodeName}]`;
  return value;
}
