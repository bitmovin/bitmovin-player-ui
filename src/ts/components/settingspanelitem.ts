import {Container, ContainerConfig} from './container';
import {Component, ComponentConfig} from './component';
import {Event, EventDispatcher, NoArgs} from '../eventdispatcher';
import {Label} from './label';
import {UIInstanceManager} from '../uimanager';
import {SelectBox} from './selectbox';
import {ListBox} from './listbox';
import {VideoQualitySelectBox} from './videoqualityselectbox';
import {AudioQualitySelectBox} from './audioqualityselectbox';
import {PlaybackSpeedSelectBox} from './playbackspeedselectbox';

/**
 * An item for a {@link SettingsPanelPage},
 * Containing an optional {@link Label} and a component that configures a setting.
 * If the components is a {@link SelectBox} it will handle the logic of displaying it or not
 */
export class SettingsPanelItem extends Container<ContainerConfig> {

  private label: Component<ComponentConfig>;
  private setting: Component<ComponentConfig>;

  private settingsPanelItemEvents = {
    onActiveChanged: new EventDispatcher<SettingsPanelItem, NoArgs>(),
  };

  constructor(label: string | Component<ComponentConfig>, setting: Component<ComponentConfig>, config: ContainerConfig = {}) {
    super(config);

    this.setting = setting;

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-settings-panel-item',
    }, this.config);

    if (label !== null) {
      if (label instanceof Component) {
        this.label = label;
      } else {
        this.label = new Label({text: label});
      }
      this.addComponent(this.label);
    }

    this.addComponent(this.setting);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    if (this.setting instanceof SelectBox || this.setting instanceof ListBox) {
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
      };

      this.setting.onItemAdded.subscribe(handleConfigItemChanged);
      this.setting.onItemRemoved.subscribe(handleConfigItemChanged);

      // Initialize hidden state
      handleConfigItemChanged();
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
  get onActiveChanged(): Event<SettingsPanelItem, NoArgs> {
    return this.settingsPanelItemEvents.onActiveChanged.getEvent();
  }
}
