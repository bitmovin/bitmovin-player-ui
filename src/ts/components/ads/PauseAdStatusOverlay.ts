import { Ad, AdEvent, PlayerAPI } from 'bitmovin-player';
import { DOM } from '../../DOM';
import { UIInstanceManager } from '../../UIManager';
import { LocalizableText } from '../../localization/i18n';
import { Timeout } from '../../utils/Timeout';
import { Button, ButtonConfig, ButtonStyle } from '../buttons/Button';
import { Container, ContainerConfig } from '../Container';
import { Label, LabelConfig } from '../labels/Label';

const NON_LINEAR_AD_STARTED_EVENT = 'nonlinearadstarted';
const NON_LINEAR_AD_FINISHED_EVENT = 'nonlinearadfinished';
const NON_LINEAR_AD_SKIPPED_EVENT = 'nonlinearadskipped';
const NATIVE_NON_LINEAR_AD_STARTED_EVENT = 'onNonLinearAdStarted';
const NATIVE_NON_LINEAR_AD_FINISHED_EVENT = 'onNonLinearAdFinished';
const NATIVE_NON_LINEAR_AD_SKIPPED_EVENT = 'onNonLinearAdSkipped';
const PAUSE_AD_ACTIVE_CLASS = 'pause-ad-active';
const SECONDS_TO_MILLISECONDS = 1000;

// Remove the transitional position variants once the Player exposes a typed non-linear ad lifecycle contract.
interface NonLinearAd extends Ad {
  position?: string;
  dismissibleAfter?: number;
  skippableAfter?: number;
}

interface NonLinearAdEvent extends AdEvent {
  position?: string;
  trigger?: string;
  dismissibleAfter?: number;
  skippableAfter?: number;
  ad: NonLinearAd;
  adBreak?: {
    position?: string;
    dismissibleAfter?: number;
    skippableAfter?: number;
  };
}

/**
 * Full-bleed click target for the natively rendered pause-ad creative.
 *
 * The creative is drawn below the UI, which hit-tests at every point, so a tap on it has to
 * originate here and be routed back to the ad. It carries no button semantics and is not focusable:
 * it exists for pointer input only, and the controls stacked above it keep their own hit targets.
 */
class PauseAdClickCatcher extends Button<ButtonConfig> {
  constructor(config: ButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-pause-ad-click-catcher',
        buttonStyle: ButtonStyle.Text,
        role: null,
        tabIndex: -1,
        hidden: true,
        acceptsTouchWithUiHidden: true,
      },
      this.config,
    );
  }
}

/**
 * Configuration interface for the {@link PauseAdStatusOverlay}.
 *
 * @category Configs
 */
export interface PauseAdStatusOverlayConfig extends ContainerConfig {
  /**
   * Text displayed while a pause ad is active.
   */
  badgeText?: LocalizableText;
  /**
   * Fallback delay in milliseconds before showing the dismiss button when the ad does not provide `skippableAfter`.
   * Set to a negative value to disable the dismiss button.
   */
  dismissDelay?: number;
  /**
   * Text displayed on the dismiss button.
   */
  dismissText?: LocalizableText;
  /**
   * Focuses the dismiss button when it becomes visible.
   */
  focusDismissButtonOnShow?: boolean;
}

/**
 * An overlay holding status controls for pause ads.
 *
 * @category Components
 */
export class PauseAdStatusOverlay extends Container<PauseAdStatusOverlayConfig> {
  private readonly badgeLabel: Label<LabelConfig>;
  private readonly clickCatcher: PauseAdClickCatcher;
  private readonly dismissButton: Button<ButtonConfig>;
  private clickThroughUrlOpened?: () => void;
  private dismissDelayTimeout?: Timeout;
  private player?: PlayerAPI;
  private uiContainerElement?: DOM;
  private pauseAdActive = false;
  private activePauseAdId?: string;

  constructor(config: PauseAdStatusOverlayConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        badgeText: 'Ad',
        dismissDelay: 4000,
        dismissText: 'Dismiss',
        focusDismissButtonOnShow: false,
        hidden: true,
        cssClass: 'ui-pause-ad-status-overlay',
      },
      this.config,
    );

    this.badgeLabel = new Label({
      cssClass: 'ui-pause-ad-status-badge',
      text: this.config.badgeText,
    });
    this.clickCatcher = new PauseAdClickCatcher();
    this.dismissButton = new Button({
      cssClass: 'ui-button-pause-ad-dismiss',
      text: this.config.dismissText,
      ariaLabel: this.config.dismissText,
      buttonStyle: ButtonStyle.TextWithTrailingIcon,
      hidden: true,
      acceptsTouchWithUiHidden: true,
    });

    // The catcher comes first so the badge, the dismiss button and the control bar all stack above
    // it and keep receiving their own clicks.
    this.config.components = [this.clickCatcher, this.badgeLabel, this.dismissButton];
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    this.player = player;
    this.uiContainerElement = uimanager.getUI().getDomElement();

    player.on(NON_LINEAR_AD_STARTED_EVENT as any, this.handleNonLinearAdStarted as any);
    player.on(NATIVE_NON_LINEAR_AD_STARTED_EVENT as any, this.handleNonLinearAdStarted as any);
    player.on(NON_LINEAR_AD_FINISHED_EVENT as any, this.handleNonLinearAdEnded as any);
    player.on(NATIVE_NON_LINEAR_AD_FINISHED_EVENT as any, this.handleNonLinearAdEnded as any);
    player.on(NON_LINEAR_AD_SKIPPED_EVENT as any, this.handleNonLinearAdEnded as any);
    player.on(NATIVE_NON_LINEAR_AD_SKIPPED_EVENT as any, this.handleNonLinearAdEnded as any);
    player.on(player.exports.PlayerEvent.SourceUnloaded, this.hidePauseAdStatus);

    this.clickCatcher.onClick.subscribe(() => {
      this.clickThroughUrlOpened?.();
    });

    this.dismissButton.onClick.subscribe(() => {
      this.hidePauseAdStatus();
      player.ads.skip();
    });
  }

  release(): void {
    this.hidePauseAdStatus();
    if (this.player) {
      this.player.off(NON_LINEAR_AD_STARTED_EVENT as any, this.handleNonLinearAdStarted as any);
      this.player.off(NATIVE_NON_LINEAR_AD_STARTED_EVENT as any, this.handleNonLinearAdStarted as any);
      this.player.off(NON_LINEAR_AD_FINISHED_EVENT as any, this.handleNonLinearAdEnded as any);
      this.player.off(NATIVE_NON_LINEAR_AD_FINISHED_EVENT as any, this.handleNonLinearAdEnded as any);
      this.player.off(NON_LINEAR_AD_SKIPPED_EVENT as any, this.handleNonLinearAdEnded as any);
      this.player.off(NATIVE_NON_LINEAR_AD_SKIPPED_EVENT as any, this.handleNonLinearAdEnded as any);
      this.player.off(this.player.exports.PlayerEvent.SourceUnloaded, this.hidePauseAdStatus);
    }
    this.player = undefined;
    this.uiContainerElement = undefined;
    super.release();
  }

  private readonly handleNonLinearAdStarted = (event: NonLinearAdEvent): void => {
    if (!this.isPauseAdEvent(event)) {
      return;
    }

    this.clearDismissDelay();
    this.dismissButton.hide();
    this.clickCatcher.hide();
    this.show();
    this.uiContainerElement?.addClass(this.prefixCss(PAUSE_AD_ACTIVE_CLASS));
    this.pauseAdActive = true;
    this.activePauseAdId = event.ad?.id;

    // Without a click-through destination there is nothing to route, so the whole creative area
    // stays transparent to pointer input.
    this.clickThroughUrlOpened = event.ad?.clickThroughUrlOpened;
    if (event.ad?.clickThroughUrl) {
      this.clickCatcher.show();
    }

    const dismissDelay = this.getDismissDelay(event);
    if (dismissDelay === 0) {
      this.showDismissButton();
    } else if (dismissDelay > 0) {
      this.dismissDelayTimeout = new Timeout(dismissDelay, () => this.showDismissButton()).start();
    }
  };

  private readonly handleNonLinearAdEnded = (event: NonLinearAdEvent): void => {
    if (!this.pauseAdActive) {
      return;
    }

    const eventAdId = event.ad?.id;
    if (this.activePauseAdId && eventAdId && this.activePauseAdId !== eventAdId) {
      return;
    }

    const matchesActiveAd = this.activePauseAdId && eventAdId === this.activePauseAdId;
    if (this.isPauseAdEvent(event) || matchesActiveAd) {
      this.hidePauseAdStatus();
    }
  };

  private readonly hidePauseAdStatus = (): void => {
    this.clearDismissDelay();
    this.dismissButton.hide();
    this.clickCatcher.hide();
    this.clickThroughUrlOpened = undefined;
    this.hide();
    this.uiContainerElement?.removeClass(this.prefixCss(PAUSE_AD_ACTIVE_CLASS));
    this.pauseAdActive = false;
    this.activePauseAdId = undefined;
  };

  private clearDismissDelay(): void {
    this.dismissDelayTimeout?.clear();
    this.dismissDelayTimeout = undefined;
  }

  private showDismissButton(): void {
    this.dismissButton.show();
    if (this.config.focusDismissButtonOnShow) {
      this.dismissButton.getDomElement().get(0)?.focus();
    }
  }

  private getDismissDelay(event: NonLinearAdEvent): number {
    const skippableAfter =
      event.dismissibleAfter ??
      event.ad?.dismissibleAfter ??
      event.adBreak?.dismissibleAfter ??
      event.skippableAfter ??
      event.ad?.skippableAfter ??
      event.adBreak?.skippableAfter;
    if (typeof skippableAfter === 'number' && Number.isFinite(skippableAfter)) {
      return skippableAfter < 0 ? -1 : skippableAfter * SECONDS_TO_MILLISECONDS;
    }

    return this.config.dismissDelay;
  }

  /**
   * Every non-linear ad this UI currently sees is a pause ad: iOS emits these events only for pause
   * ads, and provides neither `trigger` nor `position` to distinguish them.
   *
   * This stops holding as soon as a second producer emits `nonlinearadstarted` for something that is
   * not a pause ad, which the Web player will do for its existing `OverlayAdManager` banners. Restore
   * the `trigger`/`position` check then, against whatever the Player settles on.
   */
  private isPauseAdEvent(_event: NonLinearAdEvent): boolean {
    return true;
  }
}
