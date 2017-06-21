import {ContainerConfig, Container} from './container';
import {ComponentConfig, Component} from './component';
import {SelectBox} from './selectbox';
import {Label, LabelConfig} from './label';
import {UIInstanceManager} from '../uimanager';
import {VideoQualitySelectBox} from './videoqualityselectbox';
import {AudioQualitySelectBox} from './audioqualityselectbox';
import {SubtitleSettingsOpener, SubtitlePanelCloser, SubtitleSettingLabel} from './subtitlesettingtoggle';
import {Timeout} from '../timeout';
import {Event, EventDispatcher, NoArgs} from '../eventdispatcher';
import {FontColorSelectBox} from './subtitlesettings/fontcolorselectbox';
import {SubtitleOverlay} from './subtitleoverlay';

/**
 * Configuration interface for a {@link SettingsPanel}.
 */
export interface SettingsPanelConfig extends ContainerConfig {
  /**
   * The delay in milliseconds after which the settings panel will be hidden when there is no user interaction.
   * Set to -1 to disable automatic hiding.
   * Default: 3 seconds (3000)
   */
  hideDelay?: number;
  defaultComponents?: Component<ComponentConfig>[];
  subtitlesComponents?: Component<ComponentConfig>[];
  subtitleOverlay?: SubtitleOverlay;
}

/**
 * A panel containing a list of {@link SettingsPanelItem items} that represent labelled settings.
 */
export class SettingsPanel extends Container<SettingsPanelConfig> {

  private static readonly CLASS_LAST = 'last';

  private settingsPanelEvents = {
    onSettingsStateChanged: new EventDispatcher<SettingsPanel, NoArgs>()
  };

  private hideTimeout: Timeout;

