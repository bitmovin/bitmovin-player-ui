import {SelectBox} from './selectbox';
import {ListSelectorConfig} from './listselector';
import {UIInstanceManager} from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../localization/i18n';

/**
 * A select box providing a selection of different playback speeds.
 *
 * @category Components
 */
export class PlaybackSpeedSelectBox extends SelectBox {
  protected defaultPlaybackSpeeds: number[];

  constructor(config: ListSelectorConfig = {}) {
    super(config);
    this.defaultPlaybackSpeeds = [0.25, 0.5, 1, 1.5, 2];

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-playbackspeedselectbox'],
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addDefaultItems();

    this.onItemSelected.subscribe((sender: PlaybackSpeedSelectBox, value: string) => {
      player.setPlaybackSpeed(parseFloat(value));
      this.selectItem(value);
    });

    const setDefaultValue = (): void => {
      const playbackSpeed = player.getPlaybackSpeed();
      this.setSpeed(playbackSpeed);
    };

    player.on(player.exports.PlayerEvent.PlaybackSpeedChanged, setDefaultValue);
    uimanager.getConfig().events.onUpdated.subscribe(setDefaultValue);
  }

  setSpeed(speed: number): void {
    if (!this.selectItem(String(speed))) {
      // a playback speed was set which is not in the list, add it to the list to show it to the user
      this.clearItems();
      this.addDefaultItems([speed]);
      this.selectItem(String(speed));
    }
  }

  addDefaultItems(customItems: number[] = []): void {
    const sortedSpeeds = this.defaultPlaybackSpeeds.concat(customItems).sort();

    sortedSpeeds.forEach(element => {
      if (element !== 1) {
        this.addItem(String(element), `${element}x`);
      } else {
        this.addItem(String(element), i18n.getLocalizer('normal'));
      }
    });
  }

  clearItems(): void {
    this.items = [];
    this.selectedItem = null;
  }
}