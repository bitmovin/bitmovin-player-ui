import { Ad, AdEvent, PlayerAPI, PlayerEvent, PlayerEventCallback } from 'bitmovin-player';
import { DOM } from '../../DOM';
import { UIInstanceManager } from '../../UIManager';
import { i18n, LocalizableText } from '../../localization/i18n';
import { NON_LINEAR_AD_ENDED_EVENTS, NON_LINEAR_AD_STARTED_EVENTS } from '../../utils/NonLinearAdEvents';
import { Button, ButtonConfig, ButtonStyle } from '../buttons/Button';
import { ComponentConfig } from '../Component';
import { Container, ContainerConfig } from '../Container';
import { Label, LabelConfig } from '../labels/Label';

const PAUSE_AD_ACTIVE_CLASS = 'pause-ad-active';

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
 * Configuration interface for the {@link PauseAdStatusOverlay}.
 *
 * @category Configs
 */
export interface PauseAdStatusOverlayConfig extends ComponentConfig {
  /**
   * Text displayed while a pause ad is active.
   */
  badgeText?: LocalizableText;
  /**
   * Text displayed on the dismiss button.
   */
  dismissText?: LocalizableText;
}

/**
 * An overlay holding status controls for pause ads.
 *
 * @category Components
 */
export class PauseAdStatusOverlay extends Container<PauseAdStatusOverlayConfig> {
  /**
   * Button that ends the pause ad. Exposed so a navigation group can make it the first focus target
   * for remote-controlled platforms.
   */
  public readonly dismissButton: Button<ButtonConfig>;
  private readonly clickCatcher: PauseAdClickCatcher;
  private uiContainerElement?: DOM;
  private activePauseAd?: Ad;

  constructor(config: PauseAdStatusOverlayConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        badgeText: i18n.getLocalizer('ad'),
        dismissText: i18n.getLocalizer('close'),
        hidden: true,
        cssClass: 'ui-pause-ad-status-overlay',
      },
      this.config,
    );

    const badgeLabel = new Label({
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

    // The catcher comes first so visible controls remain above it.
    (this.config as ContainerConfig).components = [this.clickCatcher, badgeLabel, this.dismissButton];
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    this.uiContainerElement = uimanager.getUI().getDomElement();

    NON_LINEAR_AD_STARTED_EVENTS.forEach(eventType => {
      player.on(eventType as PlayerEvent, this.handleNonLinearAdStarted as PlayerEventCallback<PlayerEvent>);
    });
    NON_LINEAR_AD_ENDED_EVENTS.forEach(eventType => {
      player.on(eventType as PlayerEvent, this.handleNonLinearAdEnded as PlayerEventCallback<PlayerEvent>);
    });
    player.on(player.exports.PlayerEvent.SourceUnloaded, this.hidePauseAdStatus);

    this.clickCatcher.onClick.subscribe(() => {
      this.getClickThroughAction()?.();
    });

    // The player may decline the skip, e.g. before the ad becomes dismissible, so the status stays
    // visible until the ad's terminal event arrives.
    this.dismissButton.onClick.subscribe(() => {
      player.ads.skip();
    });
  }

  release(): void {
    this.hidePauseAdStatus();
    this.uiContainerElement = undefined;
    super.release();
  }

  /**
   * Captures the active creative's click-through action for an external input surface.
   * The action becomes a no-op when this ad ends or is replaced, or this overlay becomes hidden.
   * Returns `undefined` when there is no click-through destination.
   */
  getClickThroughAction(): (() => void) | undefined {
    const ad = this.activePauseAd;
    if (!ad?.clickThroughUrl) {
      return undefined;
    }

    return () => {
      if (this.activePauseAd === ad && this.isShown()) {
        ad.clickThroughUrlOpened?.();
      }
    };
  }

  private readonly handleNonLinearAdStarted = (event: AdEvent): void => {
    if (!event.ad) {
      return;
    }

    this.activePauseAd = event.ad;

    // Without a destination, clicks continue to reach the controls below.
    if (event.ad.clickThroughUrl) {
      this.clickCatcher.show();
    } else {
      this.clickCatcher.hide();
    }

    // Both controls have to be in their final state before the overlay becomes visible: showing the
    // overlay activates the pause-ad navigation group, which focuses the first component it finds
    // focusable at that moment.
    this.dismissButton.show();
    this.show();
    this.uiContainerElement?.addClass(this.prefixCss(PAUSE_AD_ACTIVE_CLASS));
  };

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
    this.clickCatcher.hide();
    this.activePauseAd = undefined;
    this.hide();
    this.uiContainerElement?.removeClass(this.prefixCss(PAUSE_AD_ACTIVE_CLASS));
  };
}