  constructor(config: SettingsPanelConfig) {
    super(config);

    this.config = this.mergeConfig<SettingsPanelConfig>(config, {
      cssClass: 'ui-settings-panel',
      hideDelay: 3000,
      defaultComponents: this.config.components,
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = <SettingsPanelConfig>this.getConfig(); // TODO fix generics type inference

    let updateLastItem = () => {
      // Attach marker class to last visible item
      let lastShownItem = null;
      for (let component of this.getItems()) {
        if ((component instanceof SettingsPanelItem)
            || (component instanceof SubtitleSettingsOpener)
            || (component instanceof SubtitlePanelCloser)) {
          component.getDomElement().removeClass(this.prefixCss(SettingsPanel.CLASS_LAST));
          if (component.isShown()) {
            lastShownItem = component;
          }
        }
      }
      if (lastShownItem) {
        lastShownItem.getDomElement().addClass(this.prefixCss(SettingsPanel.CLASS_LAST));
      }
    }

    this.onShow.subscribe(() => {
      config.components = config.defaultComponents
      this.updateComponents()
      updateLastItem()
    });

    if (config.hideDelay > -1) {
      this.hideTimeout = new Timeout(config.hideDelay, () => {
        this.hide();
      });

      this.onShow.subscribe(() => {
        // Activate timeout when shown
        this.hideTimeout.start();
      });
      this.getDomElement().on('mouseenter', () => {
        // On mouse enter clear the timeout
        this.hideTimeout.clear();
      });
      this.getDomElement().on('mouseleave', () => {
        // On mouse leave activate the timeout
        this.hideTimeout.reset();
      });
      this.onHide.subscribe(() => {
        // Clear timeout when hidden from outside
        this.hideTimeout.clear();
      });
    }

    this.onHide.subscribe(() => {
      if (config.subtitleOverlay) {
        config.subtitleOverlay.removeEnforcedSubtitleLabel();
      }
    });

    // Fire event when the state of a settings-item has changed
    let settingsStateChangedHandler = () => {
      this.onSettingsStateChangedEvent();
      updateLastItem()
    };
    let openSubtitleSettings = () => {
      config.components = config.subtitlesComponents
      config.subtitleOverlay.enforceSubtitleLabel()
      this.updateComponents()
      updateLastItem()
    }
    let closeSubtitleSettings = () => {
      config.components = config.defaultComponents
      config.subtitleOverlay.removeEnforcedSubtitleLabel()
      this.updateComponents()
      updateLastItem()
    }
    for (let component of this.getItems()) {
      if (component instanceof SettingsPanelItem) {
        component.onActiveChanged.subscribe(settingsStateChangedHandler);
      }
    }
  }

  release(): void {
    super.release();
    if (this.hideTimeout) {
      this.hideTimeout.clear();
    }
  }


  /**
   * Adds a child component to the container.
   * It will be present both in default component and subtitles related components
   * @param component the component to add
   */
  addComponent(component: Component<ComponentConfig>) {
    let config = <SettingsPanelConfig>this.getConfig(); // TODO fix generics type inference
    config.components.push(component)
    config.defaultComponents.push(component)
  };

  /**
   * Adds a child component to the container.
   * It will be present both in default component and subtitles related components
   * @param component the component to add
   */
  addGlobalComponent(component: Component<ComponentConfig>) {
    let config = <SettingsPanelConfig>this.getConfig(); // TODO fix generics type inference
    config.components.push(component)
    config.defaultComponents.push(component)
    config.subtitlesComponents.push(component)
  };
  /**
   * Checks if there are active settings within this settings panel. An active setting is a setting that is visible
   * and enabled, which the user can interact with.
   * @returns {boolean} true if there are active settings, false if the panel is functionally empty to a user
   */
  hasActiveSettings(): boolean {
    for (let component of this.getItems()) {
      if (component.isActive()) {
        return true;
      }
    }

    return false;
  }

  private getItems(): SettingsPanelItem[] {
    return <SettingsPanelItem[]>this.config.components;
  }

  protected onSettingsStateChangedEvent() {
    this.settingsPanelEvents.onSettingsStateChanged.dispatch(this);
  }

  /**
   * Gets the event that is fired when one or more {@link SettingsPanelItem items} have changed state.
   * @returns {Event<SettingsPanel, NoArgs>}
   */
  get onSettingsStateChanged(): Event<SettingsPanel, NoArgs> {
    return this.settingsPanelEvents.onSettingsStateChanged.getEvent();
  }
}

/**
 * An item for a {@link SettingsPanel}, containing a {@link Label} and a component that configures a setting.
 * Supported setting components: {@link SelectBox}
 */
export class SettingsPanelItem extends Container<ContainerConfig> {

  protected label: Component<ComponentConfig>;
  protected setting: SelectBox;

  private settingsPanelItemEvents = {
    onActiveChanged: new EventDispatcher<SettingsPanelItem, NoArgs>(),
  };

  constructor(label: string | Component<ComponentConfig>, selectBox: SelectBox, config: ContainerConfig = {}) {
    super(config);

    if (label instanceof Component) {
      this.label = label
    } else {
      this.label = new Label({ text: label });
    }
    this.setting = selectBox;

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-settings-panel-item',
      components: [this.label, this.setting]
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    let handleConfigItemChanged = () => {
      // The minimum number of items that must be available for the setting to be displayed
      // By default, at least two items must be available, else a selection is not possible
      let minItemsToDisplay = 2;
      // Audio/video quality select boxes contain an additional 'auto' mode, which in combination with a single
      // available quality also does not make sense
      if (this.setting instanceof VideoQualitySelectBox || this.setting instanceof AudioQualitySelectBox) {
        minItemsToDisplay = 3;
      }

      // Hide the setting if no meaningful choice is available
      if (this.setting.itemCount() < minItemsToDisplay) {
        this.hide();
      } else {
        this.show();
      }

      // Visibility might have changed and therefore the active state might have changed so we fire the event
      // TODO fire only when state has really changed (e.g. check if visibility has really changed)
      this.onActiveChangedEvent();
    };

    if (this.setting instanceof SelectBox) {
      this.setting.onItemAdded.subscribe(handleConfigItemChanged);
      this.setting.onItemRemoved.subscribe(handleConfigItemChanged);
    }

    // Initialize hidden state
    handleConfigItemChanged();
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
