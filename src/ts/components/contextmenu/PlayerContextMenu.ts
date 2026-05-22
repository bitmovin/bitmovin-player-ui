import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';
import { version as UI_VERSION_RAW } from '../../main';
import { Label, LabelConfig } from '../labels/Label';
import { UIInstanceManager } from '../../UIManager';
import { ContextMenu, ContextMenuConfig } from './ContextMenu';

// `version` in `main.ts` carries the JSON-stringified package version (i.e. surrounded
// by quotes from the build-time replacement). Peel them off for display.
const UI_VERSION: string = UI_VERSION_RAW.replace(/^"|"$/g, '');

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
  private readonly playerVersionLabel: Label<LabelConfig>;

  constructor(config: PlayerContextMenuConfig = {}) {
    const playerVersionLabel = new Label<LabelConfig>({
      text: 'Player: -',
      cssClasses: ['ui-player-context-menu-info'],
    });

    super({
      ...config,
      cssClasses: ['ui-player-context-menu', ...(config.cssClasses ?? [])],
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
        ...(config.components ?? []),
      ],
    });

    this.playerVersionLabel = playerVersionLabel;
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.playerVersionLabel.setText(`Player: ${player.version}`);
  }
}
