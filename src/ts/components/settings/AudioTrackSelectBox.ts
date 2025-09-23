import { SelectBox } from './SelectBox';
import { ListSelectorConfig } from '../lists/ListSelector';
import { UIInstanceManager } from '../../UIManager';
import { AudioTrackSwitchHandler } from '../../utils/AudioTrackUtils';
import { PlayerAPI } from 'bitmovin-player';

/**
 * A select box providing a selection between available audio tracks (e.g. different languages).
 *
 * @category Components
 */
export class AudioTrackSelectBox extends SelectBox {
  constructor(config: ListSelectorConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClasses: ['ui-audiotrackselectbox'],
      },
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    new AudioTrackSwitchHandler(player, this, uimanager);
  }
}
