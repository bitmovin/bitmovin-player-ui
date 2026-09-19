import { AdEvent, PlayerAPI, PlayerEvent, PlayerEventCallback } from 'bitmovin-player';
import { DOM } from '../../DOM';
import { UIInstanceManager } from '../../UIManager';
import { LocalizableText } from '../../localization/i18n';
import { Button, ButtonConfig, ButtonStyle } from '../buttons/Button';
import { Container, ContainerConfig } from '../Container';
import { Label, LabelConfig } from '../labels/Label';

// The producers spell these events differently: the web-style name and the name the mobile SDKs
// emit, which reaches the UI unmapped.
const NON_LINEAR_AD_STARTED_EVENTS = ['nonlinearadstarted', 'onNonLinearAdStarted'];
const NON_LINEAR_AD_ENDED_EVENTS = [
  'nonlinearadfinished',
  'onNonLinearAdFinished',
  'nonlinearadskipped',
  'onNonLinearAdSkipped',
];
const PAUSE_AD_ACTIVE_CLASS = 'pause-ad-active';

type NonLinearAdEventHandler = (event: AdEvent) => void;

/**
 * Full-bleed click target for the natively rendered pause-ad creative.
 *
 * The creative is drawn below the UI, which hit-tests at every point, so a tap on it has to
 * originate here and be routed back to the ad. It carries no button semantics and is not focusable:
 * it exists for pointer input only, and the controls stacked above it keep their own hit targets.
 *
 * It covers the whole player, so clicks in the letterbox area outside the creative open the
 * click-through too. That matches {@link AdClickOverlay} for linear ads, and is deliberately more
 * permissive than the iOS System UI, which hit-tests only the creative's rendered rectangle.
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
   * Text displayed on the dismiss button.
   */
  dismissText?: LocalizableText;
  /**
   * Focuses the dismiss button when the pause ad appears.
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

    this.eachNonLinearSubscription((eventType, handler) => player.on(eventType, handler));
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
    const player = this.player;
    if (player) {
      this.eachNonLinearSubscription((eventType, handler) => player.off(eventType, handler));
      player.off(player.exports.PlayerEvent.SourceUnloaded, this.hidePauseAdStatus);
    }
    this.player = undefined;
    this.uiContainerElement = undefined;
    super.release();
  }

  private readonly handleNonLinearAdStarted = (event: AdEvent): void => {
    if (!this.isPauseAdEvent(event)) {
      return;
    }

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

    this.showDismissButton();
  };

  private readonly handleNonLinearAdEnded = (event: AdEvent): void => {
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
    this.dismissButton.hide();
    this.clickCatcher.hide();
    this.clickThroughUrlOpened = undefined;
    this.hide();
    this.uiContainerElement?.removeClass(this.prefixCss(PAUSE_AD_ACTIVE_CLASS));
    this.pauseAdActive = false;
    this.activePauseAdId = undefined;
  };

  private showDismissButton(): void {
    this.dismissButton.show();
    if (this.config.focusDismissButtonOnShow) {
      this.dismissButton.getDomElement().get(0)?.focus();
    }
  }

  /**
   * Applies `apply` to every non-linear subscription this component owns.
   *
   * The non-linear ad lifecycle is not part of the Player Web API, so `PlayerEvent` has no member
   * for these names and `on`/`off` cannot be called without a cast. Routing both through here keeps
   * the cast in one place and makes it impossible for `release()` to unsubscribe a different set
   * than `configure()` subscribed.
   */
  private eachNonLinearSubscription(
    apply: (eventType: PlayerEvent, handler: PlayerEventCallback<PlayerEvent>) => void,
  ): void {
    const applyAll = (eventTypes: string[], handler: NonLinearAdEventHandler) => {
      eventTypes.forEach(eventType =>
        apply(eventType as PlayerEvent, handler as PlayerEventCallback<PlayerEvent>),
      );
    };

    applyAll(NON_LINEAR_AD_STARTED_EVENTS, this.handleNonLinearAdStarted);
    applyAll(NON_LINEAR_AD_ENDED_EVENTS, this.handleNonLinearAdEnded);
  }

  /**
   * Every non-linear ad this UI currently sees is a pause ad: the only producer emits these events
   * solely for pause ads, and the payload carries nothing that would discriminate one kind from
   * another.
   *
   * This stops holding as soon as a second non-linear format emits the same events. Reintroduce a
   * discriminator then, against whatever the Player settles on.
   */
  private isPauseAdEvent(_event: AdEvent): boolean {
    return true;
  }
}
