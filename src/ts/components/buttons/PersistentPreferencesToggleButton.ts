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

    this.config = this.mergeConfig(
      config,
      {
        text: i18n.getLocalizer('persistentPreferences'),
        cssClass: 'ui-persistentpreferencestogglebutton',
        ariaLabel: i18n.getLocalizer('persistentPreferences'),
      },
      this.config,
    );
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
