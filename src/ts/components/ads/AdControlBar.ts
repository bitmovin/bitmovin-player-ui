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
    // super.hide();

    // TODO: group logic into `slideComponents` or `componentsToSlide` - same for show()
    // Slide down top container
    if (this.topContainer) {
      const topElement = this.topContainer.getDomElement();
      if (topElement) {
        topElement.addClass(this.prefixCss(AdControlBar.CLASS_SLID_DOWN));
      }
    }
    // Slide down skip button
    const skipBtn = document.querySelector(`.${this.prefixCss(AdControlBar.CLASS_AD_SKIP_BUTTON)}`) as HTMLElement;
    if (skipBtn) {
      skipBtn.classList.add(this.prefixCss(AdControlBar.CLASS_SLID_DOWN));
    }

    // Slide down and hide bottom container
    if (this.bottomContainer) {
      this.bottomContainer.hide();
    }

    // Top container slides down to bottom position (CSS handles this automatically)
    // No need to add slid-down class to top - it stays visible
  }

  show(): void {
    // super.show();

    // Slide up top container
    if (this.topContainer) {
      const topElement = this.topContainer.getDomElement();
      if (topElement) {
        topElement.removeClass(this.prefixCss(AdControlBar.CLASS_SLID_DOWN));
      }
    }
    // Slide up skip button
    const skipBtn = document.querySelector(`.${this.prefixCss(AdControlBar.CLASS_AD_SKIP_BUTTON)}`) as HTMLElement;
    if (skipBtn) {
      skipBtn.classList.remove(this.prefixCss(AdControlBar.CLASS_SLID_DOWN));
    }

    // Slide up and show bottom container
    if (this.bottomContainer) {
      console.log('[test] AdControlBar: Show bottom container');
      this.bottomContainer.show();
    }

    // Top container automatically slides back up to original position (CSS handles this)
    // since bottom is now visible again
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    player.on(player.exports.PlayerEvent.AdStarted, () => {
      this.show();// TODO: for some reason, bottom is hidden by default !!!
    });

    uimanager.onControlsShow.subscribe(() => {
      console.log('[test] AdControlBar: Controls show event triggered');
      this.show();
    });

    uimanager.onControlsHide.subscribe(() => {
      console.log('[test] AdControlBar: Controls hide event triggered');
      this.hide();
    });
  }
}