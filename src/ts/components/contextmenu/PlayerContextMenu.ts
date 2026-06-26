import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';
import { version as UI_VERSION } from '../../version';
import { Label, LabelConfig } from '../labels/Label';
import { UIInstanceManager } from '../../UIManager';
import { PlayerUtils } from '../../utils/PlayerUtils';
import { ContextMenu, ContextMenuConfig } from './ContextMenu';
import { PlayerInsightsContextMenuItem } from '../panels/player-insights/PlayerInsightsContextMenuItem';
import type { PlayerInsightsPanel } from '../panels/player-insights/PlayerInsightsPanel';
import { InteractiveContextMenuItem, InteractiveContextMenuItemConfig } from './InteractiveContextMenuItem';
import { SettingsPanelItem, SettingsPanelItemConfig } from '../settings/SettingsPanelItem';
import { SettingsPanelPage } from '../settings/SettingsPanelPage';
import { SettingsPanelSeparator } from '../settings/SettingsPanelSeparator';

/**
 * Configuration interface for the {@link PlayerContextMenu}.
 *
 * @category Configs
 */
export interface PlayerContextMenuConfig extends ContextMenuConfig {
  /**
   * The player insights panel to expose as a default context menu action.
   */
  playerInsightsPanel: PlayerInsightsPanel;
}

/**
 * A player-specific context menu with Bitmovin info and Player/UI versions.
 *
 * @category Components
 */
export class PlayerContextMenu extends ContextMenu<PlayerContextMenuConfig> {
  private readonly copyTimestampLinkItem: InteractiveContextMenuItem<InteractiveContextMenuItemConfig>;

  constructor(config: PlayerContextMenuConfig) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClasses: ['ui-player-context-menu'],
      },
      this.config,
    );

    const copyTimestampLinkLabel = new Label<LabelConfig>({
      text: i18n.getLocalizer('contextMenu.copyTimestampLink'),
    });
    const copyTimestampLinkItem = new InteractiveContextMenuItem<InteractiveContextMenuItemConfig>({
      label: copyTimestampLinkLabel,
      ariaLabel: i18n.getLocalizer('contextMenu.copyTimestampLink'),
      closeContextMenuOnAction: true,
    });

    this.copyTimestampLinkItem = copyTimestampLinkItem;

    this.addComponent(
      new SettingsPanelPage({
        components: [
          new PlayerInfoContextMenuItem(),
          new SettingsPanelSeparator(),
          new PlayerInsightsContextMenuItem({
            playerInsightsPanel: config.playerInsightsPanel,
          }),
          copyTimestampLinkItem,
        ],
      }),
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.copyTimestampLinkItem.onClick.subscribe(() => {
      navigator.clipboard.writeText(buildTimestampLink(player.getCurrentTime()));
    });

    const liveStreamDetector = new PlayerUtils.LiveStreamDetector(player, uimanager);
    liveStreamDetector.onLiveChanged.subscribe((sender, args: PlayerUtils.LiveStreamDetectorEventArgs) => {
      if (args.live) {
        this.copyTimestampLinkItem.hide();
      } else {
        this.copyTimestampLinkItem.show();
      }
    });
    liveStreamDetector.detect();
  }
}

export function parseTimestampFromUrl(href: string = window.location.href): number | null {
  const match = href.match(/[?#&]t=([0-9]+(?:\.[0-9]+)?)s?(?:&|$|#)/);
  if (!match) {
    return null;
  }

  const value = parseFloat(match[1]);
  return isFinite(value) && value >= 0 ? value : null;
}

export function buildTimestampLink(currentTime: number, href: string = window.location.href): string {
  const time = Math.max(0, Math.floor(currentTime || 0));
  const hashIndex = href.indexOf('#');
  const fragment = hashIndex >= 0 ? href.substring(hashIndex) : '';
  const beforeFragment = hashIndex >= 0 ? href.substring(0, hashIndex) : href;
  const stripped = beforeFragment.replace(/([?&])t=[^&]*(&|$)/, (_, before: string, after: string) => {
    if (before === '?' && after === '') {
      return '';
    }

    if (before === '?' && after === '&') {
      return '?';
    }

    return after === '&' ? before : '';
  });
  const separator = stripped.indexOf('?') === -1 ? '?' : '&';

  return `${stripped}${separator}t=${time}s${fragment}`;
}

class PlayerInfoContextMenuItem extends SettingsPanelItem<SettingsPanelItemConfig> {
  private readonly playerVersionLabel: Label<LabelConfig>;

  constructor(config: SettingsPanelItemConfig = {}) {
    super(config);

    const playerVersionLabel = new Label<LabelConfig>({
      text: 'Player: -',
      cssClasses: ['ui-player-context-menu-info'],
    });

    this.config = this.mergeConfig(
      config,
      {
        label: null,
        cssClasses: ['ui-player-context-menu-info-item'],
        isSetting: false,
        role: 'group',
        tabIndex: -1,
      },
      this.config,
    );

    this.playerVersionLabel = playerVersionLabel;
    this.addComponent(
      new Label<LabelConfig>({
        text: i18n.getLocalizer('contextMenu.title'),
        cssClasses: ['ui-player-context-menu-header'],
      }),
    );
    this.addComponent(
      new Label<LabelConfig>({
        text: i18n.getLocalizer('contextMenu.subtitle'),
        cssClasses: ['ui-player-context-menu-subtitle'],
      }),
    );
    this.addComponent(playerVersionLabel);
    this.addComponent(
      new Label<LabelConfig>({
        text: `UI: ${UI_VERSION}`,
        cssClasses: ['ui-player-context-menu-info'],
      }),
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.playerVersionLabel.setText(`Player: ${player.version}`);
  }
}
