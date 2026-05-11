import { Container, ContainerConfig } from './Container';
import { DOM } from '../DOM';
import { UIInstanceManager } from '../UIManager';
import { PlayerAPI } from 'bitmovin-player';
import { DebugInfoOverlay } from './overlays/DebugInfoOverlay';
import { i18n } from '../localization/i18n';

const UI_VERSION: string = '{{VERSION}}';

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
  private playerVersionElement: DOM;
  private toggleButtonElement: DOM;
  private copySourceButtonElement: DOM;
  private copyConfigButtonElement: DOM;

  private uiContextMenuHandler: ((e: MouseEvent) => void) | null = null;
  private documentMouseDownHandler: ((e: MouseEvent) => void) | null = null;
  private documentContextMenuHandler: ((e: MouseEvent) => void) | null = null;
  private documentKeyDownHandler: ((e: KeyboardEvent) => void) | null = null;
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
      } as PlayerContextMenuConfig,
      this.config,
    );
  }

  protected toDomElement(): DOM {
    const element = super.toDomElement();

    const header = new DOM('div', {
      class: this.prefixCss('ui-player-context-menu-header'),
    }).html(i18n.performLocalization(i18n.getLocalizer('contextMenu.title')));

    const subtitle = new DOM('div', {
      class: this.prefixCss('ui-player-context-menu-subtitle'),
    }).html(i18n.performLocalization(i18n.getLocalizer('contextMenu.subtitle')));

    this.playerVersionElement = new DOM('div', {
      class: this.prefixCss('ui-player-context-menu-info'),
    }).html('Player: –');

    const uiVersionElement = new DOM('div', {
      class: this.prefixCss('ui-player-context-menu-info'),
    }).html(`UI: ${UI_VERSION}`);

    const link = new DOM('a', {
      class: this.prefixCss('ui-player-context-menu-link'),
      href: 'https://bitmovin.com',
      target: '_blank',
      rel: 'noopener noreferrer',
    }).html(i18n.performLocalization(i18n.getLocalizer('contextMenu.about')));
    link.on('click', (e: MouseEvent) => e.stopPropagation());

    const separator = new DOM('div', {
      class: this.prefixCss('ui-player-context-menu-separator'),
    });

    this.toggleButtonElement = new DOM('button', {
      type: 'button',
      class: this.prefixCss('ui-player-context-menu-button'),
    }).html(i18n.performLocalization(i18n.getLocalizer('videoStats.show')));

    this.copySourceButtonElement = new DOM('button', {
      type: 'button',
      class: this.prefixCss('ui-player-context-menu-button'),
    }).html(i18n.performLocalization(i18n.getLocalizer('contextMenu.copySource')));

    this.copyConfigButtonElement = new DOM('button', {
      type: 'button',
      class: this.prefixCss('ui-player-context-menu-button'),
    }).html(i18n.performLocalization(i18n.getLocalizer('contextMenu.copyConfig')));

    element.append(header);
    element.append(subtitle);
    element.append(this.playerVersionElement);
    element.append(uiVersionElement);
    element.append(link);
    element.append(separator);
    element.append(this.toggleButtonElement);
    element.append(this.copySourceButtonElement);
    element.append(this.copyConfigButtonElement);

    return element;
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

    const dismissIfOutside = (e: MouseEvent) => {
      if (!this.isShown()) return;
      if (rootEl.contains(e.target as Node)) return;
      this.hide();
    };
    this.documentMouseDownHandler = dismissIfOutside;
    this.documentContextMenuHandler = dismissIfOutside;
    this.documentKeyDownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isShown()) this.hide();
    };
    document.addEventListener('mousedown', this.documentMouseDownHandler, true);
    document.addEventListener('contextmenu', this.documentContextMenuHandler, true);
    document.addEventListener('keydown', this.documentKeyDownHandler);

    const copiedLabel = i18n.getLocalizer('contextMenu.copied');
    const sourceLabel = i18n.getLocalizer('contextMenu.copySource');
    const configLabel = i18n.getLocalizer('contextMenu.copyConfig');
    const wireCopyButton = (button: DOM, label: ReturnType<typeof i18n.getLocalizer>, getValue: () => unknown) => {
      button.on('click', (e: MouseEvent) => {
        e.stopPropagation();
        copyToClipboard(JSON.stringify(getValue() ?? null, jsonReplacer, 2));
        button.html(i18n.performLocalization(copiedLabel));
        window.setTimeout(() => button.html(i18n.performLocalization(label)), 1200);
      });
    };
    wireCopyButton(this.copySourceButtonElement, sourceLabel, () => player.getSource());
    wireCopyButton(this.copyConfigButtonElement, configLabel, () => player.getConfig());

    const debugOverlay = this.config.debugInfoOverlay;
    if (debugOverlay) {
      const showLabel = i18n.getLocalizer('videoStats.show');
      const hideLabel = i18n.getLocalizer('videoStats.hide');
      const updateLabel = () => {
        const localizer = debugOverlay.isShown() ? hideLabel : showLabel;
        this.toggleButtonElement.html(i18n.performLocalization(localizer));
      };
      this.debugOverlayLabelHandler = updateLabel;
      this.toggleButtonElement.on('click', (e: MouseEvent) => {
        e.stopPropagation();
        debugOverlay.toggleHidden();
        updateLabel();
        this.hide();
      });
      debugOverlay.onShow.subscribe(updateLabel);
      debugOverlay.onHide.subscribe(updateLabel);
      updateLabel();
    } else {
      this.toggleButtonElement.css('display', 'none');
    }
  }

  release(): void {
    if (this.uiContainerElement && this.uiContextMenuHandler) {
      this.uiContainerElement.removeEventListener('contextmenu', this.uiContextMenuHandler);
    }
    if (this.documentMouseDownHandler) {
      document.removeEventListener('mousedown', this.documentMouseDownHandler, true);
    }
    if (this.documentContextMenuHandler) {
      document.removeEventListener('contextmenu', this.documentContextMenuHandler, true);
    }
    if (this.documentKeyDownHandler) {
      document.removeEventListener('keydown', this.documentKeyDownHandler);
    }
    const debugOverlay = this.config.debugInfoOverlay;
    if (debugOverlay && this.debugOverlayLabelHandler) {
      debugOverlay.onShow.unsubscribe(this.debugOverlayLabelHandler);
      debugOverlay.onHide.unsubscribe(this.debugOverlayLabelHandler);
    }
    // If the menu was ever shown it lives on <body> now (not in the UI tree the
    // UIManager owns), so the framework's tree teardown won't clean it up.
    const rootEl = this.hasDomElement() ? (this.getDomElement().get(0) as HTMLElement) : null;
    if (rootEl && rootEl.parentElement === document.body) {
      document.body.removeChild(rootEl);
    }
    this.uiContextMenuHandler = null;
    this.documentMouseDownHandler = null;
    this.documentContextMenuHandler = null;
    this.documentKeyDownHandler = null;
    this.debugOverlayLabelHandler = null;
    this.uiContainerElement = null;
    this.playerContainerElement = null;
    super.release();
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
    // Pre-measure the menu so we can center it on the player rather than have its
    // top-left at the player center.
    if (rootEl.parentElement && rootEl.parentElement !== document.body) {
      document.body.appendChild(rootEl);
    }
    const x = rect.left + rect.width / 2 - rootEl.offsetWidth / 2;
    const y = rect.top + rect.height / 2 - rootEl.offsetHeight / 2;
    this.showAt(x, y);
  }

  private showAt(clientX: number, clientY: number): void {
    const el = this.getDomElement();
    const rootEl = el.get(0) as HTMLElement;

    if (rootEl.parentElement && rootEl.parentElement !== document.body) {
      document.body.appendChild(rootEl);
    }

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
