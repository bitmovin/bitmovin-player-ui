import type { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../../../UIManager';
import { i18n, LocalizableText } from '../../../localization/i18n';
import { Timeout } from '../../../utils/Timeout';
import { Button, ButtonConfig } from '../../buttons/Button';
import {
  InteractiveContextMenuItem,
  InteractiveContextMenuItemConfig,
} from '../../contextmenu/InteractiveContextMenuItem';
import { Label, LabelConfig } from '../../labels/Label';
import { SettingsPanel, SettingsPanelConfig } from '../../settings/SettingsPanel';
import { SettingsPanelItem, SettingsPanelItemConfig } from '../../settings/SettingsPanelItem';
import { SettingsPanelPage } from '../../settings/SettingsPanelPage';
import {
  formatAudioQualityInsight,
  formatBufferInsight,
  formatManifestUrlInsight,
  formatStreamInsight,
  formatTimeInsight,
  formatVideoQualityInsight,
  formatViewportFramesInsight,
} from './PlayerInsightsUtils';

export { formatBitrate, formatSeconds } from './PlayerInsightsUtils';

type PlayerInsightsValueProvider = (player: PlayerAPI) => LocalizableText | null | undefined;
type PlayerInsightsVisibilityProvider = (player: PlayerAPI) => boolean;

interface PlayerInsightsItemConfig {
  leadingLabel: LocalizableText;
  value?: PlayerInsightsValueProvider;
  visible?: PlayerInsightsVisibilityProvider;
  cssClasses?: string[];
}

interface PlayerInsightsItem {
  item: PlayerInsightsPanelItem;
  value?: PlayerInsightsValueProvider;
  visible?: PlayerInsightsVisibilityProvider;
}

interface PlayerInsightsPanelItemConfig extends SettingsPanelItemConfig {
  leadingLabel: LocalizableText;
  trailingLabel?: LocalizableText;
}

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

  /**
   * Whether the built-in player-insight rows should be added before custom components.
   * Default: true
   */
  includeDefaultItems?: boolean;
}

/**
 * Player diagnostics panel composed from settings-panel rows.
 *
 * @category Components
 */
export class PlayerInsightsPanel extends SettingsPanel<PlayerInsightsPanelConfig> {
  private refreshTimer: Timeout | null = null;
  private readonly insightsItems: PlayerInsightsItem[];

