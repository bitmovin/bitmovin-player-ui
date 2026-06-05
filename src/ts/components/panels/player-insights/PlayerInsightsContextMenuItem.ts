import type { PlayerAPI } from 'bitmovin-player';
import type { UIInstanceManager } from '../../../UIManager';
import { i18n, LocalizableText } from '../../../localization/i18n';
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
    if (!config.playerInsightsPanel) {
      throw new Error('Required PlayerInsightsPanel is missing');
    }

    const initialText = PlayerInsightsContextMenuItem.getLabelText(config.playerInsightsPanel);
    const itemLabel = new Label<LabelConfig>({ text: initialText });

    super({
      ...config,
      label: itemLabel,
      ariaLabel: initialText,
      closeContextMenuOnAction: true,
    });

    this.itemLabel = itemLabel;
    this.playerInsightsPanel = config.playerInsightsPanel;
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.playerInsightsPanel.onShow.subscribe(this.updateText);
    this.playerInsightsPanel.onHide.subscribe(this.updateText);
    this.onClick.subscribe(() => this.playerInsightsPanel.toggleHidden());
    this.updateText();
  }

  private readonly updateText = (): void => {
    const text = PlayerInsightsContextMenuItem.getLabelText(this.playerInsightsPanel);

    this.itemLabel.setText(text);
    this.setAriaLabel(text);
  };

  private static getLabelText(playerInsightsPanel: PlayerInsightsPanel): LocalizableText {
    return playerInsightsPanel.isShown()
      ? i18n.getLocalizer('playerInsights.hide')
      : i18n.getLocalizer('playerInsights.show');
  }
}
