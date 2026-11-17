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

    this.config = this.mergeConfig(
      config,
      {
        cssClasses: ['ui-settings-panel-item-select-option'],
        role: 'menuitemradio',
        tabIndex: 0,
      } as SettingsPanelSelectOptionConfig,
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager) {
    super.configure(player, uimanager);

    const handleSelectedOptionChanged = () => {
      const isSelected = this.settingsValue === this.settingComponent.getSelectedItem();

      if (isSelected) {
        this.getDomElement().addClass(this.prefixCss('selected'));
      } else {
        this.getDomElement().removeClass(this.prefixCss('selected'));
      }
      // Expose the selected state to assistive technologies, not only through the CSS class / checkmark
      this.getDomElement().attr('aria-checked', isSelected ? 'true' : 'false');
    };
    this.settingComponent.onItemSelected.subscribe(handleSelectedOptionChanged);

    this.onClick.subscribe(() => {
      this.settingComponent.dispatchItemSelectionChanged(this.settingsValue);
    });

    // Initial state
    handleSelectedOptionChanged();
  }

  protected opensSubMenu(): boolean {
    // An option selects a value of the setting, it does not open the list of options again
    return false;
  }
}
