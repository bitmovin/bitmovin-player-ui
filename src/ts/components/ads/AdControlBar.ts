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
 * A specialized control bar for ads that handles coordinated show/hide animations
 * for both top and bottom sections, including slide animations and shadow effects.
 */
export class AdControlBar extends ControlBar {
  private static readonly CLASS_AD_SKIP_BUTTON = 'ui-button-ad-skip';
  private static readonly CLASS_SLID_DOWN = 'slid-down';

  private topContainer: Container<ContainerConfig> | null = null;
  private bottomContainer: Container<ContainerConfig> | null = null;

  constructor(config: AdControlBarConfig) {
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
    console.log('[test] AdControlBar: Hide called'); // for CLAUDE: who the hell is calling this method when the ad layout is created and used? Look at UIManager and UIFactory, those could have hints!!
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
      // const botElement = this.bottomContainer.getDomElement();
      // if (botElement) {
        // botElement.addClass(this.prefixCss(AdControlBar.CLASS_SLID_DOWN));
      // }
    }
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
      // const botElement = this.bottomContainer.getDomElement();
      // if (botElement) {
        // botElement.removeClass(this.prefixCss(AdControlBar.CLASS_SLID_DOWN));
      // }
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