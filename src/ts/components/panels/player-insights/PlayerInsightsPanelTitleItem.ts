import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../../../UIManager';
import { i18n } from '../../../localization/i18n';
import { Button, ButtonConfig } from '../../buttons/Button';
import { Label, LabelConfig } from '../../labels/Label';
import { SettingsPanelItem, SettingsPanelItemConfig } from '../../settings/SettingsPanelItem';

interface PlayerInsightsPanelTitleTarget {
  hide(): void;
}

export class PlayerInsightsPanelTitleItem extends SettingsPanelItem<SettingsPanelItemConfig> {
  private readonly closeButton: Button<ButtonConfig>;
  private target: PlayerInsightsPanelTitleTarget | null = null;

  constructor() {
    const titleLabel = new Label<LabelConfig>({
      text: i18n.getLocalizer('playerInsights.title'),
      cssClasses: ['ui-player-insights-panel-title-label'],
    });
    const closeButton = new Button<ButtonConfig>({
      cssClass: 'ui-closebutton',
      cssClasses: ['ui-player-insights-panel-close-button'],
      text: i18n.getLocalizer('close'),
    });

    super({
      label: null,
      components: [titleLabel, closeButton],
      cssClasses: ['title-item', 'ui-player-insights-panel-title-item'],
      isSetting: false,
      role: 'group',
      tabIndex: -1,
    });

    this.closeButton = closeButton;
  }

  setTarget(target: PlayerInsightsPanelTitleTarget): void {
    this.target = target;
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.closeButton.onClick.subscribe(() => {
      this.target?.hide();
    });
  }
}
