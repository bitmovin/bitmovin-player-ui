import { SettingsPanelItemConfig } from './SettingsPanelItem';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../../UIManager';
import { ListSelector, ListSelectorConfig } from '../lists/ListSelector';
import { InteractiveSettingsPanelItem } from './InteractiveSettingsPanelItem';

/**
 * Configuration interface for a {@link SettingsPanelSelectOption}.
 *
 * @category Configs
 */
export interface SettingsPanelSelectOptionConfig extends SettingsPanelItemConfig {
  /**
   * The setting that will be changed when this option is clicked.
   */
  settingComponent: ListSelector<ListSelectorConfig>;
  /**
   * The value of the setting that will be selected when this option is clicked.
   */
  settingsValue: string | undefined;
}

/**
 * A custom select option for a {@link ListSelector} option.
 * Is used for building dynamic sub pages from a {@link DynamicSettingsPanelItem}.
 *
 * @category Components
 */
export class SettingsPanelSelectOption extends InteractiveSettingsPanelItem<SettingsPanelSelectOptionConfig> {
  private settingsValue: string | undefined;
  protected settingComponent: ListSelector<ListSelectorConfig>;

  constructor(config: SettingsPanelSelectOptionConfig) {
    super(config);

    this.settingsValue = config.settingsValue;

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-settings-panel-item-select-option'],
      role: 'menuitem',
      tabIndex: 0,
    } as SettingsPanelSelectOptionConfig, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager) {
    super.configure(player, uimanager);

    const handleSelectedOptionChanged = () => {
      let selectedItem = this.settingComponent.getSelectedItem();

      if (this.settingsValue === selectedItem) {
        this.getDomElement().addClass(this.prefixCss('selected'));
      } else {
        this.getDomElement().removeClass(this.prefixCss('selected'));
      }
    };
    this.settingComponent.onItemSelected.subscribe(handleSelectedOptionChanged);

    this.onClick.subscribe(() => {
      this.settingComponent.selectItem(this.settingsValue);
    });

    // Initial state
    handleSelectedOptionChanged();
  }
}
