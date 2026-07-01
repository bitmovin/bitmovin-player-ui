import { LocalizableText } from '../../../localization/i18n';
import { Label, LabelConfig } from '../../labels/Label';
import { SettingsPanelItem, SettingsPanelItemConfig } from '../../settings/SettingsPanelItem';

export interface PlayerInsightsPanelItemConfig extends SettingsPanelItemConfig {
  leadingLabel: LocalizableText;
}

export class PlayerInsightsPanelItem extends SettingsPanelItem<PlayerInsightsPanelItemConfig> {
  private readonly trailingLabel: Label<LabelConfig>;

  constructor(config: PlayerInsightsPanelItemConfig) {
    super(config);

    const leadingLabel = new Label<LabelConfig>({
      text: config.leadingLabel,
      cssClasses: ['ui-player-insights-panel-item-leading-label'],
    });
    const trailingLabel = new Label<LabelConfig>({
      text: '-',
      cssClasses: ['ui-player-insights-panel-item-trailing-label'],
    });

    this.config = this.mergeConfig(
      config,
      {
        cssClasses: ['ui-player-insights-panel-item'],
        isSetting: false,
        role: 'group',
        tabIndex: -1,
      },
      this.config,
    );

    this.trailingLabel = trailingLabel;
    this.addComponent(leadingLabel);
    this.addComponent(trailingLabel);
  }

  setTrailingLabel(text: LocalizableText): void {
    this.trailingLabel.setText(text);
  }
}
