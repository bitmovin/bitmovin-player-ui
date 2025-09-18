import {SelectBox} from './SelectBox';
import {ListSelectorConfig} from '../lists/ListSelector';
import {UIInstanceManager} from '../../UIManager';
import {SubtitleSwitchHandler} from '../../utils/SubtitleUtils';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';

/**
 * A select box providing a selection between available subtitle and caption tracks.
 *
 * @category Components
 */
export class SubtitleSelectBox extends SelectBox {

  constructor(config: ListSelectorConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-subtitleselectbox'],
      ariaLabel: i18n.getLocalizer('subtitle.select'),
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    new SubtitleSwitchHandler(player, this, uimanager);
  }
}
