import {SelectBox} from './selectbox';
import {ListSelectorConfig} from './listselector';
import {UIInstanceManager} from '../uimanager';
import {AudioTrackSwitchHandler} from '../audiotrackutils';

/**
 * A select box providing a selection between available audio tracks (e.g. different languages).
 */
export class AudioTrackSelectBox extends SelectBox {

  constructor(config: ListSelectorConfig = {}) {
    super(config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    new AudioTrackSwitchHandler(player, this, uimanager);
  }
}