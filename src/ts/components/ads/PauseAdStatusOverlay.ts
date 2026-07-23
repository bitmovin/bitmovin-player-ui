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
const PAUSE_AD_POSITION = 'pause';
const PAUSE_AD_ACTIVE_CLASS = 'pause-ad-active';
const SECONDS_TO_MILLISECONDS = 1000;

// Remove the transitional position variants once the Player exposes a typed non-linear ad lifecycle contract.
interface NonLinearAd extends Ad {
  position?: string;
  skippableAfter?: number;
}

interface NonLinearAdEvent extends AdEvent {
  position?: string;
  skippableAfter?: number;
  ad: NonLinearAd;
  adBreak?: {
    position?: string;
    skippableAfter?: number;
  };
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
}

/**
 * An overlay holding status controls for pause ads.
 *
 * @category Components
 */
export class PauseAdStatusOverlay extends Container<PauseAdStatusOverlayConfig> {
  private readonly badgeLabel: Label<LabelConfig>;
  private readonly dismissButton: Button<ButtonConfig>;
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
        hidden: true,
        cssClass: 'ui-pause-ad-status-overlay',
      },
      this.config,
    );

    this.badgeLabel = new Label({
      cssClass: 'ui-pause-ad-status-badge',
      text: this.config.badgeText,
    });
    this.dismissButton = new Button({
      cssClass: 'ui-button-pause-ad-dismiss',
      text: this.config.dismissText,
      ariaLabel: this.config.dismissText,
      buttonStyle: ButtonStyle.TextWithTrailingIcon,
      hidden: true,
      acceptsTouchWithUiHidden: true,
    });

    this.config.components = [this.badgeLabel, this.dismissButton];
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    this.player = player;
    this.uiContainerElement = uimanager.getUI().getDomElement();

    player.on(NON_LINEAR_AD_STARTED_EVENT as any, this.handleNonLinearAdStarted as any);
    player.on(NON_LINEAR_AD_FINISHED_EVENT as any, this.handleNonLinearAdEnded as any);
    player.on(NON_LINEAR_AD_SKIPPED_EVENT as any, this.handleNonLinearAdEnded as any);
    player.on(player.exports.PlayerEvent.SourceUnloaded, this.hidePauseAdStatus);

    this.dismissButton.onClick.subscribe(() => {
      this.hidePauseAdStatus();
      player.ads.skip();
    });
  }

  release(): void {
    this.hidePauseAdStatus();
    if (this.player) {
      this.player.off(NON_LINEAR_AD_STARTED_EVENT as any, this.handleNonLinearAdStarted as any);
      this.player.off(NON_LINEAR_AD_FINISHED_EVENT as any, this.handleNonLinearAdEnded as any);
      this.player.off(NON_LINEAR_AD_SKIPPED_EVENT as any, this.handleNonLinearAdEnded as any);
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
    this.show();
    this.uiContainerElement?.addClass(this.prefixCss(PAUSE_AD_ACTIVE_CLASS));
    this.pauseAdActive = true;
    this.activePauseAdId = event.ad?.id;

    const dismissDelay = this.getDismissDelay(event);
    if (dismissDelay === 0) {
      this.dismissButton.show();
    } else if (dismissDelay > 0) {
      this.dismissDelayTimeout = new Timeout(dismissDelay, () => this.dismissButton.show()).start();
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
    this.hide();
    this.uiContainerElement?.removeClass(this.prefixCss(PAUSE_AD_ACTIVE_CLASS));
    this.pauseAdActive = false;
    this.activePauseAdId = undefined;
  };

  private clearDismissDelay(): void {
    this.dismissDelayTimeout?.clear();
    this.dismissDelayTimeout = undefined;
  }

  private getDismissDelay(event: NonLinearAdEvent): number {
    const skippableAfter = event.skippableAfter ?? event.ad?.skippableAfter ?? event.adBreak?.skippableAfter;
    if (typeof skippableAfter === 'number' && Number.isFinite(skippableAfter)) {
      return skippableAfter < 0 ? -1 : skippableAfter * SECONDS_TO_MILLISECONDS;
    }

    return this.config.dismissDelay;
  }

  private isPauseAdEvent(event: NonLinearAdEvent): boolean {
    const position = event.position ?? event.ad?.position ?? event.adBreak?.position;
    return position === PAUSE_AD_POSITION;
  }
}
