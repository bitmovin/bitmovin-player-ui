import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../../UIManager';
import { i18n } from '../../localization/i18n';
import { version as UI_VERSION_RAW } from '../../main';
import { Label, LabelConfig } from '../labels/Label';
import { SettingsPanel, SettingsPanelConfig } from './SettingsPanel';
import { SettingsPanelItem, SettingsPanelItemConfig } from './SettingsPanelItem';
import { SettingsPanelPage, SettingsPanelPageConfig } from './SettingsPanelPage';
import { SettingsPanelPageBackButton } from './SettingsPanelPageBackButton';

const UI_VERSION: string = UI_VERSION_RAW.replace(/^"|"$/g, '');

/**
 * Configuration interface for a {@link PlayerInfoSettingsPanelPage}.
 *
 * @category Configs
 */
export interface PlayerInfoSettingsPanelPageConfig extends SettingsPanelPageConfig {
  /**
   * Container `SettingsPanel` where the navigation takes place.
   */
  settingsPanel: SettingsPanel<SettingsPanelConfig>;
}

/**
 * A settings panel page with player and UI information.
 *
 * @category Components
 */
export class PlayerInfoSettingsPanelPage extends SettingsPanelPage {
  constructor(config: PlayerInfoSettingsPanelPageConfig) {
    const pageConfig = {
      ...config,
      components: [
        new SettingsPanelItem({
          label: new SettingsPanelPageBackButton({
            container: config.settingsPanel,
            text: i18n.getLocalizer('settings.more'),
          }),
          cssClasses: ['title-item'],
          isSetting: false,
        }),
        new PlayerInfoSettingsPanelItem(),
        ...(config.components ?? []),
      ],
    };

    super(pageConfig);

    this.config = this.mergeConfig(
      pageConfig,
      {
        cssClass: 'ui-player-info-settings-panel-page',
      },
      this.config,
    );
  }
}

class PlayerInfoSettingsPanelItem extends SettingsPanelItem<SettingsPanelItemConfig> {
  private readonly playerVersionLabel: Label<LabelConfig>;

  constructor() {
    const playerVersionLabel = new Label<LabelConfig>({
      text: 'Player: -',
      cssClasses: ['ui-player-info-settings-panel-page-info'],
    });

    super({
      label: null,
      components: [
        new Label<LabelConfig>({
          text: i18n.getLocalizer('contextMenu.title'),
          cssClasses: ['ui-player-info-settings-panel-page-title'],
        }),
        new Label<LabelConfig>({
          text: i18n.getLocalizer('contextMenu.subtitle'),
          cssClasses: ['ui-player-info-settings-panel-page-subtitle'],
        }),
        playerVersionLabel,
        new Label<LabelConfig>({
          text: `UI: ${UI_VERSION}`,
          cssClasses: ['ui-player-info-settings-panel-page-info'],
        }),
      ],
      cssClasses: ['ui-player-info-settings-panel-item'],
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
