import { ToggleButton, ToggleButtonConfig } from './togglebutton';
import { UIInstanceManager } from '../uimanager';
import { DynamicAdaptationConfig, PlayerAPI, VideoQualityChangedEvent } from 'bitmovin-player';
import { i18n } from '../localization/i18n';

export class EcoModeToggleButton extends ToggleButton<ToggleButtonConfig> {
  private adaptationConfig: DynamicAdaptationConfig;

  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    const defaultConfig: ToggleButtonConfig = {
      text: i18n.getLocalizer('ecoMode'),
      cssClass: 'ui-ecomodetogglebutton',
      onClass: 'on',
      offClass: 'off',
      ariaLabel: i18n.getLocalizer('ecoMode'),
    };

    this.config = this.mergeConfig(config, defaultConfig, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    if (this.areAdaptationApisAvailable(player)) {
      this.onClick.subscribe(() => {
        this.toggle();
      });

      this.onToggleOn.subscribe(() => {
        this.enableEcoMode(player);
        player.setVideoQuality('auto');
      });

      this.onToggleOff.subscribe(() => {
        this.disableEcoMode(player);
      });

      player.on(player.exports.PlayerEvent.VideoQualityChanged, (quality: VideoQualityChangedEvent) => {
        if (quality.targetQuality.id !== 'auto') {
          this.off();
          this.disableEcoMode(player);
        }
      });
    } else {
      super.disable();
    }

  }

  private areAdaptationApisAvailable(player: PlayerAPI): boolean {
    const isGetConfigAvailable = Boolean(player.adaptation.getConfig && typeof player.adaptation.getConfig === 'function');
    const isSetConfigAvailable = Boolean(player.adaptation.setConfig && typeof player.adaptation.setConfig === 'function');

    return Boolean(player.adaptation && isGetConfigAvailable && isSetConfigAvailable);
  }

  enableEcoMode(player: PlayerAPI): void {
    this.adaptationConfig = player.adaptation.getConfig();
    const codec = player.getAvailableVideoQualities()[0].codec;

    if (codec.includes('avc')) {
      player.adaptation.setConfig({
        resolution: { maxSelectableVideoHeight: 720 },
        limitToPlayerSize: true,
      });
    }
    if (codec.includes('hvc') || codec.includes('hev')) {
      player.adaptation.setConfig({
        resolution: { maxSelectableVideoHeight: 1080 },
        limitToPlayerSize: true,
      });
    }
    if (codec.includes('av1') || codec.includes('av01')) {
      player.adaptation.setConfig({
        resolution: { maxSelectableVideoHeight: 1440 },
        limitToPlayerSize: true,
      });
    }
  }

  disableEcoMode(player: PlayerAPI): void {
    player.adaptation.setConfig(this.adaptationConfig);
  }
}
