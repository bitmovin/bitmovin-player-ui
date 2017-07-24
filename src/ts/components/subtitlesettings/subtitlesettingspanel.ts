import {SettingsPanel, SettingsPanelConfig, SettingsPanelItem} from '../settingspanel';
import {FontColorSelectBox} from './fontcolorselectbox';
import {FontOpacitySelectBox} from './fontopacityselectbox';
import {FontFamilySelectBox} from './fontfamilyselectbox';
import {FontSizeSelectBox} from './fontsizeselectbox';
import {BackgroundColorSelectBox} from './backgroundcolorselectbox';
import {BackgroundOpacitySelectBox} from './backgroundopacityselectbox';
import {WindowColorSelectBox} from './windowcolorselectbox';
import {WindowOpacitySelectBox} from './windowopacityselectbox';
import {CharacterEdgeSelectBox} from './characteredgeselectbox';
import {SubtitleOverlay} from '../subtitleoverlay';
import {Component, ComponentConfig} from '../component';
import {UIInstanceManager} from '../../uimanager';
import {SubtitleSettingsManager} from './subtitlesettingsmanager';
import {SubtitleSettingsCloseButton} from './subtitlesettingsclosebutton';

export interface SubtitleSettingsPanelConfig extends SettingsPanelConfig {
  overlay: SubtitleOverlay;
  settingsPanel: SettingsPanel;
}

/**
 * SubtitleSettingsPanel is a settings panel specific to subtitles settings
 **/
export class SubtitleSettingsPanel extends SettingsPanel {

  private overlay: SubtitleOverlay;

  constructor(config: SubtitleSettingsPanelConfig) {
    super(config);

    this.overlay = config.overlay;

    let manager = new SubtitleSettingsManager(this.overlay);

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
        new SettingsPanelItem(null, new SubtitleSettingsCloseButton({
          subtitleSettingsPanel: this, settingsPanel: config.settingsPanel,
        })),
      ]}, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onShow.subscribe(() => {
      this.overlay.enablePreviewSubtitleLabel();
    });

    this.onHide.subscribe(() => {
      this.overlay.removePreviewSubtitleLabel();
    });
  }
}
