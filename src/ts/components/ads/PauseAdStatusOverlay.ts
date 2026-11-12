import { Ad, AdEvent, PlayerAPI, PlayerEvent, PlayerEventCallback } from 'bitmovin-player';
import { DOM } from '../../DOM';
import { UIInstanceManager } from '../../UIManager';
import { i18n } from '../../localization/i18n';
import { ClickThroughUtils } from '../../utils/ClickThroughUtils';
import { NON_LINEAR_AD_ENDED_EVENTS, NON_LINEAR_AD_STARTED_EVENT } from '../../utils/NonLinearAdEvents';
import { Button, ButtonConfig, ButtonStyle } from '../buttons/Button';
import { Container, ContainerConfig } from '../Container';
import { Label } from '../labels/Label';

const PAUSE_AD_ACTIVE_CLASS = 'pause-ad-active';
// Custom property on the UI container that tells sibling components, such as the title bar, how much
// space the status row occupies at the top of the player.
const STATUS_ROW_HEIGHT_PROPERTY = 'pause-ad-status-row-height';

/**
 * Player-sized click target for a pause ad rendered below the UI.
 * It supports pointer input only; visible controls remain above it and receive their own clicks.
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

    // Base Button overrides must not turn this pointer-only target into a focusable control.
    this.config.role = null;
    this.config.tabIndex = -1;
  }

  protected toDomElement(): DOM {
    const element = super.toDomElement();
    element.attr('aria-hidden', 'true');
    element.on('mousedown', event => event.preventDefault());
    return element;
  }
}

/**
 * An overlay holding status controls for pause ads.
 *
 * @category Components
 */
export class PauseAdStatusOverlay extends Container<ContainerConfig> {
  /**
   * Button that ends the pause ad. Exposed so a navigation group can make it the first focus target
   * for remote-controlled platforms.
   */
  public readonly dismissButton: Button<ButtonConfig>;
  /**
   * Button that opens the pause ad's click-through. It is the keyboard and assistive technology equivalent of
   * clicking the creative, and is only shown when the ad has an http or https click-through destination.
   */
  public readonly clickThroughButton: Button<ButtonConfig>;
  private readonly clickCatcher: PauseAdClickCatcher;
  private uiContainerElement?: DOM;
  private activePauseAd?: Ad;
  private statusRowResizeObserver?: ResizeObserver;

