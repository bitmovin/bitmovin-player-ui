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
  private readonly clickCatcher: PauseAdClickCatcher;
  private readonly dismissButton: Button<ButtonConfig>;
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
      this.activePauseAd?.clickThroughUrlOpened?.();
    });

    this.dismissButton.onClick.subscribe(() => {
      this.hidePauseAdStatus();
      player.ads.skip();
    });
  }

  release(): void {
    this.hidePauseAdStatus();
    this.uiContainerElement = undefined;
    super.release();
  }

  private readonly handleNonLinearAdStarted = (event: AdEvent): void => {
    if (!event.ad) {
      return;
    }

    this.dismissButton.hide();
    this.clickCatcher.hide();
    this.show();
    this.uiContainerElement?.addClass(this.prefixCss(PAUSE_AD_ACTIVE_CLASS));
    this.activePauseAd = event.ad;

    // Without a destination, clicks continue to reach the controls below.
    if (event.ad.clickThroughUrl) {
      this.clickCatcher.show();
    }

    this.dismissButton.show();
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
