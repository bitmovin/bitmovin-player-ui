import { PlaybackToggleButton } from '../buttons/PlaybackToggleButton';
import { VolumeToggleButton } from '../buttons/VolumeToggleButton';
import { Spacer } from '../Spacer';
import { FullscreenToggleButton } from '../buttons/FullscreenToggleButton';
import { Container, ContainerConfig } from '../Container';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../../UIManager';

/**
 * A container for ad-specific bottom control bar components.
 */
export class AdControlBarBottom extends Container<ContainerConfig> {
  private static readonly CLASS_TOP_AD_CONTROL_BAR = 'ad-controlbar-top';
  private static readonly CLASS_BOTTOM_HIDDEN = 'bottom-hidden';

  constructor(config: Partial<ContainerConfig> = {}) {
    super({
      ...config,
      components: [
        new PlaybackToggleButton(),
        new VolumeToggleButton(),
        new Spacer(),
        new FullscreenToggleButton(),
      ],
      cssClasses: ['ad-controlbar-bottom'],
    });
  }

  hide(): void {
    super.hide();

    const controlBarTop = document.querySelector(`.${AdControlBarBottom.CLASS_TOP_AD_CONTROL_BAR}`) as HTMLElement;
    if (controlBarTop) {
      controlBarTop.classList.add(this.prefixCss(AdControlBarBottom.CLASS_BOTTOM_HIDDEN));
    }
  }

  show(): void {
    super.show();

    const controlBarTop = document.querySelector(`.${AdControlBarBottom.CLASS_TOP_AD_CONTROL_BAR}`) as HTMLElement;
    if (controlBarTop) {
      controlBarTop.classList.remove(this.prefixCss(AdControlBarBottom.CLASS_BOTTOM_HIDDEN));
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