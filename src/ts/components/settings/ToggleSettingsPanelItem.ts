import { PlayerAPI } from 'bitmovin-player';

import { UIInstanceManager } from '../../UIManager';
import { ToggleButton, ToggleButtonConfig } from '../buttons/ToggleButton';
import { InteractiveSettingsPanelItem } from './InteractiveSettingsPanelItem';
import { SettingsPanelItemConfig } from './SettingsPanelItem';

/**
 * Configuration interface for a {@link ToggleSettingsPanelItem}.
 *
 * @category Configs
 */
export interface ToggleSettingsPanelItemConfig extends SettingsPanelItemConfig {
  /**
   * The toggle button that will be toggled when this item is clicked.
   */
  settingComponent: ToggleButton<ToggleButtonConfig>;
}

/**
 * A settings panel item that toggles a {@link ToggleButton} when the row is clicked.
 *
 * @category Components
 */
export class ToggleSettingsPanelItem extends InteractiveSettingsPanelItem<ToggleSettingsPanelItemConfig> {
  protected settingComponent: ToggleButton<ToggleButtonConfig>;

  constructor(config: ToggleSettingsPanelItemConfig) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClasses: ['ui-toggle-settings-panel-item'],
        role: 'menuitemcheckbox',
        tabIndex: 0,
      } as ToggleSettingsPanelItemConfig,
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    // Keyboard, click, and accessibility semantics belong to the row. Disabling it on the ToggleButton explicitly.
    this.settingComponent.getDomElement().attr('tabindex', '-1');
    this.settingComponent.setAriaAttr('hidden', 'true');
    this.settingComponent.getDomElement().on(
      'click',
      event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.onClickEvent();
      },
      true,
    );

    this.onClick.subscribe(() => {
      if (!this.settingComponent.isDisabled()) {
        this.settingComponent.toggle();
      }
    });

    this.settingComponent.onToggle.subscribe(() => this.updateAriaChecked());
    this.updateAriaChecked();
  }

  private updateAriaChecked(): void {
    this.getDomElement().attr('aria-checked', this.settingComponent.isOn() ? 'true' : 'false');
  }
}
