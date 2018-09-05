import {SelectBox} from './selectbox';
import {ListSelectorConfig} from './listselector';
import {UIInstanceManager} from '../uimanager';
import {SubtitleSwitchHandler} from '../subtitleutils';

/**
 * A select box providing a selection between available subtitle and caption tracks.
 */
export class SubtitleSelectBox extends SelectBox {

  constructor(config: ListSelectorConfig = {}) {
    super(config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    new SubtitleSwitchHandler(player, this, uimanager);
  }
}
