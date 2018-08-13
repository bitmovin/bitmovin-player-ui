import {Container, ContainerConfig} from './container';
import {SettingsPanel, SettingsPanelItem} from './settingspanel';
import {UIInstanceManager, UIManager} from '../uimanager';
import {Button, ButtonConfig} from './button';
import {Event, EventDispatcher, NoArgs} from '../eventdispatcher';

export class SettingsPanelPage extends Container<ContainerConfig> {

  private static readonly CLASS_LAST = 'last';

  private settingsPanelEvents = {
    onSettingsStateChanged: new EventDispatcher<SettingsPanel, NoArgs>(),
  };

  constructor(config: ContainerConfig) {
    super(config);

    this.config = this.mergeConfig<ContainerConfig>(config, {
      cssClass: 'ui-settings-panel-page',
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    // Fire event when the state of a settings-item has changed
    let settingsStateChangedHandler = () => {
      // this.onSettingsStateChangedEvent();

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
}

export interface SettingsPanelNavigatorConfig extends ButtonConfig {
  container: SettingsPanel;
  targetPage?: SettingsPanelPage;
}

export class SettingsPanelNavigatorButton extends Button<ButtonConfig> {
  private readonly container: SettingsPanel;
  private readonly targetPage?: SettingsPanelPage;

  constructor(config: SettingsPanelNavigatorConfig) {
    super(config);
    this.config = this.mergeConfig(config, {

    }, this.config);

    this.container = (this.config as SettingsPanelNavigatorConfig).container;
    this.targetPage = (this.config as SettingsPanelNavigatorConfig).targetPage;
  }

  // TODO: naming
  navigateToRoot() {
    this.container.popToRootSettingsPanelPage();
  }

  back() {
    this.container.popSettingsPanelPage();
  }

  navigateToTarget() {
    this.container.setActivePage(this.targetPage);
  }
}

export class SettingsPanelPageBackButton extends SettingsPanelNavigatorButton {

  constructor(config: SettingsPanelNavigatorConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-subtitlesettingsclosebutton',
      text: 'Back',
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onClick.subscribe(() => {
      this.back();
    });
  }
}

export class SubtitleSettingsPanelPageOpenButton extends SettingsPanelNavigatorButton {
  constructor(config: SettingsPanelNavigatorConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-subtitlesettingsopenbutton',
      text: 'Subtitles settings',
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onClick.subscribe(() => {
      this.navigateToTarget();
    });
  }
}