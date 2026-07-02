import { Container, ContainerConfig } from '../Container';

/**
 * Configuration interface for a {@link SettingsPanelSeparator}.
 *
 * @category Configs
 */
export interface SettingsPanelSeparatorConfig extends ContainerConfig {}

/**
 * A visual separator between groups of settings panel rows.
 *
 * @category Components
 */
export class SettingsPanelSeparator extends Container<SettingsPanelSeparatorConfig> {
  constructor(config: SettingsPanelSeparatorConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-settings-panel-separator',
        role: 'separator',
      },
      this.config,
    );
  }
}
