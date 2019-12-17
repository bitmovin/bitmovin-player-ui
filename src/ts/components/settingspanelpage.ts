import {Container, ContainerConfig} from './container';
import {SettingsPanelItem} from './settingspanelitem';
import {UIInstanceManager} from '../uimanager';
import {Event, EventDispatcher, NoArgs} from '../eventdispatcher';
import { PlayerAPI } from 'bitmovin-player';
import { BrowserUtils } from '../browserutils';

/**
 * A panel containing a list of {@link SettingsPanelItem items} that represent labelled settings.
 */
export class SettingsPanelPage extends Container<ContainerConfig> {

  private static readonly CLASS_LAST = 'last';

  private settingsPanelPageEvents = {
    onSettingsStateChanged: new EventDispatcher<SettingsPanelPage, NoArgs>(),
    onActive: new EventDispatcher<SettingsPanelPage, NoArgs>(),
    onInactive: new EventDispatcher<SettingsPanelPage, NoArgs>(),
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
        component.getDomElement().removeClass(this.prefixCss(SettingsPanelPage.CLASS_LAST));
        if (component.isShown()) {
          lastShownItem = component;
        }
      }
      if (lastShownItem) {
        lastShownItem.getDomElement().addClass(this.prefixCss(SettingsPanelPage.CLASS_LAST));
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

  getItems(): SettingsPanelItem[] {
    return <SettingsPanelItem[]>this.config.components.filter(component => component instanceof SettingsPanelItem);
  }

  onSettingsStateChangedEvent() {
    this.settingsPanelPageEvents.onSettingsStateChanged.dispatch(this);
  }

  get onSettingsStateChanged(): Event<SettingsPanelPage, NoArgs> {
    return this.settingsPanelPageEvents.onSettingsStateChanged.getEvent();
  }

  onActiveEvent() {
    const activeItems = this.getItems().filter((item) => item.isActive());

    this.settingsPanelPageEvents.onActive.dispatch(this);
    // Disable focus for iOS and iPadOS 13 because it opens a select input
    if (activeItems.length > 0 && !BrowserUtils.isIOS && !(BrowserUtils.isMacIntel && BrowserUtils.isTouchSupported)) {
      activeItems[0].getDomElement().focusToFirstInput();
    }
  }

  get onActive(): Event<SettingsPanelPage, NoArgs> {
    return this.settingsPanelPageEvents.onActive.getEvent();
  }

  onInactiveEvent() {
    this.settingsPanelPageEvents.onInactive.dispatch(this);
  }

  get onInactive(): Event<SettingsPanelPage, NoArgs> {
    return this.settingsPanelPageEvents.onInactive.getEvent();
  }
}
