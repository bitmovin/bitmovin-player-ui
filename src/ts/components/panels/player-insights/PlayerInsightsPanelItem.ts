import { LocalizableText } from '../../../localization/i18n';
import { Label, LabelConfig } from '../../labels/Label';
import { SettingsPanelItem, SettingsPanelItemConfig } from '../../settings/SettingsPanelItem';

export interface PlayerInsightsPanelItemConfig extends SettingsPanelItemConfig {
  leadingLabel: LocalizableText;
}

export class PlayerInsightsPanelItem extends SettingsPanelItem<PlayerInsightsPanelItemConfig> {
  private readonly trailingLabel: Label<LabelConfig>;

  constructor(config: PlayerInsightsPanelItemConfig) {
    const leadingLabel = new Label<LabelConfig>({
      text: config.leadingLabel,
      cssClasses: ['ui-player-insights-panel-item-leading-label'],
    });
    const trailingLabel = new Label<LabelConfig>({
      text: '-',
      cssClasses: ['ui-player-insights-panel-item-trailing-label'],
    });

    super({
      ...config,
      label: null,
      components: [leadingLabel, trailingLabel, ...(config.components ?? [])],
      cssClasses: ['ui-player-insights-panel-item', ...(config.cssClasses ?? [])],
      isSetting: false,
      role: 'group',
      tabIndex: -1,
    });

    this.trailingLabel = trailingLabel;
  }

  setTrailingLabel(text: LocalizableText): void {
    this.trailingLabel.setText(text);
  }
}
