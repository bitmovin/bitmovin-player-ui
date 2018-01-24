import {SelectBox} from './selectbox';
import {ListSelectorConfig} from './listselector';
import {UIInstanceManager} from '../uimanager';
import i18n from '../i18n';

/**
 * A select box providing a selection of different playback speeds.
 */
export class PlaybackSpeedSelectBox extends SelectBox {

  constructor(config: ListSelectorConfig = {}) {
    super(config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem('0.25', '0.25x');
    this.addItem('0.5', '0.5x');
    this.addItem('1', i18n.q.labels.normal);
    this.addItem('1.5', '1.5x');
    this.addItem('2', '2x');


    this.onItemSelected.subscribe((sender: PlaybackSpeedSelectBox, value: string) => {
      player.setPlaybackSpeed(parseFloat(value));
      this.selectItem(value);
    });

    let setDefaultValue = (): void => {
      let playbackSpeed = String(player.getPlaybackSpeed());
      if (!this.selectItem(playbackSpeed)) {
        playbackSpeed = '1';
        this.selectItem(playbackSpeed);
      }
    };

    setDefaultValue();

    // when the player hits onReady again, adjust the playback speed selection with fallback to default 1
    player.addEventHandler(player.EVENT.ON_READY, setDefaultValue);
  }
}
