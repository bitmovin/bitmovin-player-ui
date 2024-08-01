import {Container, ContainerConfig} from './container';
import {UIInstanceManager} from '../uimanager';
import {Event, EventDispatcher, NoArgs} from '../eventdispatcher';
import { PlayerAPI } from 'bitmovin-player';
import { BrowserUtils } from '../browserutils';
import { ModernSettingsPanelItem } from './modernsettingspanelitem';

/**
 * A panel containing a list of {@link ModernSettingsPanelItem items} that represent labelled settings.
 */
export class ModernSettingsPanelPage extends Container<ContainerConfig> {

  private static readonly CLASS_LAST = 'last';

  private settingsPanelPageEvents = {
    onSettingsStateChanged: new EventDispatcher<ModernSettingsPanelPage, NoArgs>(),
    onActive: new EventDispatcher<ModernSettingsPanelPage, NoArgs>(),
    onInactive: new EventDispatcher<ModernSettingsPanelPage, NoArgs>(),
  };

  constructor(config: ContainerConfig) {
    super(config);

    this.config = this.mergeConfig<ContainerConfig>(config, {
      cssClass: 'ui-settings-panel-page',
      role: 'menu',
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    // Fire event when the state of a settings-item has changed
    let settingsStateChangedHandler = () => {
      this.onSettingsStateChangedEvent();

      // Attach marker class to last visible item
      let lastShownItem = null;
      for (let component of this.getItems()) {
        component.getDomElement().removeClass(this.prefixCss(ModernSettingsPanelPage.CLASS_LAST));
        if (component.isShown()) {
          lastShownItem = component;
        }
      }
      if (lastShownItem) {
        lastShownItem.getDomElement().addClass(this.prefixCss(ModernSettingsPanelPage.CLASS_LAST));
      }
    };
    for (let component of this.getItems()) {
      component.onActiveChanged.subscribe(settingsStateChangedHandler);
    }
  }

  hasActiveSettings(): boolean {
    for (let component of this.getItems()) {
      if (component.isActive()) {
        return true;
      }
    }

    return false;
  }

  getItems(): ModernSettingsPanelItem[] {
    return <ModernSettingsPanelItem[]>this.config.components.filter(component => component instanceof ModernSettingsPanelItem);
  }

  onSettingsStateChangedEvent() {
    this.settingsPanelPageEvents.onSettingsStateChanged.dispatch(this);
  }

  get onSettingsStateChanged(): Event<ModernSettingsPanelPage, NoArgs> {
    return this.settingsPanelPageEvents.onSettingsStateChanged.getEvent();
  }

  onActiveEvent() {
    const activeItems = this.getItems().filter((item) => item.isActive());

    this.settingsPanelPageEvents.onActive.dispatch(this);
    // Disable focus for iOS and iPadOS 13. They open select boxes automatically on focus and we want to avoid that.
    if (activeItems.length > 0 && !BrowserUtils.isIOS && !(BrowserUtils.isMacIntel && BrowserUtils.isTouchSupported)) {
      activeItems[0].getDomElement().focusToFirstInput();
    }
  }

  get onActive(): Event<ModernSettingsPanelPage, NoArgs> {
    return this.settingsPanelPageEvents.onActive.getEvent();
  }

  onInactiveEvent() {
    this.settingsPanelPageEvents.onInactive.dispatch(this);
  }

  get onInactive(): Event<ModernSettingsPanelPage, NoArgs> {
    return this.settingsPanelPageEvents.onInactive.getEvent();
  }
}
