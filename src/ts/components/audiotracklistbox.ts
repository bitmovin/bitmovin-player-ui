import {ListBox} from './listbox';
import {ListSelectorConfig} from './listselector';
import {UIInstanceManager} from '../uimanager';
import {AudioTrackSwitchHandler} from '../audiotrackutils';

/**
 * A element that is similar to a select box where the user can select a subtitle
 */
export class AudioTrackListBox extends ListBox {
  constructor(config: ListSelectorConfig = {}) {
    super(config);
    this.config = this.mergeConfig(config, {
      cssClass: 'ui-listbox',
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    new AudioTrackSwitchHandler(player, this);
  }
}
