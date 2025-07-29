import { Label, LabelConfig } from '../labels/Label';
import { UIInstanceManager } from '../../UIManager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n, LocalizableText } from '../../localization/i18n';
import { ListSelector, ListSelectorConfig } from '../lists/ListSelector';
import { SubtitleSelectBox } from './SubtitleSelectBox';
import { SettingsPanelItem, SettingsPanelItemConfig } from './SettingsPanelItem';
import { SettingsPanelSelectOption } from './SettingsPanelSelectOption';
import { SettingsPanelPage } from './SettingsPanelPage';
import { SettingsPanel, SettingsPanelConfig } from './SettingsPanel';
import { SettingsPanelPageBackButton } from './SettingsPanelPageBackButton';
import { SubtitleSettingSelectBox } from './subtitlesettings/SubtitleSettingSelectBox';
import { InteractiveSettingsPanelItem } from './InteractiveSettingsPanelItem';
import { Component, ComponentConfig } from '../Component';

/**
 * Configuration interface for a {@link DynamicSettingsPanelItem}.
 *
 * @category Configs
 */
export interface DynamicSettingsPanelItemConfig extends SettingsPanelItemConfig {
  /**
   * The label component or the text for the label.
   */
  label: LocalizableText;
  /**
   * Optional back navigation component to be displayed on the right side of the label.
   */
  backNavigationRightComponent?: Component<ComponentConfig>;
  /**
   * The list selector component which will be used to build the sub page.
   */
  settingComponent: ListSelector<ListSelectorConfig>;
  /**
   * The enclosing {@link SettingsPanel} where the sub page will be added.
   */
  container: SettingsPanel<SettingsPanelConfig>;
}

/**
 * A dynamic settings panel item which can build a sub page with the items of a {@link ListSelector}.
 * The page will be dynamically added and removed from the {@link SettingsPanel}.
 *
 * @category Components
 */
export class DynamicSettingsPanelItem extends InteractiveSettingsPanelItem<DynamicSettingsPanelItemConfig> {
  private selectedOptionLabel: Label<LabelConfig>;
  protected backNavigationRightComponent: Component<ComponentConfig>;
  protected settingComponent: ListSelector<ListSelectorConfig>;

  private player: PlayerAPI;
  private uimanager: UIInstanceManager;

  constructor(config: DynamicSettingsPanelItemConfig) {
    super(config);

    this.backNavigationRightComponent = config.backNavigationRightComponent;
    this.settingComponent = config.settingComponent;

    this.selectedOptionLabel = new Label({
      text: '-',
      for: this.getConfig().id,
      cssClasses: ['ui-label-setting-selected-option'],
    });

    this.config = this.mergeConfig(config, {
      components: [
        this.selectedOptionLabel,
      ],
      cssClass: 'ui-settings-panel-item',
      role: 'menuitem',
      addSettingAsComponent: false,
      tabIndex: 0,
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.player = player;
    this.uimanager = uimanager;

    if (this.backNavigationRightComponent != null) {
      this.backNavigationRightComponent.configure(this.player, this.uimanager);
    }

    if (this.settingComponent != null) {
      this.settingComponent.configure(this.player, this.uimanager);
    }

    const handleSelectedItemChanged = () => {
      let selectedItem = this.settingComponent.getItemForKey(this.settingComponent.getSelectedItem());
      if (selectedItem == null) {
        this.selectedOptionLabel.hide();
        return;
      }

      this.selectedOptionLabel.show();
      let selectedOptionLabelText = selectedItem.label;
      if (this.settingComponent instanceof SubtitleSelectBox) {
        let availableSettings = this.settingComponent.getItems().length;
        selectedOptionLabelText = i18n.performLocalization(selectedOptionLabelText) + ' (' + (availableSettings - 1) + ')';
      }
      this.selectedOptionLabel.setText(selectedOptionLabelText);
    };
    this.settingComponent.onItemSelected.subscribe(handleSelectedItemChanged);

    handleSelectedItemChanged();

    this.onClick.subscribe(() => {
      this.displayItemsSubPage();
    });
  }

  private buildSubPanelPage(): SettingsPanelPage {
    const menuOptions = this.settingComponent.getItems();
    const page = new SettingsPanelPage({ removeOnPop: true });

    const text = this.config.label;

    const backButton = new SettingsPanelPageBackButton({
      text: text,
      container: this.config.container,
    });
    backButton.configure(this.player, this.uimanager);
    const backSettingsPanelItem = new SettingsPanelItem({
      label: backButton,
      settingComponent: this.backNavigationRightComponent,
      cssClasses: ['title-item'],
      isSetting: false,
    });
    backSettingsPanelItem.configure(this.player, this.uimanager);

    page.addComponent(backSettingsPanelItem);

    menuOptions
      .map((option) => {
        return new SettingsPanelSelectOption({
          label: option.label,
          settingComponent: this.settingComponent,
          settingsValue: option.key,
          addSettingAsComponent: false,
        });
      })
      .forEach((selectOption) => {
        selectOption.configure(this.player, this.uimanager);
        page.addComponent(selectOption);
      });

    page.configure(this.player, this.uimanager);

    const setting = this.settingComponent;
    if (setting instanceof SubtitleSettingSelectBox) {
      // Keep the preview subtitle overlay visible when the sub-page is for a subtitle setting
      page.onActive.subscribe(() => setting.overlay.enablePreviewSubtitleLabel());
      page.onInactive.subscribe(() => setting.overlay.removePreviewSubtitleLabel());
    }

    return page;
  }

  public displayItemsSubPage(): void {
    let page = this.buildSubPanelPage();
    this.config.container.addPage(page);
    this.config.container.setActivePage(page);
  }
}
