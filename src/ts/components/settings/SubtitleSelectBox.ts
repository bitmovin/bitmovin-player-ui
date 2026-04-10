import { SelectBox } from './SelectBox';
import { ListItem, ListSelectorConfig } from '../lists/ListSelector';
import { UIInstanceManager } from '../../UIManager';
import { SubtitleSwitchHandler } from '../../utils/SubtitleUtils';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';

/**
 * A select box providing a selection between available subtitle and caption tracks.
 *
 * When a comparator is configured, the built-in "Off" option remains fixed at the top
 * and is not reordered together with the subtitle tracks.
 *
 * @category Components
 */
export class SubtitleSelectBox extends SelectBox {
  constructor(config: ListSelectorConfig = {}) {
    const comparator = config.comparator
      ? (itemA: ListItem, itemB: ListItem) => {
          if (
            itemA.key === SubtitleSwitchHandler.SUBTITLES_OFF_KEY &&
            itemB.key === SubtitleSwitchHandler.SUBTITLES_OFF_KEY
          ) {
            return 0;
          }
          if (itemA.key === SubtitleSwitchHandler.SUBTITLES_OFF_KEY) {
            return -1;
          }
          if (itemB.key === SubtitleSwitchHandler.SUBTITLES_OFF_KEY) {
            return 1;
          }
          return config.comparator(itemA, itemB);
        }
      : undefined;

    super({
      ...config,
      comparator,
    });

    this.config = this.mergeConfig(
      {
        ...config,
        comparator,
      },
      {
        cssClasses: ['ui-subtitleselectbox'],
        ariaLabel: i18n.getLocalizer('subtitle.select'),
      },
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    new SubtitleSwitchHandler(player, this, uimanager);
  }
}
