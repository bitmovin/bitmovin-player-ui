import { Button, ButtonConfig, ButtonStyle } from '../buttons/Button';
import { UIInstanceManager } from '../../UIManager';
import { StringUtils } from '../../utils/StringUtils';
import { AdEvent, LinearAd, PlayerAPI } from 'bitmovin-player';
import { i18n, LocalizableText } from '../../localization/i18n';

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
  untilSkippableMessage?: LocalizableText;
  /**
   * Message displayed when the ad is skippable.
   * Supported placeholders: look at {@link StringUtils.replaceAdMessagePlaceholders}
   */
  skippableMessage?: LocalizableText;
}

/**
 * A button that is displayed during ads and can be used to skip the ad.
 *
 * @category Buttons
 */
export class AdSkipButton extends Button<AdSkipButtonConfig> {
  private updateSkipMessageHandler?: () => void;
  private untilSkippableMessage?: LocalizableText;
  private skippableMessage?: LocalizableText;
  private skipOffset: number = -1;
  private player?: PlayerAPI;
  private onLanguageChanged = () => {
    if (this.updateSkipMessageHandler && typeof this.skipOffset === 'number' && this.skipOffset >= 0) {
      this.updateSkipMessageHandler();
    }
  };

  constructor(config: AdSkipButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      <AdSkipButtonConfig>{
        cssClass: 'ui-button-ad-skip',
        untilSkippableMessage: i18n.getLocalizer('ads.skippableIn'),
        skippableMessage: i18n.getLocalizer('ads.skip'),
        acceptsTouchWithUiHidden: true,
        buttonStyle: ButtonStyle.TextWithTrailingIcon,
      },
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    this.player = player;

    const config = this.getConfig();
    this.untilSkippableMessage = config.untilSkippableMessage;
    this.skippableMessage = config.skippableMessage;
    this.skipOffset = -1;

    this.updateSkipMessageHandler = () => {
      this.show();

      // Update the skip message on the button
      if (player.getCurrentTime() < this.skipOffset) {
        this.setText(
          StringUtils.replaceAdMessagePlaceholders(
            i18n.performLocalization(this.untilSkippableMessage),
            player,
            this.skipOffset,
          ),
        );
        this.disable();
      } else {
        this.setText(StringUtils.replaceAdMessagePlaceholders(i18n.performLocalization(this.skippableMessage), player));
        this.enable();
      }
    };

    const adStartHandler = (event: AdEvent) => {
      const ad = event.ad as LinearAd;
      this.skipOffset = ad.skippableAfter;
      this.untilSkippableMessage = (ad.uiConfig && ad.uiConfig.untilSkippableMessage) || config.untilSkippableMessage;
      this.skippableMessage = (ad.uiConfig && ad.uiConfig.skippableMessage) || config.skippableMessage;

      // Display this button only if ad is skippable.
      // Non-skippable ads will return -1 for skippableAfter for player version < v8.3.0.
      if (typeof this.skipOffset === 'number' && this.skipOffset >= 0) {
        this.updateSkipMessageHandler();
        player.on(player.exports.PlayerEvent.TimeChanged, this.updateSkipMessageHandler);
      } else {
        this.hide();
      }
    };

    const adEndHandler = () => {
      if (this.updateSkipMessageHandler) {
        player.off(player.exports.PlayerEvent.TimeChanged, this.updateSkipMessageHandler);
      }
    };

    player.on(player.exports.PlayerEvent.AdStarted, adStartHandler);
    player.on(player.exports.PlayerEvent.AdSkipped, adEndHandler);
    player.on(player.exports.PlayerEvent.AdError, adEndHandler);
    player.on(player.exports.PlayerEvent.AdFinished, adEndHandler);

    this.onClick.subscribe(() => {
      // Try to skip the ad (this only works if it is skippable so we don't need to take extra care of that here)
      player.ads.skip();
    });

    i18n.getConfig().events.onLanguageChanged.subscribe(this.onLanguageChanged);
  }

  release(): void {
    if (this.player && this.updateSkipMessageHandler) {
      this.player.off(this.player.exports.PlayerEvent.TimeChanged, this.updateSkipMessageHandler);
    }
    i18n.getConfig().events.onLanguageChanged.unsubscribe(this.onLanguageChanged);
    super.release();
  }
}
