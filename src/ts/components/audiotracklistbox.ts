import {ListBox} from './listbox';
import {UIInstanceManager} from '../uimanager';
import {AudioTrackSwitchHandler} from '../audiotrackutils';
import { PlayerAPI } from 'bitmovin-player';

/**
 * A element that is similar to a select box where the user can select a subtitle
 *
 * @category Components
 */
export class AudioTrackListBox extends ListBox {

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    new AudioTrackSwitchHandler(player, this, uimanager);
  }
}
