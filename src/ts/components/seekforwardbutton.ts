import {ButtonConfig, Button} from './button';
import {UIInstanceManager} from '../uimanager';

export enum SeekButtonDirection {
    Forward = 1,
    Backward,
}

export interface SeekForwardButtonConfig extends ButtonConfig {
    direction: SeekButtonDirection;
}

/**
 * A button that can be used to skeep +60 sec or -60 sec
 */
export class SeekForwardButton extends Button<SeekForwardButtonConfig> {

  constructor(config: SeekForwardButtonConfig = { direction: SeekButtonDirection.Forward }) {
    super(config);

    let cssClass = (config.direction === SeekButtonDirection.Forward) ? 'ui-seek-forward-button' : 'ui-seek-backward-button';

    this.config = this.mergeConfig(config, {
      cssClass: cssClass,
      text: 'Seek Forward',
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = <SeekForwardButtonConfig>this.getConfig();

    let seekMessageHandler = () => {
      if (config.direction === SeekButtonDirection.Forward) {
        // Disable button if it is less than 60 sec to end
        if (player.getCurrentTime() + 60 > player.getDuration()) {
           this.hide();
         } else {
           this.show();
         }
      } else {
        // Disable button if current time is shorter than 60 sec
        if (player.getCurrentTime() < 60) {
           this.hide();
         } else {
           this.show();
         }
      }
    };

    player.addEventHandler(player.EVENT.ON_TIME_CHANGED, seekMessageHandler);
    player.addEventHandler(player.EVENT.ON_CAST_TIME_UPDATED, seekMessageHandler);
    // update playback position when a seek has finished
    player.addEventHandler(player.EVENT.ON_SEEKED, seekMessageHandler);

    if (config.direction === SeekButtonDirection.Forward) {
      this.onClick.subscribe(() => {
        player.seek(player.getCurrentTime() + 60);
      });
    } else {
      this.onClick.subscribe(() => {
        player.seek(player.getCurrentTime() - 60);
      });
    }

    seekMessageHandler();
  }
}
