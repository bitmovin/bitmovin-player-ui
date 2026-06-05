import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../../UIManager';
import { Event, EventDispatcher, NoArgs } from '../../EventDispatcher';
import { LocalizableText } from '../../localization/i18n';
import { getKeyMapForPlatform } from '../../spatialnavigation/getKeyMapForPlatform';
import { Action } from '../../spatialnavigation/types';
import { Container, ContainerConfig } from '../Container';
import { Label, LabelConfig } from '../labels/Label';
import type { ContextMenu, ContextMenuConfig } from './ContextMenu';

/**
 * Configuration interface for a generic {@link ContextMenuItem}.
 *
 * @category Configs
 */
export interface ContextMenuItemConfig extends ContainerConfig {
  /**
   * Optional text label for simple menu action rows.
   */
  text?: LocalizableText;

  /**
   * Whether the item should emit click events.
   * Default: true
   */
  interactive?: boolean;

  /**
   * Whether the containing context menu should close after this item emits an action.
   * Default: false
   */
  closeContextMenuOnAction?: boolean;
}

/**
 * A generic action item for use inside a {@link ContextMenu}.
 *
 * @category Components
 */
export class ContextMenuItem<Config extends ContextMenuItemConfig = ContextMenuItemConfig> extends Container<Config> {
  private readonly textLabel: Label<LabelConfig> | null;
  private contextMenu: ContextMenu<ContextMenuConfig> | null = null;
  private readonly contextMenuItemEvents = {
    onClick: new EventDispatcher<ContextMenuItem<Config>, NoArgs>(),
  };

  constructor(config: Config = {} as Config) {
    const components = config.components ? [...config.components] : [];
    const cssClasses = config.cssClasses ? [...config.cssClasses] : [];
    const textLabel =
      config.text != null
        ? new Label<LabelConfig>({
            text: config.text,
          })
        : null;

    if (textLabel) {
      components.unshift(textLabel);
    }

    if (config.interactive === false) {
      cssClasses.push('ui-context-menu-item-noninteractive');
    }

    const itemConfig = {
      ...config,
      cssClasses,
      components,
    };

    super(itemConfig);

    this.textLabel = textLabel;

    this.config = this.mergeConfig(
      itemConfig,
      {
        cssClass: 'ui-context-menu-item',
        role: 'menuitem',
        tabIndex: 0,
        interactive: true,
        closeContextMenuOnAction: false,
        ariaLabel: config.ariaLabel ?? config.text,
      } as Config,
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    if (!this.config.interactive) {
      return;
    }

    const handleClickEvent = (event: UIEvent) => {
      event.preventDefault();
      event.stopPropagation();
      this.closeContextMenuForAction();
      this.onClickEvent();
    };

    this.getDomElement().on('click', handleClickEvent);

    // Listen to keyboard events and trigger the click event when a select key is detected
    const handleKeyDown = (event: KeyboardEvent) => {
      const action = getKeyMapForPlatform()[event.keyCode];
      const acceptedKeys = ['Enter', ' '];
      const acceptedCodes = ['Enter', 'Space'];

      if (action === Action.SELECT || acceptedKeys.includes(event.key) || acceptedCodes.includes(event.code)) {
        handleClickEvent(event);
      }
    };

    this.onFocusedChanged.subscribe((_, args) => {
      if (args.focused) {
        // Only listen to keyboard events when the element is focused
        this.getDomElement().on('keydown', handleKeyDown);
      } else {
        // Unregister the keyboard event listener when the element loses focus
        this.getDomElement().off('keydown', handleKeyDown);
      }
    });
  }

  setText(text: LocalizableText): void {
    this.config.text = text;
    this.textLabel?.setText(text);
  }

  setContextMenu(contextMenu: ContextMenu<ContextMenuConfig> | null): void {
    this.contextMenu = contextMenu;
  }

  protected getContextMenu(): ContextMenu<ContextMenuConfig> | null {
    return this.contextMenu;
  }

  protected onLanguageChanged(): void {
    if (typeof this.config.text === 'function') {
      this.setText(this.config.text);
    }
  }

  protected onClickEvent(): void {
    this.contextMenuItemEvents.onClick.dispatch(this);
  }

  private closeContextMenuForAction(): void {
    if (this.config.closeContextMenuOnAction) {
      this.contextMenu?.hide();
    }
  }

  get onClick(): Event<ContextMenuItem<Config>, NoArgs> {
    return this.contextMenuItemEvents.onClick.getEvent();
  }
}