  constructor(config: PlayerInsightsPanelConfig = {}) {
    const insightsItems = config.includeDefaultItems === false ? [] : PlayerInsightsPanel.createDefaultItems();
    const titleItem = new PlayerInsightsPanelTitleItem();
    const rootPage = new SettingsPanelPage({
      components: [titleItem, ...insightsItems.map(insightsItem => insightsItem.item), ...(config.components ?? [])],
    });
    const panelConfig = {
      ...config,
      cssClasses: ['ui-player-insights-panel', ...(config.cssClasses ?? [])],
      components: [rootPage],
    };

    super(panelConfig);

    titleItem.setTarget(this);
    this.insightsItems = insightsItems;

    this.config = this.mergeConfig(
      panelConfig,
      {
        hidden: true,
        hideDelay: -1,
        hideOnControlsHide: false,
        hideWithOtherSettingsPanels: false,
        refreshIntervalMs: 1000,
        includeDefaultItems: true,
      } as PlayerInsightsPanelConfig,
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    const updateItems = () => this.updateItems(player);
    const updateAndStartTimer = () => {
      updateItems();
      this.startTimer(player, updateItems);
    };

    player.on(player.exports.PlayerEvent.Play, updateAndStartTimer);
    player.on(player.exports.PlayerEvent.Playing, updateAndStartTimer);
    player.on(player.exports.PlayerEvent.Paused, updateItems);
    player.on(player.exports.PlayerEvent.Seeked, updateItems);
    player.on(player.exports.PlayerEvent.SourceLoaded, updateItems);
    player.on(player.exports.PlayerEvent.SourceUnloaded, updateItems);
    player.on(player.exports.PlayerEvent.VideoQualityChanged, updateItems);
    player.on(player.exports.PlayerEvent.AudioQualityChanged, updateItems);
    player.on(player.exports.PlayerEvent.PlayerResized, updateItems);
    player.on(player.exports.PlayerEvent.StallStarted, updateItems);
    player.on(player.exports.PlayerEvent.StallEnded, updateItems);
    player.on(player.exports.PlayerEvent.PlaybackFinished, () => this.stopTimer());
    player.on(player.exports.PlayerEvent.Destroy, () => this.stopTimer());

    this.onShow.subscribe(() => {
      updateItems();
      this.startTimer(player, updateItems);
    });
    this.onHide.subscribe(() => this.stopTimer());

    uimanager.getConfig().events.onUpdated.subscribe(updateItems);

    updateItems();
  }

  release(): void {
    this.stopTimer();
    super.release();
  }

  createContextMenuToggleItem(): InteractiveContextMenuItem<InteractiveContextMenuItemConfig> {
    const initialText =
      this.getConfig().hidden === true
        ? i18n.getLocalizer('playerInsights.show')
        : i18n.getLocalizer('playerInsights.hide');
    const label = new Label<LabelConfig>({ text: initialText });
    const item = new InteractiveContextMenuItem({
      label,
      ariaLabel: initialText,
      closeContextMenuOnAction: true,
    });
    const updateText = () => {
      const text = this.isShown() ? i18n.getLocalizer('playerInsights.hide') : i18n.getLocalizer('playerInsights.show');

      label.setText(text);
      item.setAriaLabel(text);
    };

    this.onShow.subscribe(updateText);
    this.onHide.subscribe(updateText);
    item.onClick.subscribe(() => this.toggleHidden());

    return item;
  }

  private updateItems(player: PlayerAPI): void {
    this.insightsItems.forEach(insightsItem => {
      const value = insightsItem.value?.(player);
      const hasValue = value != null && value !== '';

      if ((insightsItem.visible && !insightsItem.visible(player)) || (insightsItem.value && !hasValue)) {
        insightsItem.item.hide();
      } else {
        insightsItem.item.show();
      }

      if (hasValue) {
        insightsItem.item.setTrailingLabel(value);
      }
    });
  }

  private startTimer(player: PlayerAPI, updateHandler: () => void): void {
    this.stopTimer();

    if (this.config.refreshIntervalMs === -1 || this.isHidden() || player.isPaused()) {
      return;
    }

    this.refreshTimer = new Timeout(this.config.refreshIntervalMs, updateHandler, true).start();
  }

  private stopTimer(): void {
    if (this.refreshTimer) {
      this.refreshTimer.clear();
      this.refreshTimer = null;
    }
  }

  private static createDefaultItems(): PlayerInsightsItem[] {
    return [
      PlayerInsightsPanel.createItem({
        leadingLabel: i18n.getLocalizer('playerInsights.manifestUrl'),
        value: player => formatManifestUrlInsight(player),
      }),
      PlayerInsightsPanel.createItem({
        leadingLabel: i18n.getLocalizer('playerInsights.video'),
        value: player => formatVideoQualityInsight(player),
      }),
      PlayerInsightsPanel.createItem({
        leadingLabel: i18n.getLocalizer('playerInsights.viewportFrames'),
        value: player => formatViewportFramesInsight(player),
      }),
      PlayerInsightsPanel.createItem({
        leadingLabel: i18n.getLocalizer('playerInsights.audio'),
        value: player => formatAudioQualityInsight(player),
      }),
      PlayerInsightsPanel.createItem({
        leadingLabel: i18n.getLocalizer('playerInsights.bufferVideoAudio'),
        value: player => formatBufferInsight(player),
      }),
      PlayerInsightsPanel.createItem({
        leadingLabel: i18n.getLocalizer('playerInsights.time'),
        value: player => formatTimeInsight(player),
      }),
      PlayerInsightsPanel.createItem({
        leadingLabel: i18n.getLocalizer('playerInsights.stream'),
        value: player => formatStreamInsight(player),
      }),
      PlayerInsightsPanel.createItem({
        leadingLabel: i18n.getLocalizer('playerInsights.player'),
        value: player => player.version,
      }),
    ];
  }

  private static createItem(config: PlayerInsightsItemConfig): PlayerInsightsItem {
    return {
      item: new PlayerInsightsPanelItem({
        leadingLabel: config.leadingLabel,
        trailingLabel: '',
        cssClasses: config.cssClasses,
      }),
      value: config.value,
      visible: config.visible,
    };
  }
}

class PlayerInsightsPanelTitleItem extends SettingsPanelItem<SettingsPanelItemConfig> {
  private readonly closeButton: Button<ButtonConfig>;
  private target: PlayerInsightsPanel | null = null;

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

  setTarget(target: PlayerInsightsPanel): void {
    this.target = target;
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.closeButton.onClick.subscribe(() => {
      this.target?.hide();
    });
  }
}

class PlayerInsightsPanelItem extends SettingsPanelItem<PlayerInsightsPanelItemConfig> {
  private readonly leadingLabel: Label<LabelConfig>;
  private readonly trailingLabel: Label<LabelConfig>;

  constructor(config: PlayerInsightsPanelItemConfig) {
    const leadingLabel = new Label<LabelConfig>({
      text: config.leadingLabel,
      cssClasses: ['ui-player-insights-panel-item-leading-label'],
    });
    const trailingLabel = new Label<LabelConfig>({
      text: config.trailingLabel ?? '-',
      cssClasses: ['ui-player-insights-panel-item-trailing-label'],
    });
    const itemConfig: PlayerInsightsPanelItemConfig = {
      ...config,
      label: null,
      components: [leadingLabel, trailingLabel, ...(config.components ?? [])],
      cssClasses: ['ui-player-insights-panel-item', ...(config.cssClasses ?? [])],
    };

    super(itemConfig);

    this.leadingLabel = leadingLabel;
    this.trailingLabel = trailingLabel;

    this.config = this.mergeConfig(
      itemConfig,
      {
        isSetting: false,
        role: 'group',
        tabIndex: -1,
        trailingLabel: '-',
      } as PlayerInsightsPanelItemConfig,
      this.config,
    );
  }

  setLeadingLabel(text: LocalizableText): void {
    this.config.leadingLabel = text;
    this.leadingLabel.setText(text);
  }

  setTrailingLabel(text: LocalizableText): void {
    this.config.trailingLabel = text;
    this.trailingLabel.setText(text);
  }
}
