import { ClickOverlay, ClickOverlayConfig } from '../overlays/ClickOverlay';
import { UIInstanceManager } from '../../UIManager';
import { Ad, AdEvent, PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';

/**
 * A simple click capture overlay for clickThroughUrls of ads.
 *
 * @category Components
 */
export class AdClickOverlay extends ClickOverlay {
  private readonly clickThroughTabIndex: number;
  private uimanager?: UIInstanceManager;
  private focused = false;

  constructor(config: ClickOverlayConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        acceptsTouchWithUiHidden: true,
        ariaLabel: i18n.getLocalizer('ads.clickThrough'),
      },
      this.config,
    );

    this.clickThroughTabIndex = this.config.tabIndex;
  }

  setUrl(url: string): void {
    super.setUrl(url);

    // Without a click-through URL there is nothing to open, so keep the overlay out of the tab order and hide it from
    // assistive technologies. Pointer input still reaches it.
    const hasClickThrough = Boolean(this.getUrl());
    if (!hasClickThrough) {
      this.moveFocusAway();
    }

    // Spatial navigation reads focusability from `config.tabIndex` (see `isFocusable`), so it has to follow as well
    this.config.tabIndex = hasClickThrough ? this.clickThroughTabIndex : -1;

    const element = this.getDomElement();
    element.attr('tabindex', String(this.config.tabIndex));
    if (hasClickThrough) {
      element.removeAttr('aria-hidden');
    } else {
      element.attr('aria-hidden', 'true');
    }
  }

  /**
   * Moves the focus to the UI container when the overlay is focused, so it is not left on an element that is hidden
   * from assistive technologies.
   */
  private moveFocusAway(): void {
    if (!this.focused) {
      return;
    }

    this.uimanager?.getUI().getDomElement().get(0).focus();

    // Fall back to blurring if the UI container could not take the focus
    if (this.focused) {
      this.getDomElement().get(0).blur();
    }
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.uimanager = uimanager;
    this.onFocusedChanged.subscribe((_, args) => {
      this.focused = args.focused;
    });

    let clickThroughCallback: () => void = null;

    player.on(player.exports.PlayerEvent.AdStarted, (event: AdEvent) => {
      const ad = event.ad;
      this.setUrl(ad.clickThroughUrl);
      clickThroughCallback = ad.clickThroughUrlOpened;
    });

    // Clear click-through URL when ad has finished
    const adFinishedHandler = () => {
      this.setUrl(null);
    };

    player.on(player.exports.PlayerEvent.AdFinished, adFinishedHandler);
    player.on(player.exports.PlayerEvent.AdSkipped, adFinishedHandler);
    player.on(player.exports.PlayerEvent.AdError, adFinishedHandler);

    this.onClick.subscribe(() => {
      // Pause the ad when overlay is clicked
      player.pause('ui-ad-click-overlay');

      if (clickThroughCallback) {
        clickThroughCallback();
      }
    });
  }
}
