import { Container, ContainerConfig } from '../Container';
import { Component, ComponentConfig } from '../Component';
import { Event, EventDispatcher, NoArgs } from '../../EventDispatcher';
import { Label, LabelConfig, LabelStyle } from '../labels/Label';
import { UIInstanceManager, UIManager } from '../../UIManager';
import { SelectBox } from './SelectBox';
import { VideoQualitySelectBox } from './VideoQualitySelectBox';
import { AudioQualitySelectBox } from './AudioQualitySelectBox';
import { PlaybackSpeedSelectBox } from './PlaybackSpeedSelectBox';
import { PlayerAPI } from 'bitmovin-player';
import { i18n, LocalizableText } from '../../localization/i18n';
import { ListSelector } from '../lists/ListSelector';

/**
 * Configuration interface for a {@link SettingsPanelItem}
 *
 * @category Configs
 */
export interface SettingsPanelItemConfig extends ContainerConfig {
  /**
   * The label component or the text for the label.
   */
  label?: LocalizableText | Component<ComponentConfig>;
  /**
   * The style of the label in case config.label is not a component already.
   * Default: {@link LabelStyle.Text}
   */
  labelStyle?: LabelStyle;
  /**
   * The component that configures a setting.
   */
  settingComponent?: Component<ComponentConfig>;
  /**
   * If the setting should be added as a component to this item.
   */
  addSettingAsComponent?: boolean;
  /**
   * Indicates if the SettingsPanelItem is representing an actual setting or if it just a label. E.g. when used
   * as a title.
   */
  isSetting?: boolean;
}

/**
 * An item for a {@link SettingsPanelPage},
 * Containing an optional {@link Label} and a component that configures a setting.
 * If the components is a {@link SelectBox} it will handle the logic of displaying it or not
 *
 * @category Components
 */
export class SettingsPanelItem<Config extends SettingsPanelItemConfig> extends Container<Config> {
  private label: Component<ComponentConfig>;
  protected settingComponent: Component<ComponentConfig> | null;

  private settingsPanelItemEvents = {
    onActiveChanged: new EventDispatcher<SettingsPanelItem<Config>, NoArgs>(),
  };

  constructor(config: SettingsPanelItemConfig);
  constructor(config: Config) {
    super(config);

    this.settingComponent = config.settingComponent;

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-settings-panel-item',
        role: 'menuitem',
        addSettingAsComponent: true,
        isSetting: true,
        labelStyle: LabelStyle.Text,
      } as Config,
      this.config,
    );

    const label = config.label;
    if (label !== null) {
      if (label instanceof Component) {
        this.label = label;
      } else {
        this.label = new Label({ text: label, labelStyle: config.labelStyle } as LabelConfig);
      }

      this.addComponent(this.label);
    }
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    if (this.settingComponent != null && this.config.addSettingAsComponent) {
      this.addComponent(this.settingComponent);
      this.updateComponents();
    }

    if (this.settingComponent instanceof ListSelector) {
      const handleConfigItemChanged = () => {
        if (!(this.settingComponent instanceof ListSelector)) {
          return;
        }
        // The minimum number of items that must be available for the setting to be displayed
        // By default, at least two items must be available, else a selection is not possible
        let minItemsToDisplay = 2;
        // Audio/video quality select boxes contain an additional 'auto' mode, which in combination with a single
        // available quality also does not make sense
        if (
          (this.settingComponent instanceof VideoQualitySelectBox && this.settingComponent.hasAutoItem()) ||
          this.settingComponent instanceof AudioQualitySelectBox
        ) {
          minItemsToDisplay = 3;
        }

        if (this.settingComponent.itemCount() < minItemsToDisplay) {
          // Hide the setting if no meaningful choice is available
          this.hide();
        } else if (
          this.settingComponent instanceof PlaybackSpeedSelectBox &&
          !uimanager.getConfig().playbackSpeedSelectionEnabled
        ) {
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

      this.settingComponent.onItemAdded.subscribe(handleConfigItemChanged);
      this.settingComponent.onItemRemoved.subscribe(handleConfigItemChanged);

      // Initialize hidden state
      handleConfigItemChanged();

      i18n.getConfig().events.onLanguageChanged.subscribe(() => {
        if (this.label instanceof Label && typeof this.config.label === 'function') {
          this.label.setText(this.config.label);
        }
      });
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
   * @returns {Event<SettingsPanelItem, NoArgs>}
   */
  get onActiveChanged(): Event<SettingsPanelItem<Config>, NoArgs> {
    return this.settingsPanelItemEvents.onActiveChanged.getEvent();
  }
}
