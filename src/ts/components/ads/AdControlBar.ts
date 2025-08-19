import { ControlBar, ControlBarConfig } from '../ControlBar';
import { Container, ContainerConfig } from '../Container';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../../UIManager';
import { i18n } from '../../localization/i18n';
import { SeekBar } from '../seekbar/SeekBar';

export interface AdControlBarConfig extends ControlBarConfig {
  // Uses the inherited 'components' property from ControlBarConfig
  // Components containing SeekBar will be treated as "top" components
  // Components without SeekBar will be treated as "bottom" components
}

/**
 * Contains player control components displayed during ad playback,
 * e.g., play toggle button, seek bar, volume control, fullscreen toggle button.
 *
 * @example
 * const adBar = new AdControlBar({
 *   components: [
 *     new Container({ components: [new SeekBar()] }),   // Will be treated as "top"
 *     new Container({ components: [new PlayButton()] }) // Will be treated as "bottom"
 *   ]
 * });
 * 
 * @category Components
 */
export class AdControlBar extends ControlBar {
  private static readonly CLASS_SLID_DOWN = 'slid-down';

  private containersToHide: Container<ContainerConfig>[] = [];
  private containersToKeepVisible: Container<ContainerConfig>[] = [];

  constructor(config: AdControlBarConfig) {
    super({
      ...config,
      cssClasses: ['ad-controlbar'],
    });

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-controlbar',
      hidden: false,
      role: 'region',
      ariaLabel: i18n.getLocalizer('controlBar'),
    }, <ControlBarConfig>this.config);

    // Classify containers based on whether they contain SeekBar and apply appropriate CSS classes
    for (const component of this.config.components) {
      if (component instanceof Container) {
        if (this.findContainerWithSeekBar(component)) {
          component.getConfig().cssClasses = [
            ...(component.getConfig().cssClasses || []),
            'controlbar-top',
            'ad-controlbar-top'
          ];
          this.containersToKeepVisible.push(component);
        } else {
          component.getConfig().cssClasses = [
            ...(component.getConfig().cssClasses || []),
            'ad-controlbar-bottom'
          ];
          this.containersToHide.push(component);
        }
      }
    }
  }

  hide(): void {
    for (const container of this.containersToHide) {
      container.hide();
      this.getDomElement().addClass(this.prefixCss(AdControlBar.CLASS_SLID_DOWN));
    }
  }

  show(): void {
    for (const container of [...this.containersToHide, ...this.containersToKeepVisible]) {
      container.show();
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

  private findContainerWithSeekBar(container: Container<ContainerConfig>): boolean {
    const components = container.getComponents();
    
    for (const component of components) {
      if (component instanceof SeekBar) {
        return true;
      }
      
      if (component instanceof Container) {
        if (this.findContainerWithSeekBar(component)) {
          return true;
        }
      }
    }
    
    return false;
  }
}
