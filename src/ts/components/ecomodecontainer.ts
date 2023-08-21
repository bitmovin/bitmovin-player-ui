import { PlayerAPI, SegmentPlaybackEvent } from 'bitmovin-player';
import { i18n } from '../localization/i18n';
import { Container, ContainerConfig } from './container';
import { EcoModeToggle } from './ecoModetogglebutton';
import { Label, LabelConfig } from './label';
import { SettingsPanelItem } from './settingspanelitem';
import { UIInstanceManager } from '../uimanager';

let helloLabel: Label<LabelConfig>;
let SavedEnergy = 0;
let energyTest = 0;
export class EcoModeContainer extends Container<ContainerConfig> {
  constructor(config: ContainerConfig = {}) {
    super(config);

    const EcoModeToggleT = new EcoModeToggle();
    const labelEcoMode = new Label({
      text: i18n.getLocalizer('ecoMode.title'),
      for: EcoModeToggleT.getConfig().id,
      id: 'ecoModeLabel',
    } as LabelConfig);
    helloLabel = new Label({
      text: '',
      cssClass: 'ui-label-savedEnergy',
    } as LabelConfig);

    const ecoButtonItem = new SettingsPanelItem(labelEcoMode, EcoModeToggleT);
    const ecoButtonItem2 = new SettingsPanelItem('Saved Energy', helloLabel, { hidden: true });

    this.addComponent(ecoButtonItem);
    this.addComponent(ecoButtonItem2);
    EcoModeToggleT.onToggleOn.subscribe(() => {
      ecoButtonItem2.show();
      this.onActivecallback();
    });

    EcoModeToggleT.onToggleOff.subscribe(() => {
      ecoButtonItem2.hide();
      this.onActivecallback();
    });
  }

  private onActivecallback: () => void;

  public setOnActiveChangeCallback(callback: () => void) {
    this.onActivecallback = callback;
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    player.on(player.exports.PlayerEvent.SegmentPlayback, (segment: SegmentPlaybackEvent) => {
      const { height, width, bitrate, frameRate } = segment.mediaInfo;

      const time = segment.presentationTimestamp;

      const numerator = (0.1 * frameRate + 0.2 * height * width + (0.3 + 0.2) * bitrate + 0.2) * time;
      const bitrate_in_Gbps = bitrate / 1000; // convert bitrate to Gbps

      const denominator = bitrate_in_Gbps * 3600 * 1e9; // 1e9 is the scientific notation for 10^9

      const energyConsumption_kWh_per_GB = numerator / denominator;

      const highQuality = player.getAvailableVideoQualities().length - 1;
      const maxHeight = player.getAvailableVideoQualities()[highQuality].height;
      const maxbitrate = player.getAvailableVideoQualities()[highQuality].bitrate;
      const maxwidth = player.getAvailableVideoQualities()[highQuality].width;
      if (helloLabel.isShown()) {
        energySaved(energyConsumption_kWh_per_GB, frameRate, time, maxHeight, maxwidth, maxbitrate, helloLabel);
      } else {
        SavedEnergy = 0;
        helloLabel.setText(SavedEnergy.toFixed(3) + ' gCO2/kWh');
      }
    });
  }
}
let currentEmissions: number;
function energySaved(
  energyConsumption_kWh_per_GB: number,
  frameRate: number,
  time: number,
  maxbitrate: number,
  maxHeight: number,
  maxwidth: number,
  helloLabel: Label<LabelConfig>,
) {
  currentEmissions = energyConsumption_kWh_per_GB * 441;

  const numerator = (0.1 * frameRate + 0.2 * maxHeight * maxwidth + (0.3 + 0.2) * maxbitrate + 0.2) * time;
  const bitrate_in_Gbps = maxbitrate / 1000; // convert bitrate to Gbps
  const denominator = bitrate_in_Gbps * 3600 * 1e9; // 1e9 is the scientific notation for 10^9
  const maxEmissons = numerator / denominator;

  if (!isNaN(currentEmissions) && !isNaN(maxEmissons)) {
    energyTest += currentEmissions/441
    console.log(energyTest.toFixed(5));
    SavedEnergy += maxEmissons - currentEmissions;
    helloLabel.setText(SavedEnergy.toFixed(3) + ' gCO2/kWh');
  }
}