  constructor(config: ContainerConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        hidden: true,
        cssClass: 'ui-pause-ad-status-overlay',
      },
      this.config,
    );

    const badgeLabel = new Label({
      cssClass: 'ui-pause-ad-status-badge',
      text: i18n.getLocalizer('ad'),
    });
    this.clickCatcher = new PauseAdClickCatcher();
    this.dismissButton = new Button({
      cssClass: 'ui-button-pause-ad-dismiss',
      text: i18n.getLocalizer('close'),
      ariaLabel: i18n.getLocalizer('close'),
      buttonStyle: ButtonStyle.TextWithTrailingIcon,
      hidden: true,
      acceptsTouchWithUiHidden: true,
    });
    this.clickThroughButton = new Button({
      cssClass: 'ui-button-pause-ad-click-through',
      text: i18n.getLocalizer('ads.learnMore'),
      ariaLabel: i18n.getLocalizer('ads.learnMore.newTab'),
      buttonStyle: ButtonStyle.Text,
      hidden: true,
      acceptsTouchWithUiHidden: true,
    });

    // The catcher comes first so visible controls remain above it.
    this.config.components = [this.clickCatcher, badgeLabel, this.clickThroughButton, this.dismissButton];
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    this.uiContainerElement = uimanager.getUI().getDomElement();

    player.on(
      NON_LINEAR_AD_STARTED_EVENT as PlayerEvent,
      this.handleNonLinearAdStarted as PlayerEventCallback<PlayerEvent>,
    );
    NON_LINEAR_AD_ENDED_EVENTS.forEach(eventType => {
      player.on(eventType as PlayerEvent, this.handleNonLinearAdEnded as PlayerEventCallback<PlayerEvent>);
    });
    player.on(player.exports.PlayerEvent.SourceUnloaded, this.hidePauseAdStatus);
    // Fallback for platforms without ResizeObserver, where the row height is only measured at these points.
    player.on(player.exports.PlayerEvent.PlayerResized, this.updateStatusRowHeight);

    this.clickCatcher.onClick.subscribe(() => {
      this.getClickThroughAction()?.();
    });
    this.clickThroughButton.onClick.subscribe(() => {
      this.getClickThroughAction()?.();
    });

    // The player may decline the skip, e.g. before the ad becomes dismissible, so the status stays
    // visible until the ad's terminal event arrives.
    this.dismissButton.onClick.subscribe(() => {
      player.ads.skip();
    });
  }

  protected onLanguageChanged(): void {
    super.onLanguageChanged();

    // Buttons only update their visible text on a language change. The accessible name has to follow, so that it
    // still contains the visible text, e.g. for speech input users.
    if (this.clickThroughButton.hasDomElement()) {
      this.clickThroughButton.setAriaLabel(this.clickThroughButton.getConfig().ariaLabel);
    }
  }

  release(): void {
    this.hidePauseAdStatus();
    this.uiContainerElement = undefined;
    super.release();
  }

  /**
   * Captures the active creative's click-through action for an external input surface.
   * Like linear ads (see `AdClickOverlay`), the action opens the destination and then reports it
   * through `clickThroughUrlOpened`, which only tracks the click.
   * The action becomes a no-op when this ad ends or is replaced, or this overlay becomes hidden.
   * Returns `undefined` when there is no click-through destination. A destination other than an http or https URL
   * counts as none: it is neither opened nor reported.
   */
  getClickThroughAction(): (() => void) | undefined {
    const ad = this.activePauseAd;
    if (!ClickThroughUtils.getSafeUrl(ad?.clickThroughUrl)) {
      return undefined;
    }

    return () => {
      if (this.activePauseAd === ad && this.isShown() && ClickThroughUtils.open(ad.clickThroughUrl)) {
        ad.clickThroughUrlOpened?.();
      }
    };
  }

  private readonly handleNonLinearAdStarted = (event: AdEvent): void => {
    if (!event.ad) {
      return;
    }

    this.activePauseAd = event.ad;

    // Without a destination that can be opened, clicks continue to reach the controls below.
    if (ClickThroughUtils.getSafeUrl(event.ad.clickThroughUrl)) {
      this.clickCatcher.show();
      this.clickThroughButton.show();
    } else {
      this.clickCatcher.hide();
      this.clickThroughButton.hide();
    }

    // All controls have to be in their final state before the overlay becomes visible: showing the
    // overlay activates the pause-ad navigation group, which focuses the first component it finds
    // focusable at that moment.
    this.dismissButton.show();
    this.show();
    this.uiContainerElement?.addClass(this.prefixCss(PAUSE_AD_ACTIVE_CLASS));
    this.trackStatusRowHeight();
  };

  /**
   * The status row wraps onto further rows in narrow players or with long translations, so the space it needs is only
   * known after layout. It is published on the UI container, so that other components can keep clear of it.
   */
  private trackStatusRowHeight(): void {
    this.updateStatusRowHeight();

    const statusRow = this.innerContainerElement.get(0);
    if (!this.statusRowResizeObserver && statusRow && typeof ResizeObserver !== 'undefined') {
      this.statusRowResizeObserver = new ResizeObserver(this.updateStatusRowHeight);
      this.statusRowResizeObserver.observe(statusRow);
    }
  }

  private readonly updateStatusRowHeight = (): void => {
    const uiContainer = this.uiContainerElement?.get(0);
    const statusRow = this.innerContainerElement?.get(0);
    if (!this.activePauseAd || !uiContainer || !statusRow) {
      return;
    }

    uiContainer.style.setProperty(`--${this.prefixCss(STATUS_ROW_HEIGHT_PROPERTY)}`, `${statusRow.offsetHeight}px`);
  };

  private stopTrackingStatusRowHeight(): void {
    this.statusRowResizeObserver?.disconnect();
    this.statusRowResizeObserver = undefined;
    this.uiContainerElement?.get(0)?.style.removeProperty(`--${this.prefixCss(STATUS_ROW_HEIGHT_PROPERTY)}`);
  }

  private readonly handleNonLinearAdEnded = (event: AdEvent): void => {
    if (!this.activePauseAd) {
      return;
    }

    const eventAdId = event.ad?.id;
    if (this.activePauseAd.id && eventAdId && this.activePauseAd.id !== eventAdId) {
      return;
    }

    this.hidePauseAdStatus();
  };

  private readonly hidePauseAdStatus = (): void => {
    this.dismissButton.hide();
    this.clickThroughButton.hide();
    this.clickCatcher.hide();
    this.activePauseAd = undefined;
    this.stopTrackingStatusRowHeight();
    this.uiContainerElement?.removeClass(this.prefixCss(PAUSE_AD_ACTIVE_CLASS));
    this.hide();
  };
}
