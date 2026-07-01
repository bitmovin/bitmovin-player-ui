import { InteractiveSettingsPanelItem } from '../settings/InteractiveSettingsPanelItem';
import { SettingsPanelItemConfig } from '../settings/SettingsPanelItem';
import type { ContextMenu, ContextMenuConfig } from './ContextMenu';

/**
 * Configuration interface for a generic {@link InteractiveContextMenuItem}.
 *
 * @category Configs
 */
export interface InteractiveContextMenuItemConfig extends SettingsPanelItemConfig {
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
export class InteractiveContextMenuItem<
  Config extends InteractiveContextMenuItemConfig,
> extends InteractiveSettingsPanelItem<Config> {
  private contextMenu: ContextMenu<ContextMenuConfig> | null = null;

  constructor(config: Config) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-interactive-context-menu-item',
        role: 'menuitem',
        tabIndex: 0,
        closeContextMenuOnAction: false,
        addSettingAsComponent: false,
        isSetting: false,
      } as Config,
      this.config,
    );
  }

  setContextMenu(contextMenu: ContextMenu<ContextMenuConfig> | null): void {
    this.contextMenu = contextMenu;
  }

  protected onClickEvent(): void {
    this.closeContextMenuForAction();
    super.onClickEvent();
  }

  private closeContextMenuForAction(): void {
    if (this.config.closeContextMenuOnAction) {
      this.contextMenu?.hide();
    }
  }
}
