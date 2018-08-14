import {SettingsPanelPage, SettingsPanelPageBackButton} from '../settingspanelpage';
import {SettingsPanel, SettingsPanelConfig, SettingsPanelItem} from '../settingspanel';
import {SubtitleOverlay} from '../subtitleoverlay';
import {ContainerConfig} from '../container';
import {SubtitleSettingsManager} from './subtitlesettingsmanager';
import {Component, ComponentConfig} from '../component';
import {FontSizeSelectBox} from './fontsizeselectbox';
import {FontFamilySelectBox} from './fontfamilyselectbox';
import {FontColorSelectBox} from './fontcolorselectbox';
import {FontOpacitySelectBox} from './fontopacityselectbox';
import {CharacterEdgeSelectBox} from './characteredgeselectbox';
import {BackgroundColorSelectBox} from './backgroundcolorselectbox';
import {BackgroundOpacitySelectBox} from './backgroundopacityselectbox';
import {WindowColorSelectBox} from './windowcolorselectbox';
import {WindowOpacitySelectBox} from './windowopacityselectbox';
import {SubtitleSettingsResetButton} from './subtitlesettingsresetbutton';
import {UIInstanceManager} from '../../uimanager';

export interface SubtitleSettingsPanelPageConfig extends ContainerConfig {
  settingsPanel: SettingsPanel;
  overlay: SubtitleOverlay;
}

export class SubtitleSettingsPanelPage extends SettingsPanelPage {

  private readonly overlay: SubtitleOverlay;
  private readonly settingsPanel: SettingsPanel;

  constructor(config: SubtitleSettingsPanelPageConfig) {
    super(config);

    this.overlay = config.overlay;
    this.settingsPanel = config.settingsPanel;

    let manager = new SubtitleSettingsManager();

    this.config = this.mergeConfig(config, {
      components: <Component<ComponentConfig>[]>[
        new SettingsPanelItem('Font size', new FontSizeSelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem('Font family', new FontFamilySelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem('Font color', new FontColorSelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem('Font opacity', new FontOpacitySelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem('Character edge', new CharacterEdgeSelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem('Background color', new BackgroundColorSelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem('Background opacity', new BackgroundOpacitySelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem('Window color', new WindowColorSelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem('Window opacity', new WindowOpacitySelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem(new SettingsPanelPageBackButton({
          container: this.settingsPanel,
          text: 'back',
        }), new SubtitleSettingsResetButton({
          settingsManager: manager,
        })),
      ],
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onActive.subscribe(() => {
      this.overlay.enablePreviewSubtitleLabel();
    });

    this.onInactive.subscribe(() => {
      this.overlay.removePreviewSubtitleLabel();
    });
  }
}