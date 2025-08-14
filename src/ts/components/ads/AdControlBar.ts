import { ControlBar, ControlBarConfig } from '../ControlBar';
import { Container, ContainerConfig } from '../Container';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../../UIManager';
import { i18n } from '../../localization/i18n';

export interface AdControlBarConfig extends ControlBarConfig {
  topComponents?: Container<ContainerConfig>;
  bottomComponents?: Container<ContainerConfig>;
}

/**
 * Contains player control components displayed during ad playback,
 * e.g., play toggle button, seek bar, volume control, fullscreen toggle button.
 *
 * @example
 * const adBar = new AdControlBar({
 *   topComponents: new Container(...),
 *   bottomComponents: new Container(...)
 * });
 * 
 * @category Components
 */
export class AdControlBar extends ControlBar {
  private static readonly CLASS_SLID_DOWN = 'slid-down';

  private topContainer: Container<ContainerConfig> | null = null;
  private bottomContainer: Container<ContainerConfig> | null = null;

  constructor(config: AdControlBarConfig) {
    const components = [];

    if (config.topComponents) {
      config.topComponents.getConfig().cssClasses = [
        ...(config.topComponents.getConfig().cssClasses || []),
        'controlbar-top',
        'ad-controlbar-top'
      ];
      components.push(config.topComponents);
    }

    if (config.bottomComponents) {
      config.bottomComponents.getConfig().cssClasses = [
        ...(config.bottomComponents.getConfig().cssClasses || []),
        'ad-controlbar-bottom'
      ];
      components.push(config.bottomComponents);
    }

    super({
      ...config,
      components,
      cssClasses: ['ad-controlbar'],
    });

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-controlbar',
      hidden: false,
      role: 'region',
      ariaLabel: i18n.getLocalizer('controlBar'),
    }, <ControlBarConfig>this.config);

    this.topContainer = config.topComponents || null;
    this.bottomContainer = config.bottomComponents || null;
  }

  hide(): void {// TODO: maybe do not use hide() generic, use hideBottomPart, or hideWithAnimation instead - since hide() is used by Container, or UIManager more generally
    if (this.bottomContainer) {
      this.bottomContainer.hide();
      this.getDomElement().addClass(this.prefixCss(AdControlBar.CLASS_SLID_DOWN));
    }
  }

  show(): void {
    if (this.bottomContainer) {
      this.bottomContainer.show();
      this.getDomElement().removeClass(this.prefixCss(AdControlBar.CLASS_SLID_DOWN));
    }
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    player.on(player.exports.PlayerEvent.AdStarted, () => {
      this.show();
    });

    uimanager.onControlsShow.subscribe(() => {
      this.show();
    });

    uimanager.onControlsHide.subscribe(() => {
      this.hide();
    });
  }
}
