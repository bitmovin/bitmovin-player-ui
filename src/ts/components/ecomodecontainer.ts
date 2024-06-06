import { PlayerAPI, SegmentPlaybackEvent, VideoQuality } from 'bitmovin-player';
import { i18n } from '../localization/i18n';
import { Container, ContainerConfig } from './container';
import { EcoModeToggleButton } from './ecomodetogglebutton';
import { Label, LabelConfig } from './label';
import { SettingsPanelItem } from './settingspanelitem';

export class EcoModeContainer extends Container<ContainerConfig> {
  private ecoModeSavedEmissionsItem: SettingsPanelItem;
  private ecoModeToggleButtonItem: SettingsPanelItem;
  private emissionsSavedLabel: Label<LabelConfig>;
  private savedEmissons = 0;
  private currentEnergyEmission: number;

  constructor(config: ContainerConfig = {}) {
    super(config);

    const ecoModeToggleButton = new EcoModeToggleButton();
    const labelEcoMode = new Label({
      text: i18n.getLocalizer('ecoMode.title'),
      for: ecoModeToggleButton.getConfig().id,
      id: 'ecomodelabel',
    });
    this.emissionsSavedLabel = new Label({
      text: `${this.savedEmissons.toFixed(4)} gCO2`,
      cssClass: 'ui-label-savedEnergy',
    });

    this.ecoModeToggleButtonItem = new SettingsPanelItem(labelEcoMode, ecoModeToggleButton);
    this.ecoModeSavedEmissionsItem = new SettingsPanelItem('Saved Emissions', this.emissionsSavedLabel, {
      hidden: true,
    });

    this.addComponent(this.ecoModeToggleButtonItem);
    this.addComponent(this.ecoModeSavedEmissionsItem);

    ecoModeToggleButton.onToggleOn.subscribe(() => {
      this.ecoModeSavedEmissionsItem.show();
      this.onToggleCallback();
    });

    ecoModeToggleButton.onToggleOff.subscribe(() => {
      this.ecoModeSavedEmissionsItem.hide();
      this.onToggleCallback();
    });
  }

  private onToggleCallback: () => void;

  public setOnToggleCallback(callback: () => void) {
    this.onToggleCallback = callback;
  }

  configure(player: PlayerAPI): void {
    player.on(player.exports.PlayerEvent.SegmentPlayback, (segment: SegmentPlaybackEvent) => {
      if (!segment.mimeType.includes('video')) {
        return;
      }

      const { height, width, bitrate, frameRate } = segment.mediaInfo;
      const {
        height: maxHeight,
        bitrate: maxBitrate,
        width: maxWidth,
      } = this.getMaxQualityAvailable(player.getAvailableVideoQualities());

      const currentEnergyKwh = this.calculateEnergyConsumption(frameRate, height, width, bitrate, segment.duration);

      const maxEnergyKwh = this.calculateEnergyConsumption(
        frameRate,
        maxHeight,
        maxWidth,
        maxBitrate,
        segment.duration,
      );

      if (this.ecoModeSavedEmissionsItem.isShown()) {
        this.updateSavedEmissions(currentEnergyKwh, maxEnergyKwh, this.emissionsSavedLabel);
      } else {
        this.emissionsSavedLabel.setText(this.savedEmissons.toFixed(4) + ' gCO2');
      }
    });
  }

  updateSavedEmissions(
    currentEnergyConsuption: number,
    maxEnergyConsuption: number,
    emissionsSavedLabel: Label<LabelConfig>,
  ) {
    this.currentEnergyEmission = currentEnergyConsuption * 475; // 475 is the average country intensity of all countries in gCO2/kWh
    const maxEnergyEmisson = maxEnergyConsuption * 475;
    this.savedEmissons += maxEnergyEmisson - this.currentEnergyEmission;
    emissionsSavedLabel.setText(this.savedEmissons.toFixed(4) + ' gCO2');
  }

  /**
   * The calculations are based on the following paper: https://arxiv.org/pdf/2210.05444.pdf
   */
  calculateEnergyConsumption(fps: number, height: number, width: number, bitrate: number, duration: number): number {
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

    // Convert energy consumption from Watts (W) to Kilowatt-hours (kWh) for the given time duration of the segment
    const energyConsumptionKwh = (energyConsumptionW * duration) / 3.6e6;

    return energyConsumptionKwh;
  }
  getMaxQualityAvailable(availableVideoQualities: VideoQuality[]) {
    const sortedQualities = availableVideoQualities.sort((a, b) => a.bitrate - b.bitrate);
    return sortedQualities[sortedQualities.length - 1];
  }
}
