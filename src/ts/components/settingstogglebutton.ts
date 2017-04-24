import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {SettingsPanel} from './settingspanel';
import {UIInstanceManager} from '../uimanager';

/**
 * Configuration interface for the {@link SettingsToggleButton}.
 */
export interface SettingsToggleButtonConfig extends ToggleButtonConfig {
  /**
   * The settings panel whose visibility the button should toggle.
   */
  settingsPanel: SettingsPanel;

  /**
   * Decides if the button should be automatically hidden when the settings panel does not contain any active settings.
   * Default: true
   */
  autoHideWhenNoActiveSettings?: boolean;
}

/**
 * A button that toggles visibility of a settings panel.
 */
export class SettingsToggleButton extends ToggleButton<SettingsToggleButtonConfig> {

  constructor(config: SettingsToggleButtonConfig) {
    super(config);

    if (!config.settingsPanel) {
      throw new Error('Required SettingsPanel is missing');
    }

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-settingstogglebutton',
      text: 'Settings',
      settingsPanel: null,
      autoHideWhenNoActiveSettings: true
    }, <SettingsToggleButtonConfig>this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = <SettingsToggleButtonConfig>this.getConfig(); // TODO fix generics type inference
    let settingsPanel = config.settingsPanel;

    this.onClick.subscribe(() => {
      settingsPanel.toggleHidden();
    });
    settingsPanel.onShow.subscribe(() => {
      // Set toggle status to on when the settings panel shows
      this.on();
    });
    settingsPanel.onHide.subscribe(() => {
      // Set toggle status to off when the settings panel hides
      this.off();
    });

    // Handle automatic hiding of the button if there are no settings for the user to interact with
    if (config.autoHideWhenNoActiveSettings) {
      // Setup handler to show/hide button when the settings change
      let settingsPanelItemsChangedHandler = () => {
        if (settingsPanel.hasActiveSettings()) {
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