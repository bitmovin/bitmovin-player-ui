import {Container, ContainerConfig} from './container';
import {Component, ComponentConfig} from './component';
import {Event as EDEvent, EventDispatcher, NoArgs} from '../eventdispatcher';
import { Label, LabelConfig } from './label';
import {UIInstanceManager} from '../uimanager';
import {SelectBox} from './selectbox';
import {ListBox} from './listbox';
import {VideoQualitySelectBox} from './videoqualityselectbox';
import {AudioQualitySelectBox} from './audioqualityselectbox';
import {PlaybackSpeedSelectBox} from './playbackspeedselectbox';
import { PlayerAPI } from 'bitmovin-player';
import { LocalizableText } from '../localization/i18n';
import { ModernSettingsPanelPage } from './modernsettingspanelpage';
import { ListSelector, ListSelectorConfig } from './listselector';

/**
 * An item for a {@link ModernSettingsPanelPage},
 * Containing an optional {@link Label} and a component that configures a setting.
 * If the components is a {@link SelectBox} it will handle the logic of displaying it or not
 */
export class ModernSettingsPanelItem extends Container<ContainerConfig> {

  private label: Component<ComponentConfig>;
  /**
   * If setting is null, that means that the item is not an option and does not
   * have a submenu. So if setting is null we can assume that the item should be
   * used as a back button
   */
  private setting: Component<ComponentConfig>;
  /**
   * True if the key argument is not null. In context that means, that
   * the item does not have a submenu, but is the option itself
   * Default: false
   */
  private selectedOptionLabel: Label<LabelConfig>;
  private isOption: Boolean;
  private key: string;

  private player: PlayerAPI;
  private uimanager: UIInstanceManager;

  private settingsPanelItemEvents = {
    onActiveChanged: new EventDispatcher<ModernSettingsPanelItem, NoArgs>(),
    onRequestSubPage: new EventDispatcher<ModernSettingsPanelItem, ModernSettingsPanelPage>(),
    onRequestNavigateBack: new EventDispatcher<ModernSettingsPanelItem, NoArgs>(),
    onItemSelect: new EventDispatcher<ModernSettingsPanelItem, string>(),
  };

