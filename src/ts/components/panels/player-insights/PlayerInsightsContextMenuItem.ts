import type { PlayerAPI } from 'bitmovin-player';
import type { UIInstanceManager } from '../../../UIManager';
import { i18n } from '../../../localization/i18n';
import {
  InteractiveContextMenuItem,
  InteractiveContextMenuItemConfig,
} from '../../contextmenu/InteractiveContextMenuItem';
import { Label, LabelConfig } from '../../labels/Label';
import type { PlayerInsightsPanel } from './PlayerInsightsPanel';

/**
 * Configuration interface for a {@link PlayerInsightsContextMenuItem}.
 *
 * @category Configs
 */
export interface PlayerInsightsContextMenuItemConfig extends InteractiveContextMenuItemConfig {
  /**
   * The {@link PlayerInsightsPanel} whose visibility the item should toggle.
   */
  playerInsightsPanel: PlayerInsightsPanel;
}

/**
 * A context menu item that toggles a {@link PlayerInsightsPanel}.
 *
 * @category Components
 */
export class PlayerInsightsContextMenuItem extends InteractiveContextMenuItem<PlayerInsightsContextMenuItemConfig> {
  private readonly itemLabel: Label<LabelConfig>;
  private readonly playerInsightsPanel: PlayerInsightsPanel;

  constructor(config: PlayerInsightsContextMenuItemConfig) {
    const itemLabel = new Label<LabelConfig>({
      text: i18n.getLocalizer('playerInsights.show'),
    });

    super({
      ...config,
      label: itemLabel,
      ariaLabel: i18n.getLocalizer('playerInsights.show'),
      closeContextMenuOnAction: true,
    });

    this.itemLabel = itemLabel;
    this.playerInsightsPanel = config.playerInsightsPanel;
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    const updateText = () => {
      const text = this.playerInsightsPanel.isShown()
        ? i18n.getLocalizer('playerInsights.hide')
        : i18n.getLocalizer('playerInsights.show');

      this.itemLabel.setText(text);
      this.setAriaLabel(text);
    };

    this.playerInsightsPanel.onShow.subscribe(updateText);
    this.playerInsightsPanel.onHide.subscribe(updateText);
    this.onClick.subscribe(() => this.playerInsightsPanel.toggleHidden());
    updateText();
  }
}
