import type { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../../../UIManager';
import { PlayerInsightSnapshot, PlayerInsightsProvider } from '../../../utils/PlayerInsightsProvider';
import { SettingsPanel, SettingsPanelConfig } from '../../settings/SettingsPanel';
import { SettingsPanelPage } from '../../settings/SettingsPanelPage';
import { PlayerInsightsPanelItem } from './PlayerInsightsPanelItem';
import { PlayerInsightsPanelTitleItem } from './PlayerInsightsPanelTitleItem';

/**
 * Configuration interface for a {@link PlayerInsightsPanel}.
 *
 * @category Configs
 */
export interface PlayerInsightsPanelConfig extends SettingsPanelConfig {
  /**
   * The interval in milliseconds at which the displayed values are refreshed while playback is active.
   * Set to -1 to disable periodic refreshes.
   * Default: 1000
   */
  refreshIntervalMs?: number;
}

/**
 * Player diagnostics panel composed from settings-panel rows.
 *
 * @category Components
 */
export class PlayerInsightsPanel extends SettingsPanel<PlayerInsightsPanelConfig> {
  private readonly insightsProvider: PlayerInsightsProvider;
  private readonly insightItems: PlayerInsightsPanelItem[];

  constructor(config: PlayerInsightsPanelConfig = {}) {
    super(config);

    const insightsProvider = new PlayerInsightsProvider();
    const insightItems = insightsProvider.getInsights().map(
      insight =>
        new PlayerInsightsPanelItem({
          leadingLabel: insight.leadingLabel,
        }),
    );
    const titleItem = new PlayerInsightsPanelTitleItem();
    const rootPage = new SettingsPanelPage({
      components: [titleItem, ...insightItems],
    });

    titleItem.setTarget(this);
    this.insightsProvider = insightsProvider;
    this.insightItems = insightItems;

    this.config = this.mergeConfig(
      config,
      {
        cssClasses: ['ui-player-insights-panel'],
        hidden: true,
        hideDelay: -1,
        hideOnControlsHide: false,
        hideOnOtherSettingsPanelOpening: false,
        refreshIntervalMs: 1000,
      },
      this.config,
    );
    this.addComponent(rootPage);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.insightsProvider.onChanged.subscribe(this.playerInsightsChangedHandler);
    this.insightsProvider.initialize(player, uimanager, this.config.refreshIntervalMs);
    this.onShow.subscribe(() => this.insightsProvider.activate());
    this.onHide.subscribe(() => this.insightsProvider.deactivate());
  }

  release(): void {
    this.insightsProvider.release();
    super.release();
  }

  private readonly playerInsightsChangedHandler = (
    _: PlayerInsightsProvider,
    snapshots: PlayerInsightSnapshot[],
  ): void => {
    snapshots.forEach((snapshot, index) => {
      const item = this.insightItems[index];
      if (!item) {
        return;
      }

      if (snapshot.visible) {
        item.show();
      } else {
        item.hide();
      }

      if (snapshot.value != null && snapshot.value !== '') {
        item.setTrailingLabel(snapshot.value);
      }
    });
  };
}
