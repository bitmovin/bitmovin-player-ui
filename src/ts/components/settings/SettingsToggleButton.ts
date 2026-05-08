import { ToggleButton, ToggleButtonConfig } from '../buttons/ToggleButton';
import { SettingsPanel, SettingsPanelConfig } from './SettingsPanel';
import { UIInstanceManager } from '../../UIManager';
import { Component, ComponentConfig } from '../Component';
import { ArrayUtils } from '../../utils/ArrayUtils';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';

/**
 * Configuration interface for the {@link SettingsToggleButton}.
 *
 * @category Configs
 */
export interface SettingsToggleButtonConfig extends ToggleButtonConfig {
  /**
   * The settings panel whose visibility the button should toggle.
   */
  settingsPanel: SettingsPanel<SettingsPanelConfig>;

  /**
   * Decides if the button should be automatically hidden when the settings panel does not contain any active settings.
   * Default: true
   */
  autoHideWhenNoActiveSettings?: boolean;
}

/**
 * A button that toggles visibility of a settings panel.
 *
 * @category Buttons
 */
export class SettingsToggleButton extends ToggleButton<SettingsToggleButtonConfig> {
  private visibleSettingsPanels: SettingsPanel<SettingsPanelConfig>[] = [];

  constructor(config: SettingsToggleButtonConfig) {
    super(config);

    if (!config.settingsPanel) {
      throw new Error('Required SettingsPanel is missing');
    }

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-settingstogglebutton',
        text: i18n.getLocalizer('settings'),
        settingsPanel: null,
        autoHideWhenNoActiveSettings: true,
      },
      <SettingsToggleButtonConfig>this.config,
    );

    // The element is a native <button>; inherits role=button implicitly.
    // aria-haspopup="menu" advertises that activation reveals a menu, and aria-controls /
    // aria-owns points consumers (screen readers) at the controlled panel id.
    const settingsPanelId = config.settingsPanel.getActivePage().getConfig().id;
    this.getDomElement().attr('aria-haspopup', 'menu');
    this.getDomElement().attr('aria-controls', settingsPanelId);
    this.getDomElement().attr('aria-owns', settingsPanelId);
    this.getDomElement().attr('aria-expanded', 'false');
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    const config = this.getConfig();
    const settingsPanel = config.settingsPanel;

    this.onClick.subscribe(() => {
      // only hide other `SettingsPanel`s if a new one will be opened
      if (!settingsPanel.isShown()) {
        // Hide all open SettingsPanels before opening this button's panel
        // (We need to iterate a copy because hiding them will automatically remove themselves from the array
        // due to the subscribeOnce above)
        this.visibleSettingsPanels.slice().forEach(settingsPanel => settingsPanel.hide());
      }
      settingsPanel.toggleHidden();
    });
    settingsPanel.onShow.subscribe(() => {
      // Set toggle status to on when the settings panel shows
      this.on();
      this.getDomElement().attr('aria-expanded', 'true');
    });
    settingsPanel.onHide.subscribe(() => {
      // Set toggle status to off when the settings panel hides
      this.off();
      this.getDomElement().attr('aria-expanded', 'false');
    });

    // Ensure that only one `SettingPanel` is visible at once
    // Keep track of shown SettingsPanels
    uimanager.onComponentShow.subscribe((sender: Component<ComponentConfig>) => {
      if (sender instanceof SettingsPanel) {
        this.visibleSettingsPanels.push(sender);
        sender.onHide.subscribeOnce(() => ArrayUtils.remove(this.visibleSettingsPanels, sender));
      }
    });

    // Handle automatic hiding of the button if there are no settings for the user to interact with
    if (config.autoHideWhenNoActiveSettings) {
      // Setup handler to show/hide button when the settings change
      const settingsPanelItemsChangedHandler = () => {
        if (settingsPanel.rootPageHasActiveSettings()) {
          if (this.isHidden()) {
            this.show();
          }
        } else {
          if (this.isShown()) {
            this.hide();
          }
        }
      };
      // Wire the handler to the event
      settingsPanel.onSettingsStateChanged.subscribe(settingsPanelItemsChangedHandler);
      // Call handler for first init at startup
      settingsPanelItemsChangedHandler();
    }
  }
}
