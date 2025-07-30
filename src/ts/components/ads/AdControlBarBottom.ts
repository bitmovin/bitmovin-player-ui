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

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    player.on(player.exports.PlayerEvent.AdStarted, () => {
      this.show();
    });

    uimanager.onControlsShow.subscribe(() => {
      this.getDomElement().removeClass(this.prefixCss('hidden-slide-down'));
    });

    uimanager.onControlsHide.subscribe(() => {
      this.getDomElement().addClass(this.prefixCss('hidden-slide-down'));
    });
  }
}