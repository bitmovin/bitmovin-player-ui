import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';
import { version as UI_VERSION } from '../../main';
import { Label, LabelConfig } from '../labels/Label';
import { UIInstanceManager } from '../../UIManager';
import { ContextMenu, ContextMenuConfig } from './ContextMenu';
import { SettingsPanelItem, SettingsPanelItemConfig } from '../settings/SettingsPanelItem';
import { SettingsPanelPage } from '../settings/SettingsPanelPage';

/**
 * Configuration interface for the {@link PlayerContextMenu}.
 *
 * @category Configs
 */
export interface PlayerContextMenuConfig extends ContextMenuConfig {}

/**
 * A player-specific context menu with Bitmovin info and Player/UI versions.
 *
 * @category Components
 */
export class PlayerContextMenu extends ContextMenu<PlayerContextMenuConfig> {
  constructor(config: PlayerContextMenuConfig = {}) {
    super({
      ...config,
      cssClasses: ['ui-player-context-menu', ...(config.cssClasses ?? [])],
      components: [
        new SettingsPanelPage({
          components: [new PlayerInfoContextMenuItem(), ...(config.components ?? [])],
        }),
      ],
    });
  }
}

class PlayerInfoContextMenuItem extends SettingsPanelItem<SettingsPanelItemConfig> {
  private readonly playerVersionLabel: Label<LabelConfig>;

  constructor() {
    const playerVersionLabel = new Label<LabelConfig>({
      text: 'Player: -',
      cssClasses: ['ui-player-context-menu-info'],
    });

    super({
      label: null,
      components: [
        new Label<LabelConfig>({
          text: i18n.getLocalizer('contextMenu.title'),
          cssClasses: ['ui-player-context-menu-header'],
        }),
        new Label<LabelConfig>({
          text: i18n.getLocalizer('contextMenu.subtitle'),
          cssClasses: ['ui-player-context-menu-subtitle'],
        }),
        playerVersionLabel,
        new Label<LabelConfig>({
          text: `UI: ${UI_VERSION}`,
          cssClasses: ['ui-player-context-menu-info'],
        }),
      ],
      cssClasses: ['ui-player-context-menu-info-item'],
      isSetting: false,
      role: 'group',
    });

    this.playerVersionLabel = playerVersionLabel;
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.playerVersionLabel.setText(`Player: ${player.version}`);
  }
}
