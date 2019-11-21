import {SelectBox} from './selectbox';
import {ListSelectorConfig} from './listselector';
import {UIInstanceManager} from '../uimanager';
import {SubtitleSwitchHandler} from '../subtitleutils';
import { PlayerAPI } from 'bitmovin-player';

/**
 * A select box providing a selection between available subtitle and caption tracks.
 */
export class SubtitleSelectBox extends SelectBox {

  constructor(config: ListSelectorConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-subtitleselectbox'],
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.getDomElement().attr('aria-label', 'Subtitle switch');

    new SubtitleSwitchHandler(player, this, uimanager);
  }
}
