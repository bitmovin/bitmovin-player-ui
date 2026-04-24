import { ListSelector, ListSelectorConfig } from './ListSelector';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../../UIManager';
import { SettingsPanel, SettingsPanelConfig } from '../settings/SettingsPanel';
import { SettingsPanelPage } from '../settings/SettingsPanelPage';
import { SettingsPanelSelectOption } from '../settings/SettingsPanelSelectOption';
import { SettingsPanelItem } from '../settings/SettingsPanelItem';
import { LocalizableText } from '../../localization/i18n';
import { Label, LabelStyle } from '../labels/Label';

export interface ListBoxConfig extends SettingsPanelConfig, ListSelectorConfig {
  /**
   * The list selector component which will be used to build the settings page.
   */
  listSelector: ListSelector<ListSelectorConfig>;
  /**
   * An optional title which will be added to the list.
   */
  title?: LocalizableText;
}

export class ListBox extends SettingsPanel<ListBoxConfig> {
  private readonly settingsPanelPage: SettingsPanelPage;
  private readonly listSelector: ListSelector<ListSelectorConfig>;

  constructor(config: ListBoxConfig) {
    super(config);

    this.settingsPanelPage = new SettingsPanelPage({});
    this.listSelector = config.listSelector;

    this.config = this.mergeConfig(
      config,
      {
        hidden: true,
        cssClasses: ['ui-listbox'],
      },
      this.config,
    );

    this.addComponent(this.settingsPanelPage);

    if (config.title) {
      const label = new Label({ text: config.title, cssClasses: ['title-label'] });
      this.settingsPanelPage.addComponent(
        new SettingsPanelItem({
          label: label,
          cssClasses: ['title-item'],
          isSetting: false,
        }),
      );
    }
  }

  public configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    const createSelectOption = (itemKey: string) => {
      const item = this.listSelector.getItemForKey(itemKey);

      if (!item) {
        return null;
      }

      const selectOption = new SettingsPanelSelectOption({
        label: item.label,
        labelStyle: LabelStyle.TextWithLeadingIcon,
        settingComponent: this.listSelector,
        settingsValue: item.key,
        addSettingAsComponent: false,
      });

      selectOption.configure(player, uimanager);

      return selectOption;
    };

    const rebuildItems = () => {
      const settingsPanelItems = this.settingsPanelPage
        .getComponents()
        .filter(component => component instanceof SettingsPanelSelectOption) as SettingsPanelItem<any>[];

      for (const settingsPanelItem of settingsPanelItems) {
        this.settingsPanelPage.removeSettingsPanelItem(settingsPanelItem);
      }

      for (const item of this.listSelector.getItems()) {
        const selectOption = createSelectOption(item.key);

        if (selectOption) {
          this.settingsPanelPage.addSettingsPanelItem(selectOption);
        }
      }

      this.onSettingsStateChangedEvent();
    };

    let rebuiltDuringListSelectorConfigure = false;
    const onItemsChanged = () => {
      rebuiltDuringListSelectorConfigure = true;
      rebuildItems();
    };

    this.listSelector.onItemsChanged.subscribe(onItemsChanged);

    this.settingsPanelPage.configure(player, uimanager);
    this.listSelector.configure(player, uimanager);

    // `listSelector.configure()` may synchronously emit `onItemsChanged`, so only run the fallback rebuild
    // when configuration did not already trigger one.
    if (!rebuiltDuringListSelectorConfigure) {
      rebuildItems();
    }
  }
}
