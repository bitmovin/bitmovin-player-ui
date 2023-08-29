import { PlayerAPI, SegmentPlaybackEvent } from 'bitmovin-player';
import { i18n } from '../localization/i18n';
import { Container, ContainerConfig } from './container';
import { EcoModeToggleButton } from './ecomodetogglebutton';
import { Label, LabelConfig } from './label';
import { SettingsPanelItem } from './settingspanelitem';

let energySavedLabel: Label<LabelConfig>;
let SavedEnergy = 0;
let energyTest = 0;
export class EcoModeContainer extends Container<ContainerConfig> {
  constructor(config: ContainerConfig = {}) {
    super(config);

    const EcoModeToggleT = new EcoModeToggleButton();
    const labelEcoMode = new Label({
      text: i18n.getLocalizer('ecoMode.title'),
      for: EcoModeToggleT.getConfig().id,
      id: 'ecoModeLabel',
    } as LabelConfig);
    energySavedLabel = new Label({
      text: '',
      cssClass: 'ui-label-savedEnergy',
      disabled: true,
    } as LabelConfig);

    const ecoButtonItem = new SettingsPanelItem(labelEcoMode, EcoModeToggleT);
    const ecoButtonItem2 = new SettingsPanelItem('Saved Energy', energySavedLabel, { hidden: true });

    this.addComponent(ecoButtonItem);
    this.addComponent(ecoButtonItem2);

    EcoModeToggleT.onToggleOn.subscribe(() => {
      ecoButtonItem2.show();
      energySavedLabel.enable();
      this.onActivecallback();
    });

    EcoModeToggleT.onToggleOff.subscribe(() => {
      ecoButtonItem2.hide();
      energySavedLabel.disable();
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

      const highQuality = player.getAvailableVideoQualities().length - 1;
      const maxHeight = player.getAvailableVideoQualities()[highQuality].height;
      const maxbitrate = player.getAvailableVideoQualities()[highQuality].bitrate;
      const maxwidth = player.getAvailableVideoQualities()[highQuality].width;

      const currentEnergyinWatts =
        0.035 * frameRate + 5.76e-9 * height * width + (6.97e-6 + 3.24e-5) * (bitrate / 1000) + 4.16 + 8.52 + 1.15;
      const currentEnergyInKilowatts = currentEnergyinWatts / 3.6e6; // convert into kwh

      const maxEnergyinWatts =
        0.035 * frameRate +
        5.76e-9 * maxHeight * maxwidth +
        (6.97e-6 + 3.24e-5) * (maxbitrate / 1000) +
        4.16 +
        8.52 +
        1.15;

      const maxEnergyInKilowatts = maxEnergyinWatts / 3.6e6; // convert into kwh

      if (energySavedLabel.isEnabled()) {
        energySaved(currentEnergyInKilowatts, maxEnergyInKilowatts, energySavedLabel);
      } else {
        SavedEnergy = 0;
        energySavedLabel.setText(SavedEnergy.toFixed(4) + ' gCO2/kWh');
      }
    });
  }
}
let currentEmissions: number;
let maxEmissons: number;
function energySaved(
  energyConsumption_kWh: number,
  maxEnergyInKilowatts: number,
  energySavedLabel: Label<LabelConfig>,
) {
  currentEmissions = energyConsumption_kWh * 475; // 475 is the average country intensity of all countries in gCO2/kWh
  maxEmissons = maxEnergyInKilowatts * 475;

  if (!isNaN(currentEmissions) && !isNaN(maxEmissons)) {
    energyTest += energyConsumption_kWh;
    SavedEnergy += maxEmissons - currentEmissions;
    energySavedLabel.setText(SavedEnergy.toFixed(4) + ' gCO2/kWh');
    /*  SavedEnergyKm += SavedEnergy / 107.5; */
  }
}
