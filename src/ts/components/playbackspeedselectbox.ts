import {SelectBox} from './selectbox';
import {ListSelectorConfig} from './listselector';
import {UIInstanceManager} from '../uimanager';

/**
 * A select box providing a selection of different playback speeds.
 */
export class PlaybackSpeedSelectBox extends SelectBox {

  constructor(config: ListSelectorConfig = {}) {
    super(config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addDefaultItems();

    this.onItemSelected.subscribe((sender: PlaybackSpeedSelectBox, value: string) => {
      player.setPlaybackSpeed(parseFloat(value));
      this.selectItem(value);
    });

    const setDefaultValue = (): void => {
      const playbackSpeed = String(player.getPlaybackSpeed());
      this.setSpeed(playbackSpeed);
    };

    // when the player hits onReady again, adjust the playback speed selection
    player.addEventHandler(player.EVENT.ON_READY, setDefaultValue);

    if (player.EVENT.ON_PLAYBACK_SPEED_CHANGED) {
      // Since player 7.7.0
      player.addEventHandler(player.EVENT.ON_PLAYBACK_SPEED_CHANGED, setDefaultValue);
    }
  }

  setSpeed(speed: string): void {
    if (!this.selectItem(speed)) {
      // a playback speed was set which is not in the list, add it to the list to show it to the user
      this.clearItems();
      this.addItem(speed, `${speed}x`);
      this.addDefaultItems();
      this.selectItem(speed);
    }
  }

  addDefaultItems() {
    this.addItem('0.25', '0.25x');
    this.addItem('0.5', '0.5x');
    this.addItem('1', 'Normal');
    this.addItem('1.5', '1.5x');
    this.addItem('2', '2x');
  }

  clearItems() {
    this.items = [];
    this.selectedItem = null;
  }
}