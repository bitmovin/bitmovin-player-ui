import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../../UIManager';
import { LocalizableText } from '../../localization/i18n';
import { Label, LabelConfig, LabelStyle } from '../labels/Label';
import { SettingsPanel, SettingsPanelConfig } from './SettingsPanel';
import { SettingsPanelItemConfig } from './SettingsPanelItem';
import { SettingsPanelPage } from './SettingsPanelPage';
import { InteractiveSettingsPanelItem } from './InteractiveSettingsPanelItem';

/**
 * Configuration interface for a {@link SettingsPanelPageNavigationItem}.
 *
 * @category Configs
 */
export interface SettingsPanelPageNavigationItemConfig extends SettingsPanelItemConfig {
  /**
   * The label component or the text for the label.
   */
  label: LocalizableText;
  /**
   * Optional label shown at the end of the navigation row.
   */
  trailingLabel?: LocalizableText;
  /**
   * Container `SettingsPanel` where the navigation takes place.
   */
  container: SettingsPanel<SettingsPanelConfig>;
  /**
   * Page where this item should navigate to.
   */
  targetPage: SettingsPanelPage;
}

/**
 * A settings panel row that navigates to another {@link SettingsPanelPage}.
 *
 * @category Components
 */
export class SettingsPanelPageNavigationItem extends InteractiveSettingsPanelItem<SettingsPanelPageNavigationItemConfig> {
  constructor(config: SettingsPanelPageNavigationItemConfig) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-settings-panel-page-navigation-item',
        addSettingAsComponent: false,
        isSetting: true,
        role: 'menuitem',
        tabIndex: 0,
      } as SettingsPanelPageNavigationItemConfig,
      this.config,
    );

    this.addComponent(
      new Label<LabelConfig>({
        text: this.config.trailingLabel || '',
        cssClasses: ['ui-settings-panel-page-navigation-item-trailing-label'],
        labelStyle: LabelStyle.TextWithTrailingIcon,
      }),
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.getDomElement().attr('aria-haspopup', 'true');
    this.getDomElement().attr('aria-owns', this.config.targetPage.getConfig().id);

    this.onClick.subscribe(() => {
      this.config.container.setActivePage(this.config.targetPage);
    });
  }
}
