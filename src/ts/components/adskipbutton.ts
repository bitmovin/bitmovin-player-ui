import { ButtonConfig, Button } from './button';
import { UIInstanceManager } from '../uimanager';
import { StringUtils } from '../stringutils';
import { AdEvent, LinearAd, PlayerAPI } from 'bitmovin-player';

/**
 * Configuration interface for the {@link AdSkipButton}.
 *
 * @category Configs
 */
export interface AdSkipButtonConfig extends ButtonConfig {
  /**
   * Message which gets displayed during the countdown is active.
   * Supported placeholders: look at {@link StringUtils.replaceAdMessagePlaceholders}
   */
  untilSkippableMessage?: string;
  /**
   * Message displayed when the ad is skippable.
   * Supported placeholders: look at {@link StringUtils.replaceAdMessagePlaceholders}
   */
  skippableMessage?: string;
}

/**
 * A button that is displayed during ads and can be used to skip the ad.
 *
 * @category Buttons
 */
export class AdSkipButton extends Button<AdSkipButtonConfig> {

  constructor(config: AdSkipButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, <AdSkipButtonConfig>{
      cssClass: 'ui-button-ad-skip',
      untilSkippableMessage: 'Skip ad in {remainingTime}',
      skippableMessage: 'Skip ad',
      acceptsTouchWithUiHidden: true,
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();
    let untilSkippableMessage = config.untilSkippableMessage;
    let skippableMessage = config.skippableMessage;
    let skipOffset = -1;

    let updateSkipMessageHandler = () => {
      this.show();

      // Update the skip message on the button
      if (player.getCurrentTime() < skipOffset) {
        this.setText(StringUtils.replaceAdMessagePlaceholders(untilSkippableMessage, skipOffset, player));
        this.disable();
      } else {
        this.setText(skippableMessage);
        this.enable();
      }
    };

    let adStartHandler = (event: AdEvent) => {
      let ad = event.ad as LinearAd;
      skipOffset = ad.skippableAfter;
      untilSkippableMessage = ad.uiConfig && ad.uiConfig.untilSkippableMessage || config.untilSkippableMessage;
      skippableMessage = ad.uiConfig && ad.uiConfig.skippableMessage || config.skippableMessage;

      // Display this button only if ad is skippable.
      // Non-skippable ads will return -1 for skippableAfter for player version < v8.3.0.
      if (typeof skipOffset === 'number' && skipOffset >= 0) {
        updateSkipMessageHandler();
        player.on(player.exports.PlayerEvent.TimeChanged, updateSkipMessageHandler);
      } else {
        this.hide();
      }
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