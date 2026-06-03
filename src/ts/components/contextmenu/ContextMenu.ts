import { SettingsPanel, SettingsPanelConfig } from '../settings/SettingsPanel';
import { UIInstanceManager } from '../../UIManager';
import { PlayerAPI } from 'bitmovin-player';

/**
 * Configuration interface for a generic {@link ContextMenu}.
 *
 * @category Configs
 */
export interface ContextMenuConfig extends SettingsPanelConfig {}

/**
 * A floating context menu shown at the pointer position when the user opens the
 * browser context menu inside the player UI.
 *
 * @category Components
 */
export class ContextMenu<Config extends ContextMenuConfig = ContextMenuConfig> extends SettingsPanel<Config> {
  constructor(config: Config = {} as Config) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-context-menu',
        hideDelay: -1,
        hidden: true,
        role: 'menu',
      } as Config,
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    const uiContainer = uimanager.getUI();

    this.onHide.subscribe(() => {
      const contextMenuElement = this.getDomElement();

      contextMenuElement.waitForTransitionEnd('opacity').then(() => {
        if (this.isHidden()) {
          contextMenuElement.remove();
        }
      });
    });

    const documentContextMenuHandler = (event: MouseEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      if (this.isShown()) {
        if (!this.isEventTargetInsideContextMenu(event)) {
          this.hideAndReset();
        }
        // Let the browser handle a second contextmenu event while the custom menu is open,
        // so users can still access native actions like Inspect Element.
        return;
      }

      if (!this.isEventTargetInsideElement(event, uiContainer.getDomElement().get(0))) {
        return;
      }

      event.preventDefault();
      this.showAt(event.clientX, event.clientY);
    };

    const documentKeyDownHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.isShown()) {
        this.hideAndReset();
      }
    };

    const documentClickHandler = (event: MouseEvent) => {
      if (this.isShown() && !this.isEventTargetInsideContextMenu(event)) {
        this.hideAndReset();
      }
    };

    const attachDocumentHandlers = () => {
      document.addEventListener('contextmenu', documentContextMenuHandler);
      document.addEventListener('keydown', documentKeyDownHandler);
      document.addEventListener('click', documentClickHandler);
    };

    const detachDocumentHandlers = () => {
      document.removeEventListener('contextmenu', documentContextMenuHandler);
      document.removeEventListener('keydown', documentKeyDownHandler);
      document.removeEventListener('click', documentClickHandler);
    };

    const deactivateHandler = () => {
      detachDocumentHandlers();
      this.hideAndReset();
    };

    uimanager.onActive.subscribe(attachDocumentHandlers);
    uimanager.onInactive.subscribe(deactivateHandler);
    uimanager.onControlsHide.subscribe(() => this.hideAndReset());
  }

  release(): void {
    super.release();

    if (this.hasDomElement()) {
      this.getDomElement().remove();
    }
  }

  public showAt(clientX: number, clientY: number): void {
    const contextMenuElement = this.getDomElement();
    const contextMenuRootElement = contextMenuElement.get(0) as HTMLElement;
    this.attachContextMenuElement();

    // The element is still laid out while hidden (visibility: hidden, not display: none),
    // so offsetWidth/Height return the real dimensions.
    const { offsetWidth, offsetHeight } = contextMenuRootElement;
    const maxX = Math.max(0, window.innerWidth - offsetWidth - 4);
    const maxY = Math.max(0, window.innerHeight - offsetHeight - 4);
    const clampedX = Math.max(0, Math.min(clientX, maxX));
    const clampedY = Math.max(0, Math.min(clientY, maxY));

    contextMenuElement.css({
      left: `${clampedX + window.scrollX}px`,
      top: `${clampedY + window.scrollY}px`,
    });

    this.show();
  }

  private isEventTargetInsideContextMenu(event: MouseEvent): boolean {
    return this.isEventTargetInsideElement(event, this.getDomElement().get(0));
  }

  private isEventTargetInsideElement(event: MouseEvent, element: HTMLElement): boolean {
    return event.target instanceof Node && element.contains(event.target);
  }

  private attachContextMenuElement(): void {
    const rootElement = this.getDomElement().get(0) as HTMLElement;

    if (rootElement.parentElement === document.body) {
      return;
    }

    document.body.appendChild(rootElement);
  }
}
