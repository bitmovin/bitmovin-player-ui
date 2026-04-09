import { ListBox, ListBoxConfig } from './ListBox';
import { UIInstanceManager } from '../../UIManager';
import { AudioTrackSwitchHandler } from '../../utils/AudioTrackUtils';
import { PlayerAPI } from 'bitmovin-player';
import { AudioTrackSelectBox } from '../settings/AudioTrackSelectBox';
import { LocalizableText } from '../../localization/i18n';

export interface AudioTrackListBoxConfig extends Omit<ListBoxConfig, 'listSelector'> {}

/**
 * A element that is similar to a select box where the user can select a subtitle
 *
 * @category Components
 */
export class AudioTrackListBox extends ListBox {
  constructor(title?: LocalizableText);
  constructor(config?: AudioTrackListBoxConfig);
  constructor(configOrTitle: LocalizableText | AudioTrackListBoxConfig = {}) {
    const config: AudioTrackListBoxConfig =
      typeof configOrTitle === 'string' || typeof configOrTitle === 'function'
        ? { title: configOrTitle }
        : configOrTitle;

    super({
      ...config,
      listSelector: new AudioTrackSelectBox(config),
    });
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    new AudioTrackSwitchHandler(player, this.config.listSelector, uimanager);
  }
}
