import { ControlBar, ControlBarConfig } from '../ControlBar';
import { Container, ContainerConfig } from '../Container';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../../UIManager';
import { i18n } from '../../localization/i18n';
import { SeekBar } from '../seekbar/SeekBar';


export interface AdControlBarConfig extends ControlBarConfig {}

/**
 * Contains player control components displayed during ad playback,
 * e.g., play toggle button, seek bar, volume control, fullscreen toggle button.
 * 
 * Usage: Pass one or more {@link Container} components via the `components` array.
 * - Containers containing a {@link SeekBar} (directly or nested) are always shown.
 * - Other containers are hidden/shown when controls hide.
 *
 * @example
 * ```typescript
 * new AdControlBar({
 *   components: [
 *     new Container({
 *       components: [
 *         new AdCounterLabel(),
 *         new SeekBar({ label: new SeekBarLabel() }),
 *         new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.RemainingTime }),
 *       ],
 *       cssClasses: ['ad-controlbar-top'],
 *     }),
 *     new Container({
 *       components: [
 *         new PlaybackToggleButton(),
 *         new VolumeToggleButton(),
 *         new Spacer(),
 *         new FullscreenToggleButton(),
 *       ],
 *       cssClasses: ['ad-controlbar-bottom'],
 *     }),
 *   ],
 * })
 * ```
 *
 * @category Components
 */
export class AdControlBar extends ControlBar {
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

    // Classify containers based on whether they contain SeekBar
    this.config.components.forEach(component => {
      if (component instanceof Container) {
        if (this.findContainerWithSeekBar(component)) {
          this.containersToKeepVisible.push(component);
        } else {
          this.containersToHide.push(component);
        }
      }
    });
  }

  hide(): void {
    this.containersToHide.forEach(container => {
      container.hide();
    });
  }

  show(): void {
    [...this.containersToHide, ...this.containersToKeepVisible].forEach(container => {
      container.show();
    });
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
