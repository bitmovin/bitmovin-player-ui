import { ToggleButton, ToggleButtonConfig } from './ToggleButton';
import { UIInstanceManager } from '../../UIManager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';

/**
 * A toggle that lets the end-user opt in to having their volume, mute and playback
 * speed remembered across sessions. Reflects and drives the {@link UIPreferencesManager}
 * `enabled` state. Only added to the UI when the integrator sets
 * `UIConfig.showPersistentPreferencesToggle`.
 *
 * @category Buttons
 */
export class PersistentPreferencesToggleButton extends ToggleButton<ToggleButtonConfig> {
  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    const defaultConfig: ToggleButtonConfig = {
      text: i18n.getLocalizer('persistentPreferences'),
      cssClass: 'ui-persistentpreferencestogglebutton',
      onClass: 'on',
      offClass: 'off',
      ariaLabel: i18n.getLocalizer('persistentPreferences'),
    };

    this.config = this.mergeConfig(config, defaultConfig, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    const uiPreferencesManager = uimanager.getUIPreferencesManager();

    if (uiPreferencesManager.isEnabled()) {
      this.on();
    }

    this.onClick.subscribe(() => {
      this.toggle();
    });

    this.onToggleOn.subscribe(() => {
      uiPreferencesManager.setEnabled(true);
    });

    this.onToggleOff.subscribe(() => {
      uiPreferencesManager.setEnabled(false);
    });
  }
}
