import type { PlayerAPI } from 'bitmovin-player';
import type { UIInstanceManager } from '../../../UIManager';
import { i18n } from '../../../localization/i18n';
import {
  InteractiveContextMenuItem,
  InteractiveContextMenuItemConfig,
} from '../../contextmenu/InteractiveContextMenuItem';
import { Label, LabelConfig } from '../../labels/Label';
import type { PlayerGraphsPanel } from './PlayerGraphsPanel';

/**
 * Configuration interface for a {@link PlayerGraphsContextMenuItem}.
 *
 * @category Configs
 */
export interface PlayerGraphsContextMenuItemConfig extends InteractiveContextMenuItemConfig {
  /**
   * The {@link PlayerGraphsPanel} whose visibility the item should toggle.
   */
  playerGraphsPanel: PlayerGraphsPanel;
}

/**
 * A context menu item that toggles a {@link PlayerGraphsPanel}.
 *
 * Excluded from the default layouts together with the panel. Enable it with
 * {@link UIConfig.playerGraphs} or with `componentLayoutOverrides`.
 *
 * @category Components
 */
export class PlayerGraphsContextMenuItem extends InteractiveContextMenuItem<PlayerGraphsContextMenuItemConfig> {
  private readonly itemLabel: Label<LabelConfig>;
  private readonly playerGraphsPanel: PlayerGraphsPanel;

  constructor(config: PlayerGraphsContextMenuItemConfig) {
    super(config);

    const itemLabel = new Label<LabelConfig>({
      text: i18n.getLocalizer('playerGraphs.show'),
    });

    this.config = this.mergeConfig(
      config,
      {
        ariaLabel: i18n.getLocalizer('playerGraphs.show'),
        closeContextMenuOnAction: true,
      },
      this.config,
    );

    this.itemLabel = itemLabel;
    this.playerGraphsPanel = config.playerGraphsPanel;
    this.addComponent(itemLabel);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    const updateText = () => {
      const text = this.playerGraphsPanel.isShown()
        ? i18n.getLocalizer('playerGraphs.hide')
        : i18n.getLocalizer('playerGraphs.show');

      this.itemLabel.setText(text);
      this.setAriaLabel(text);
    };

    this.playerGraphsPanel.onShow.subscribe(updateText);
    this.playerGraphsPanel.onHide.subscribe(updateText);
    this.onClick.subscribe(() => this.playerGraphsPanel.toggleHidden());
    updateText();
  }
}
