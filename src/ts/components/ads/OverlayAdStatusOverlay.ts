import { AdEvent, PlayerAPI } from 'bitmovin-player';
import { DOM } from '../../DOM';
import { UIInstanceManager } from '../../UIManager';
import { LocalizableText } from '../../localization/i18n';
import { Timeout } from '../../utils/Timeout';
import { Button, ButtonConfig, ButtonStyle } from '../buttons/Button';
import { Container, ContainerConfig } from '../Container';
import { Label, LabelConfig } from '../labels/Label';

const OVERLAY_AD_FINISHED_EVENT = 'overlayadfinished';
const OVERLAY_AD_ACTIVE_CLASS = 'overlay-ad-active';

/**
 * Configuration interface for the {@link OverlayAdStatusOverlay}.
 *
 * @category Configs
 */
export interface OverlayAdStatusOverlayConfig extends ContainerConfig {
  /**
   * Text displayed while an overlay ad is active.
   */
  badgeText?: LocalizableText;
  /**
   * Delay in milliseconds before showing the dismiss button. Set to a negative value to disable the dismiss button.
   */
  skipDelay?: number;
  /**
   * Text displayed on the dismiss button.
   */
  skipText?: LocalizableText;
}

/**
 * An overlay holding status controls for non-linear overlay ads.
 *
 * @category Components
 */
export class OverlayAdStatusOverlay extends Container<OverlayAdStatusOverlayConfig> {
  private readonly badgeLabel: Label<LabelConfig>;
  private readonly skipButton: Button<ButtonConfig>;
  private skipDelayTimeout?: Timeout;
  private player?: PlayerAPI;
  private uiContainerElement?: DOM;

  constructor(config: OverlayAdStatusOverlayConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        badgeText: 'Ad',
        skipDelay: 5000,
        skipText: 'Dismiss',
        hidden: true,
        cssClass: 'ui-overlay-ad-status-overlay',
      },
      this.config,
    );

    this.badgeLabel = new Label({
      cssClass: 'ui-overlay-ad-status-badge',
      text: this.config.badgeText,
    });
    this.skipButton = new Button({
      cssClass: 'ui-button-overlay-ad-skip',
      text: this.config.skipText,
      ariaLabel: this.config.skipText,
      buttonStyle: ButtonStyle.TextWithTrailingIcon,
      hidden: true,
      acceptsTouchWithUiHidden: true,
    });

    this.config.components = [this.badgeLabel, this.skipButton];
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    this.player = player;
    this.uiContainerElement = uimanager.getUI().getDomElement();

    this.skipDelayTimeout = new Timeout(this.config.skipDelay, () => {
      this.skipButton.show();
    });

    player.on(player.exports.PlayerEvent.OverlayAdStarted, (_: AdEvent) => {
      this.skipDelayTimeout.clear();
      this.skipButton.hide();
      this.show();
      this.uiContainerElement.addClass(this.prefixCss(OVERLAY_AD_ACTIVE_CLASS));

      if (this.config.skipDelay >= 0) {
        this.skipDelayTimeout.start();
      }
    });

    player.on(OVERLAY_AD_FINISHED_EVENT as any, this.hideOverlayStatus);
    player.on(player.exports.PlayerEvent.SourceUnloaded, this.hideOverlayStatus);

    this.skipButton.onClick.subscribe(() => {
      this.hideOverlayStatus();
      player.ads.skip();
    });
  }

  release(): void {
    this.hideOverlayStatus();
    this.skipDelayTimeout?.clear();
    this.player = undefined;
    this.uiContainerElement = undefined;
    super.release();
  }

  private readonly hideOverlayStatus = (): void => {
    this.skipDelayTimeout?.clear();
    this.skipButton.hide();
    this.hide();
    this.uiContainerElement?.removeClass(this.prefixCss(OVERLAY_AD_ACTIVE_CLASS));
  };
}
