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

    const controlBarTop = document.querySelector('.bmpui-ui-controlbar .ad-controlbar-top') as HTMLElement;
    console.log(controlBarTop);
    if (controlBarTop) {
      controlBarTop.style.transition = 'transform 0.35s ease';
      controlBarTop.style.transform = 'translateY(30px)';
    }
  }

  show(): void {
    super.show();

    const controlBarTop = document.querySelector('.bmpui-ui-controlbar .ad-controlbar-top') as HTMLElement;
    if (controlBarTop) {
      controlBarTop.style.transition = 'transform 0.35s ease';
      controlBarTop.style.transform = 'translateY(0)';
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