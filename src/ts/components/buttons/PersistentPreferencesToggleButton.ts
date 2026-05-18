import { ToggleButton, ToggleButtonConfig } from './ToggleButton';
import { UIInstanceManager } from '../../UIManager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';
import { UIPreferences } from '../../utils/UIPreferences';

/**
 * A toggle that lets the end-user opt in to having their volume, mute and playback
 * speed remembered across sessions. Only meaningful when the integrator has enabled
 * `UIConfig.enablePersistentPreferences` — otherwise no surrounding UI persists state.
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

    if (UIPreferences.isEnabled()) {
      this.on();
    }

    this.onClick.subscribe(() => {
      this.toggle();
    });

    this.onToggleOn.subscribe(() => {
      UIPreferences.setEnabled(player, true);
    });

    this.onToggleOff.subscribe(() => {
      UIPreferences.setEnabled(player, false);
    });
  }
}
