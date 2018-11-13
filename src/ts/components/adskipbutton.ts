import { ButtonConfig, Button } from './button';
import { UIInstanceManager } from '../uimanager';
import { StringUtils } from '../stringutils';
import { AdEvent, LinearAd, PlayerAPI } from 'bitmovin-player';

/**
 * Configuration interface for the {@link AdSkipButton}.
 */
export interface AdSkipButtonConfig extends ButtonConfig {
  skipMessage?: any; // TODO SkipMessage;
}

/**
 * A button that is displayed during ads and can be used to skip the ad.
 */
export class AdSkipButton extends Button<AdSkipButtonConfig> {

  private static SKIPPABLE_IN_COUNTDOWN_CLASS = 'skippable-in-countdown';

  constructor(config: AdSkipButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, <AdSkipButtonConfig>{
      cssClass: 'ui-button-ad-skip',
      skipMessage: {
        countdown: 'Skip ad in {remainingTime}',
        skip: 'Skip ad',
      },
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = <AdSkipButtonConfig>this.getConfig(); // TODO get rid of generic cast
    let skipMessage = config.skipMessage;
    let skipOffset = -1;

    let updateSkipMessageHandler = () => {
      // Display this button only if ad is skippable
      // non skippable ads will return -1 for skippableAfter
      if (skipOffset >= 0) {
        this.show();
      } else {
        this.hide();
      }

      // Update the skip message on the button
      if (player.getCurrentTime() < skipOffset) {
        this.setText(StringUtils.replaceAdMessagePlaceholders(skipMessage.countdown, skipOffset, player));
        this.getDomElement().addClass(AdSkipButton.SKIPPABLE_IN_COUNTDOWN_CLASS);
      } else {
        this.setText(skipMessage.skip);
        this.getDomElement().removeClass(AdSkipButton.SKIPPABLE_IN_COUNTDOWN_CLASS);
      }
    };

    let adStartHandler = (event: AdEvent) => {
      let ad = event.ad as LinearAd;
      skipOffset = ad.skippableAfter;
      skipMessage = ad.skipMessage || config.skipMessage;

      updateSkipMessageHandler();

      player.on(player.exports.PlayerEvent.TimeChanged, updateSkipMessageHandler);
    };

    let adEndHandler = () => {
      player.off(player.exports.PlayerEvent.TimeChanged, updateSkipMessageHandler);
    };

    player.on(player.exports.PlayerEvent.AdStarted, adStartHandler);
    player.on(player.exports.PlayerEvent.AdSkipped, adEndHandler);
    player.on(player.exports.PlayerEvent.AdError, adEndHandler);
    player.on(player.exports.PlayerEvent.AdFinished, adEndHandler);

    this.onClick.subscribe(() => {
      // Try to skip the ad (this only works if it is skippable so we don't need to take extra care of that here)
      player.ads.skip();
    });
  }
}