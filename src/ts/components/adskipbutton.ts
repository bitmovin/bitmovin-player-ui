import {ButtonConfig, Button} from './button';
import {UIManager} from '../uimanager';
import SkipMessage = bitmovin.player.SkipMessage;
import {StringUtils} from '../utils';

/**
 * Configuration interface for the {@link AdSkipButton}.
 */
export interface AdSkipButtonConfig extends ButtonConfig {
  skipMessage?: SkipMessage;
}

/**
 * A button that is displayed during ads and can be used to skip the ad.
 */
export class AdSkipButton extends Button<AdSkipButtonConfig> {

  constructor(config: AdSkipButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, <AdSkipButtonConfig>{
      cssClass: 'ui-button-ad-skip',
      skipMessage: {
        countdown: 'Skip ad in {remainingTime}',
        skip: 'Skip ad'
      }
    }, this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIManager): void {
    super.configure(player, uimanager);

    let self = this;
    let config = <AdSkipButtonConfig>this.getConfig(); // TODO get rid of generic cast
    let skipMessage = config.skipMessage;
    let adEvent = <bitmovin.player.AdStartedEvent>null;

    let updateSkipMessageHandler = function() {
      // Display this button only if ad is skippable
      if (adEvent.skipOffset) {
        self.show();
      } else {
        self.hide();
      }

      // Update the skip message on the button
      if (player.getCurrentTime() < adEvent.skipOffset) {
        self.setText(
          StringUtils.replaceAdMessagePlaceholders(config.skipMessage.countdown, adEvent.skipOffset, player));
      } else {
        self.setText(config.skipMessage.skip);
      }
    };

    let adStartHandler = function(event: bitmovin.player.AdStartedEvent) {
      adEvent = event;
      skipMessage = adEvent.skipMessage || skipMessage;
      updateSkipMessageHandler();

      player.addEventHandler(bitmovin.player.EVENT.ON_TIME_CHANGED, updateSkipMessageHandler);
      player.addEventHandler(bitmovin.player.EVENT.ON_CAST_TIME_UPDATED, updateSkipMessageHandler);
    };

    let adEndHandler = function() {
      player.removeEventHandler(bitmovin.player.EVENT.ON_TIME_CHANGED, updateSkipMessageHandler);
      player.removeEventHandler(bitmovin.player.EVENT.ON_CAST_TIME_UPDATED, updateSkipMessageHandler);
    };

    player.addEventHandler(bitmovin.player.EVENT.ON_AD_STARTED, adStartHandler);
    player.addEventHandler(bitmovin.player.EVENT.ON_AD_SKIPPED, adEndHandler);
    player.addEventHandler(bitmovin.player.EVENT.ON_AD_FINISHED, adEndHandler);

    self.onClick.subscribe(function() {
      // Try to skip the ad (this only works if it is skippable so we don't need to take extra care of that here)
      player.skipAd();
    });
  }
}