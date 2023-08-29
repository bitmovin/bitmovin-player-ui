import { PlayerAPI, SegmentPlaybackEvent } from 'bitmovin-player';
import { i18n } from '../localization/i18n';
import { Container, ContainerConfig } from './container';
import { EcoModeToggleButton } from './ecomodetogglebutton';
import { Label, LabelConfig } from './label';
import { SettingsPanelItem } from './settingspanelitem';

export class EcoModeContainer extends Container<ContainerConfig> {
  private ecoModeSavedEnergyItem: SettingsPanelItem;
  private energySavedLabel: Label<LabelConfig>;
  private savedEnergy = 0;
  private currentEnergyEmission: number;
  private maxEnergyEmisson: number;

  constructor(config: ContainerConfig = {}) {
    super(config);

    const ecoModeToggleButton = new EcoModeToggleButton();
    const labelEcoMode = new Label({
      text: i18n.getLocalizer('ecoMode.title'),
      for: ecoModeToggleButton.getConfig().id,
      id: 'ecoModeLabel',
    } as LabelConfig);
    this.energySavedLabel = new Label({
      text: '',
      cssClass: 'ui-label-savedEnergy',
    } as LabelConfig);

    const ecoModeToggleButtonItem = new SettingsPanelItem(labelEcoMode, ecoModeToggleButton);
    this.ecoModeSavedEnergyItem = new SettingsPanelItem('Saved Energy', this.energySavedLabel, { hidden: true });

    this.addComponent(ecoModeToggleButtonItem);
    this.addComponent(this.ecoModeSavedEnergyItem);

    ecoModeToggleButton.onToggleOn.subscribe(() => {
      this.ecoModeSavedEnergyItem.show();
      this.onActivecallback();
    });

    ecoModeToggleButton.onToggleOff.subscribe(() => {
      this.ecoModeSavedEnergyItem.hide();
      this.onActivecallback();
    });
  }

  private onActivecallback: () => void;

  public setOnActiveChangeCallback(callback: () => void) {
    this.onActivecallback = callback;
  }

  configure(player: PlayerAPI): void {
    player.on(player.exports.PlayerEvent.SegmentPlayback, (segment: SegmentPlaybackEvent) => {
      const { height, width, bitrate, frameRate } = segment.mediaInfo;

      const maxQualityAvailable = player.getAvailableVideoQualities().length - 1;
      const maxHeight = player.getAvailableVideoQualities()[maxQualityAvailable].height;
      const maxBitrate = player.getAvailableVideoQualities()[maxQualityAvailable].bitrate;
      const maxWidth = player.getAvailableVideoQualities()[maxQualityAvailable].width;

      const currentEnergyKwh = this.calculateEnergyConsumption(frameRate, height, width, bitrate);

      const maxEnergyKwh = this.calculateEnergyConsumption(frameRate, maxHeight, maxWidth, maxBitrate);

      if (this.ecoModeSavedEnergyItem.isActive()) {
        this.energySaved(currentEnergyKwh, maxEnergyKwh, this.energySavedLabel);
      } else {
        this.savedEnergy = 0;
        this.energySavedLabel.setText(this.savedEnergy.toFixed(4) + ' gCO2/kWh');
      }
    });
  }

  energySaved(currentEnergyConsuption: number, maxEnergyConsuption: number, energySavedLabel: Label<LabelConfig>) {
    this.currentEnergyEmission = currentEnergyConsuption * 475; // 475 is the average country intensity of all countries in gCO2/kWh
    this.maxEnergyEmisson = maxEnergyConsuption * 475;

    if (!isNaN(this.currentEnergyEmission) && !isNaN(this.maxEnergyEmisson)) {
      this.savedEnergy += this.maxEnergyEmisson - this.currentEnergyEmission;
      energySavedLabel.setText(this.savedEnergy.toFixed(4) + ' gCO2/kWh');
      /*  savedEnergyKm += this.savedEnergy / 107.5; */
    }
  }

  /* The calculations are based on the following paper :  https://arxiv.org/pdf/2210.05444.pdf*/
  calculateEnergyConsumption(fps: number, height: number, width: number, bitrate: number): number {
    const fpsWeight = 0.035;
    const pixeldWeight = 5.76e-9;
    const birateWeight = 6.97e-6;
    const constantOffset = 8.52;
    const bitrateInternetWeight = 3.24e-5;
    const internetConnectionOffset = 1.15;
    const videoCodec = 4.16;

    const energyConsumptionW =
      fpsWeight * fps +
      pixeldWeight * height * width +
      (birateWeight + bitrateInternetWeight) * (bitrate / 1000) +
      videoCodec +
      constantOffset +
      internetConnectionOffset;

    const energyConsumptionKwh = energyConsumptionW / 3.6e6;

    return energyConsumptionKwh;
  }
}
