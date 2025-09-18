import { ListBox, ListBoxConfig } from './ListBox';
import {UIInstanceManager} from '../../UIManager';
import {AudioTrackSwitchHandler} from '../../utils/AudioTrackUtils';
import { PlayerAPI } from 'bitmovin-player';
import { AudioTrackSelectBox } from '../settings/AudioTrackSelectBox';
import { LocalizableText } from '../../localization/i18n';

/**
 * A element that is similar to a select box where the user can select a subtitle
 *
 * @category Components
 */
export class AudioTrackListBox extends ListBox {

  constructor(title?: LocalizableText) {
    super({
      listSelector: new AudioTrackSelectBox(),
      title: title,
    });
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    new AudioTrackSwitchHandler(player, this.config.listSelector, uimanager);
  }
}
