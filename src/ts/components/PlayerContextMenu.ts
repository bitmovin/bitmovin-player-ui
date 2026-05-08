import { Container, ContainerConfig } from './Container';
import { DOM } from '../DOM';
import { UIInstanceManager } from '../UIManager';
import { PlayerAPI } from 'bitmovin-player';
import { DebugInfoOverlay } from './overlays/DebugInfoOverlay';

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
    }).html('Bitmovin Player');

    const subtitle = new DOM('div', {
      class: this.prefixCss('ui-player-context-menu-subtitle'),
    }).html('Adaptive Streaming for the Web');

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
    }).html('About Bitmovin →');
    link.on('click', (e: MouseEvent) => e.stopPropagation());

    const separator = new DOM('div', {
      class: this.prefixCss('ui-player-context-menu-separator'),
    });

    this.toggleButtonElement = new DOM('button', {
      type: 'button',
      class: this.prefixCss('ui-player-context-menu-button'),
    }).html('Show video stats');

    element.append(header);
    element.append(subtitle);
    element.append(this.playerVersionElement);
    element.append(uiVersionElement);
    element.append(link);
    element.append(separator);
    element.append(this.toggleButtonElement);

    return element;
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    const playerVersion = (player as unknown as { version?: string }).version || '?';
    this.playerVersionElement.html(`Player: ${playerVersion}`);

    const uiContainerDom = uimanager.getUI().getDomElement();
    const rootEl = this.getDomElement().get(0) as HTMLElement;

    uiContainerDom.on('contextmenu', (e: MouseEvent) => {
      e.preventDefault();
      this.showAt(e.clientX, e.clientY);
    });

    const handleOutsideClick = (e: MouseEvent) => {
      if (!this.isShown()) return;
      if (rootEl.contains(e.target as Node)) return;
      this.hide();
    };

    document.addEventListener('mousedown', handleOutsideClick, true);
    document.addEventListener('contextmenu', handleOutsideClick, true);
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isShown()) {
        this.hide();
      }
    });

    const debugOverlay = this.config.debugInfoOverlay;
    if (debugOverlay) {
      const updateLabel = () => {
        this.toggleButtonElement.html(debugOverlay.isShown() ? 'Hide video stats' : 'Show video stats');
      };
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

  private showAt(clientX: number, clientY: number): void {
    const el = this.getDomElement();
    const rootEl = el.get(0) as HTMLElement;

    // Reparent to body so the menu can extend past any clipping ancestor
    if (rootEl.parentElement && rootEl.parentElement !== document.body) {
      document.body.appendChild(rootEl);
    }

    // The element is still laid out while hidden (visibility: hidden, not display: none),
    // so offsetWidth/Height return the real dimensions.
    const { offsetWidth, offsetHeight } = rootEl;
    const maxX = Math.max(0, window.innerWidth - offsetWidth - 4);
    const maxY = Math.max(0, window.innerHeight - offsetHeight - 4);

    el.css({
      left: `${Math.min(clientX, maxX)}px`,
      top: `${Math.min(clientY, maxY)}px`,
    });

    this.show();
  }
}
