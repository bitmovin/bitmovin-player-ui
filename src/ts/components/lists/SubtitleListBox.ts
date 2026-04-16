import { ListBox, ListBoxConfig } from './ListBox';
import { UIInstanceManager } from '../../UIManager';
import { SubtitleSwitchHandler } from '../../utils/SubtitleUtils';
import { PlayerAPI } from 'bitmovin-player';
import { SubtitleSelectBox } from '../settings/SubtitleSelectBox';
import { LocalizableText } from '../../localization/i18n';

export interface SubtitleListBoxConfig extends Omit<ListBoxConfig, 'listSelector'> {}

/**
 * An element that is similar to a select box where the user can select a subtitle
 *
 * When a comparator is configured, the built-in "Off" option remains fixed at the top
 * and is not reordered together with the subtitle tracks.
 *
 * @category Components
 */
export class SubtitleListBox extends ListBox {
  constructor(title?: LocalizableText);
  constructor(config?: SubtitleListBoxConfig);
  constructor(configOrTitle: LocalizableText | SubtitleListBoxConfig = {}) {
    const config: SubtitleListBoxConfig =
      typeof configOrTitle === 'string' || typeof configOrTitle === 'function'
        ? { title: configOrTitle }
        : configOrTitle;

    super({
      ...config,
      listSelector: new SubtitleSelectBox(config),
    });
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    new SubtitleSwitchHandler(player, this.config.listSelector, uimanager);
  }
}
