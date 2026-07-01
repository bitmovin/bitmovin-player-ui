import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';
import { version as UI_VERSION } from '../../version';
import { Label, LabelConfig } from '../labels/Label';
import { UIInstanceManager } from '../../UIManager';
import { ContextMenu, ContextMenuConfig } from './ContextMenu';
import { PlayerInsightsContextMenuItem } from '../panels/player-insights/PlayerInsightsContextMenuItem';
import type { PlayerInsightsPanel } from '../panels/player-insights/PlayerInsightsPanel';
import { SettingsPanelItem, SettingsPanelItemConfig } from '../settings/SettingsPanelItem';
import { SettingsPanelPage } from '../settings/SettingsPanelPage';
import { SettingsPanelSeparator } from '../settings/SettingsPanelSeparator';

/**
 * Configuration interface for the {@link PlayerContextMenu}.
 *
 * @category Configs
 */
export interface PlayerContextMenuConfig extends ContextMenuConfig {
  /**
   * The player insights panel to expose as a default context menu action.
   */
  playerInsightsPanel: PlayerInsightsPanel;
}

/**
 * A player-specific context menu with Bitmovin info and Player/UI versions.
 *
 * @category Components
 */
export class PlayerContextMenu extends ContextMenu<PlayerContextMenuConfig> {
  constructor(config: PlayerContextMenuConfig) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClasses: ['ui-player-context-menu'],
      },
      this.config,
    );

    this.addComponent(
      new SettingsPanelPage({
        components: [
          new PlayerInfoContextMenuItem(),
          new SettingsPanelSeparator(),
          new PlayerInsightsContextMenuItem({
            playerInsightsPanel: config.playerInsightsPanel,
          }),
        ],
      }),
    );
  }
}

class PlayerInfoContextMenuItem extends SettingsPanelItem<SettingsPanelItemConfig> {
  private readonly playerVersionLabel: Label<LabelConfig>;

  constructor(config: SettingsPanelItemConfig = {}) {
    super(config);

    const playerVersionLabel = new Label<LabelConfig>({
      text: 'Player: -',
      cssClasses: ['ui-player-context-menu-info'],
    });

    this.config = this.mergeConfig(
      config,
      {
        label: null,
        cssClasses: ['ui-player-context-menu-info-item'],
        isSetting: false,
        role: 'group',
        tabIndex: -1,
      },
      this.config,
    );

    this.playerVersionLabel = playerVersionLabel;
    this.addComponent(
      new Label<LabelConfig>({
        text: i18n.getLocalizer('contextMenu.title'),
        cssClasses: ['ui-player-context-menu-header'],
      }),
    );
    this.addComponent(
      new Label<LabelConfig>({
        text: i18n.getLocalizer('contextMenu.subtitle'),
        cssClasses: ['ui-player-context-menu-subtitle'],
      }),
    );
    this.addComponent(playerVersionLabel);
    this.addComponent(
      new Label<LabelConfig>({
        text: `UI: ${UI_VERSION}`,
        cssClasses: ['ui-player-context-menu-info'],
      }),
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.playerVersionLabel.setText(`Player: ${player.version}`);
  }
}
