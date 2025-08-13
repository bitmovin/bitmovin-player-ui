import { ControlBar, ControlBarConfig } from '../ControlBar';
import { Container, ContainerConfig } from '../Container';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../../UIManager';

export interface AdControlBarConfig extends ControlBarConfig {
  topComponents?: Container<ContainerConfig>;
  bottomComponents?: Container<ContainerConfig>;
}

/**
 * A specialized control bar for ads that handles coordinated show/hide animations
 * for both top and bottom sections, including slide animations and shadow effects.
 */
export class AdControlBar extends ControlBar {
  private static readonly CLASS_AD_SKIP_BUTTON = 'ui-button-ad-skip';
  private static readonly CLASS_SLID_DOWN = 'slid-down';

  private topContainer: Container<ContainerConfig> | null = null;
  private bottomContainer: Container<ContainerConfig> | null = null;

  constructor(config: AdControlBarConfig) {
    // Build components array from top and bottom containers
    const components = [];
    if (config.topComponents) {
      components.push(config.topComponents);
    }
    if (config.bottomComponents) {
      components.push(config.bottomComponents);
    }

    super({
      ...config,
      components,
      cssClasses: ['ad-controlbar'],
    });

    this.topContainer = config.topComponents || null;
    this.bottomContainer = config.bottomComponents || null;
  }

  hide(): void {
    super.hide();

    // Animate top container with slide down effect
    if (this.topContainer) {
      const topElement = this.topContainer.getDomElement();
      if (topElement) {
        topElement.addClass(this.prefixCss(AdControlBar.CLASS_SLID_DOWN));
      }
    }

    // Animate bottom container with slide down effect
    if (this.bottomContainer) {
      const bottomElement = this.bottomContainer.getDomElement();
      if (bottomElement) {
        bottomElement.addClass(this.prefixCss(AdControlBar.CLASS_SLID_DOWN));
      }
    }

    // Handle skip button animation
    const skipBtn = document.querySelector(`.${this.prefixCss(AdControlBar.CLASS_AD_SKIP_BUTTON)}`) as HTMLElement;
    if (skipBtn) {
      skipBtn.classList.add(this.prefixCss(AdControlBar.CLASS_SLID_DOWN));
    }
  }

  show(): void {
    super.show();

    // Remove slide down animations from top container
    if (this.topContainer) {
      const topElement = this.topContainer.getDomElement();
      if (topElement) {
        topElement.removeClass(this.prefixCss(AdControlBar.CLASS_SLID_DOWN));
      }
    }

    // Remove slide down animations from bottom container
    if (this.bottomContainer) {
      const bottomElement = this.bottomContainer.getDomElement();
      if (bottomElement) {
        bottomElement.removeClass(this.prefixCss(AdControlBar.CLASS_SLID_DOWN));
      }
    }

    // Remove skip button animation
    const skipBtn = document.querySelector(`.${this.prefixCss(AdControlBar.CLASS_AD_SKIP_BUTTON)}`) as HTMLElement;
    if (skipBtn) {
      skipBtn.classList.remove(this.prefixCss(AdControlBar.CLASS_SLID_DOWN));
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