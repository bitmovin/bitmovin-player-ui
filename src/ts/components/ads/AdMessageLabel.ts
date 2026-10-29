import { Label, LabelConfig } from '../labels/Label';
import { i18n, LocalizableText } from '../../localization/i18n';
import { AdEvent, LinearAd, PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../../UIManager';
import { StringUtils } from '../../utils/StringUtils';
import { AdBreakTracker } from '../../utils/AdBreakTracker';

/**
 * A label that displays a message about a running ad, optionally with a countdown.
 *
 * The message text supports placeholders that are dynamically replaced with ad timing information:
 * - `{remainingTime[formatString]}` - Remaining time until the ad ends
 * - `{playedTime[formatString]}` - Current playback time of the ad
 * - `{adDuration[formatString]}` - Total duration of the current ad
 * - `{adBreakRemainingTime[formatString]}` - Remaining time for the entire ad break (including all remaining ads)
 * - `{activeAdIndex}` - Index of the currently playing ad
 * - `{totalAdsCount}` - Total number of ads
 *
 * The ad break placeholders are provided by the {@link AdBreakTracker}, which counts across ad breaks scheduled for
 * the same time and applies {@link UIConfig.adCountFilter}.
 *
 * Format string options (optional):
 * - `%d` - Integer (e.g., `{remainingTime%d}` → `100`)
 * - `%0Nd` - Integer with N leading zeros (e.g., `{remainingTime%03d}` → `100`)
 * - `%f` - Float (e.g., `{remainingTime%f}` → `100.0`)
 * - `%0Nf` - Float with leading zeros (e.g., `{remainingTime%05f}` → `100.0`)
 * - `%.Mf` - Float with M decimal places (e.g., `{remainingTime%.2f}` → `100.00`)
 * - `%hh:mm:ss` - Time format with hours (e.g., `{remainingTime%hh:mm:ss}` → `00:01:40`)
 * - `%mm:ss` - Time format without hours (e.g., `{remainingTime%mm:ss}` → `01:40`)
 *
 * Example: `{ text: 'Ad: {remainingTime%mm:ss}' }` displays "Ad: 01:40" for 100 seconds remaining.
 *
 * Note: If a LinearAd has a `uiConfig.message` property, it takes precedence over the configured `text`.
 *
 * @category Labels
 */
export class AdMessageLabel<Config extends LabelConfig = LabelConfig> extends Label<Config> {
  // The ad counts of all messages come from the tracker, so that they stay consistent across ad UI components and
  // honor UIConfig.adCountFilter and ad breaks scheduled at the same time.
  protected adBreakTracker?: AdBreakTracker;

  constructor(config: Config = {} as Config) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-ad-message-label',
      } as Config,
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    this.adBreakTracker = uimanager.getConfig().adBreakTracker;

    let ad: LinearAd;

    const updateMessageHandler = () => {
      this.setText(this.getAdMessage(player, ad));
    };

    const adStartHandler = (event: AdEvent) => {
      ad = event.ad as LinearAd;

      updateMessageHandler();

      player.on(player.exports.PlayerEvent.TimeChanged, updateMessageHandler);
    };

    const adEndHandler = () => {
      player.off(player.exports.PlayerEvent.TimeChanged, updateMessageHandler);
    };

    player.on(player.exports.PlayerEvent.AdStarted, adStartHandler);
    player.on(player.exports.PlayerEvent.AdSkipped, adEndHandler);
    player.on(player.exports.PlayerEvent.AdError, adEndHandler);
    player.on(player.exports.PlayerEvent.AdFinished, adEndHandler);
    player.on(player.exports.PlayerEvent.SourceUnloaded, adEndHandler);
  }

  release(): void {
    this.adBreakTracker = undefined;

    super.release();
  }

  /** The message to display for the given ad, before placeholders are filled in. */
  protected getMessageText(ad?: LinearAd): LocalizableText {
    return ad?.uiConfig?.message || this.config.text || '';
  }

  protected getAdMessage(player: PlayerAPI, ad?: LinearAd): string {
    return StringUtils.replaceAdMessagePlaceholders(
      i18n.performLocalization(this.getMessageText(ad)),
      player,
      undefined,
      this.adBreakTracker,
    );
  }
}
