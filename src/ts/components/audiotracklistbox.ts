import {ListBox} from './listbox';
import {ListSelectorConfig} from './listselector';
import {UIInstanceManager} from '../uimanager';
import {AudioTrackSwitchHandler} from '../autiotrackutils';

/**
 * A element that is similar to a select box where the user can select a subtitle
 */
export class AudioTrackListBox extends ListBox {
  constructor(config: ListSelectorConfig = {}) {
    super(config);
    this.config = this.mergeConfig(config, {
      cssClass: 'ui-audiotrack-listbox',
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    new AudioTrackSwitchHandler(player, this);
  }
}