  constructor(label: LocalizableText | Component<ComponentConfig>, setting: Component<ComponentConfig>, key: string = null, config: ContainerConfig = {}) {
    super(config);

    this.isOption = Boolean(key);
    this.setting = setting;
    this.key = key;

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-settings-panel-item',
      role: 'menuitem',
    }, this.config);

    if (label !== null) {
      if (label instanceof Component) {
        this.label = label;
      } else {
        this.label = new Label({ text: label, for: this.getConfig().id } as LabelConfig);
      }
      this.addComponent(this.label);
    }
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    this.player = player;
    this.uimanager = uimanager;
    if(this.setting !== null) {
      this.setting.configure(this.player, this.uimanager);
    }
    if (!this.isOption && (this.setting instanceof SelectBox || this.setting instanceof ListBox)) {
      this.setting.onItemSelected.subscribe(() => {
        this.removeComponent(this.selectedOptionLabel);
        const setting = this.setting as ListSelector<ListSelectorConfig>;
        this.selectedOptionLabel = new Label({ text: setting.getItemForKey(setting.getSelectedItem()).label, for: this.getConfig().id } as LabelConfig);
        this.selectedOptionLabel.getDomElement().addClass(this.prefixCss('ui-label-setting-selected-option'));
        this.addComponent(this.selectedOptionLabel);
        this.updateComponents();
      });

      let handleConfigItemChanged = () => {        
        if (!(this.setting instanceof SelectBox) && !(this.setting instanceof ListBox)) {
          return;
        }
        // The minimum number of items that must be available for the setting to be displayed
        // By default, at least two items must be available, else a selection is not possible
        let minItemsToDisplay = 2;
        // Audio/video quality select boxes contain an additional 'auto' mode, which in combination with a single
        // available quality also does not make sense
        if ((this.setting instanceof VideoQualitySelectBox && this.setting.hasAutoItem())
          || this.setting instanceof AudioQualitySelectBox) {
          minItemsToDisplay = 3;
        }
        if (this.setting.itemCount() < minItemsToDisplay) {
          // Hide the setting if no meaningful choice is available
          this.hide();
        } else if (this.setting instanceof PlaybackSpeedSelectBox
          && !uimanager.getConfig().playbackSpeedSelectionEnabled) {
          // Hide the PlaybackSpeedSelectBox if disabled in config
          this.hide();
        } else {
          this.show();
        }

        // Visibility might have changed and therefore the active state might have changed so we fire the event
        // TODO fire only when state has really changed (e.g. check if visibility has really changed)
        this.onActiveChangedEvent();

        this.getDomElement().attr('aria-haspopup', 'true');
      };

      this.setting.onItemAdded.subscribe(() => {
        handleConfigItemChanged();
      });
      this.setting.onItemRemoved.subscribe(handleConfigItemChanged);

      // Initialize hidden state
      handleConfigItemChanged();
    } else if(this.isOption) {
      this.show();
      this.onActiveChangedEvent();
      this.label.getDomElement().addClass(this.prefixCss('option'));
    }

    const handleItemClick = (e: Event) => {
      if(this.setting !== null) {
        if(!this.isOption) {
          let page = this.getSubPage();
          this.settingsPanelItemEvents.onRequestSubPage.dispatch(this, page);
        }
        else {
          if(this.setting instanceof SelectBox || this.setting instanceof ListBox) {
            this.setting.selectItem(this.key);
            this.settingsPanelItemEvents.onItemSelect.dispatch(this, this.key);
            this.label.getDomElement().addClass(this.prefixCss("selected"));
          }
        }
      } else {
        this.settingsPanelItemEvents.onRequestNavigateBack.dispatch(this);
      }
    }
    const domElement = this.getDomElement();
    domElement.on('click', (e) => handleItemClick(e));
  }

  private getSubPage(): ModernSettingsPanelPage {
    if (this.setting instanceof SelectBox || this.setting instanceof ListBox) {
      let menuOptions = this.setting.getItems();
      let selectedItem = this.setting.getSelectedItem();
      let page = new ModernSettingsPanelPage({});
      let label = this.label instanceof Label ? new Label({ text: this.label.getConfig().text, for: page.getConfig().id } as LabelConfig) : new Label({ text: "Back", for: page.getConfig().id } as LabelConfig);
      label.getDomElement().addClass(this.prefixCss('heading'));
      let itemToAdd = new ModernSettingsPanelItem(label, null);
      itemToAdd.configure(this.player, this.uimanager);
      page.addComponent(itemToAdd);
      for(let option of menuOptions) {
        let itemToAdd = new ModernSettingsPanelItem(option.label, this.setting, option.key);
        itemToAdd.configure(this.player, this.uimanager);
        if(option.key === selectedItem) {
          itemToAdd.label.getDomElement().addClass(this.prefixCss("selected"));
        }
        page.addComponent(itemToAdd);
      }
      page.configure(this.player, this.uimanager);
      return page;
    }
  }

  /**
   * Checks if this settings panel item is active, i.e. visible and enabled and a user can interact with it.
   * @returns {boolean} true if the panel is active, else false
   */
  isActive(): boolean {
    return this.isShown();
  }

  protected onActiveChangedEvent() {
    this.settingsPanelItemEvents.onActiveChanged.dispatch(this);
  }

  /**
   * Gets the event that is fired when the 'active' state of this item changes.
   * @see #isActive
   * @returns {EDEvent<ModernSettingsPanelItem, NoArgs>}
   */
  get onActiveChanged(): EDEvent<ModernSettingsPanelItem, NoArgs> {
    return this.settingsPanelItemEvents.onActiveChanged.getEvent();
  }

  /**
   * Gets the event that is fired, when the SettingsPanelItem has been clicked
   * and wants to display its sub menu on the {@link ModernSettingsPanel} as a seperate {@link ModernSettingsPanelPage}
   */
  get getOnDisplaySubPage(): EDEvent<ModernSettingsPanelItem, NoArgs> {
    return this.settingsPanelItemEvents.onRequestSubPage.getEvent();
  }

  get getOnRequestNavigateBack(): EDEvent<ModernSettingsPanelItem, NoArgs> {
    return this.settingsPanelItemEvents.onRequestNavigateBack.getEvent();
  }

  get onItemSelect(): EDEvent<ModernSettingsPanelItem, string> {
    return this.settingsPanelItemEvents.onItemSelect.getEvent();
  }

  get lable(): Component<ComponentConfig> {
    return this.label;
  }
}
