import { SettingsPanelPage, SettingsPanelPageConfig } from '../SettingsPanelPage';
import { SettingsPanel, SettingsPanelConfig } from '../SettingsPanel';
import { SubtitleOverlay } from '../../overlays/SubtitleOverlay';
import { FontSizeSelectBox } from './FontSizeSelectBox';
import { FontFamilySelectBox } from './FontFamilySelectBox';
import { FontColorSelectBox } from './FontColorSelectBox';
import { FontOpacitySelectBox } from './FontOpacitySelectBox';
import { CharacterEdgeSelectBox } from './CharacterEdgeSelectBox';
import { BackgroundColorSelectBox } from './BackgroundColorSelectBox';
import { BackgroundOpacitySelectBox } from './BackgroundOpacitySelectBox';
import { WindowColorSelectBox } from './WindowColorSelectBox';
import { WindowOpacitySelectBox } from './WindowOpacitySelectBox';
import { SubtitleSettingsResetButton } from './SubtitleSettingsResetButton';
import { UIInstanceManager } from '../../../UIManager';
import { SettingsPanelPageBackButton } from '../SettingsPanelPageBackButton';
import { SettingsPanelItem, SettingsPanelItemConfig } from '../SettingsPanelItem';
import { PlayerAPI } from 'bitmovin-player';
import { i18n, LocalizableText } from '../../../localization/i18n';
import { DynamicSettingsPanelItem } from '../DynamicSettingsPanelItem';
import { ListSelector, ListSelectorConfig } from '../../lists/ListSelector';
import { FontStyleSelectBox } from './FontStyleSelectBox';
import { CharacterEdgeColorSelectBox } from './CharacterEdgeColorSelectBox';

/**
 * @category Configs
 */
export interface SubtitleSettingsPanelPageConfig extends SettingsPanelPageConfig {
  settingsPanel: SettingsPanel<SettingsPanelConfig>;
  overlay: SubtitleOverlay;
  useDynamicSettingsPanelItem?: boolean;
}

/**
 * @category Components
 */
export class SubtitleSettingsPanelPage extends SettingsPanelPage {
  private readonly overlay: SubtitleOverlay;
  private readonly settingsPanel: SettingsPanel<SettingsPanelConfig>;

  constructor(config: SubtitleSettingsPanelPageConfig) {
    super(config);

    this.overlay = config.overlay;
    this.settingsPanel = config.settingsPanel;

    const components = [
      this.buildSettingsPanelItem(
        i18n.getLocalizer('settings.subtitles.font.size'),
        new FontSizeSelectBox({
          overlay: this.overlay,
          filter: item => this.overlay.filterFontSizeOptions(item),
        }),
        config.useDynamicSettingsPanelItem,
      ),
      this.buildSettingsPanelItem(
        i18n.getLocalizer('settings.subtitles.font.style'),
        new FontStyleSelectBox({
          overlay: this.overlay,
        }),
        config.useDynamicSettingsPanelItem,
      ),
      this.buildSettingsPanelItem(
        i18n.getLocalizer('settings.subtitles.font.family'),
        new FontFamilySelectBox({
          overlay: this.overlay,
        }),
        config.useDynamicSettingsPanelItem,
      ),
      this.buildSettingsPanelItem(
        i18n.getLocalizer('settings.subtitles.font.color'),
        new FontColorSelectBox({
          overlay: this.overlay,
        }),
        config.useDynamicSettingsPanelItem,
      ),
      this.buildSettingsPanelItem(
        i18n.getLocalizer('settings.subtitles.font.opacity'),
        new FontOpacitySelectBox({
          overlay: this.overlay,
        }),
        config.useDynamicSettingsPanelItem,
      ),
      this.buildSettingsPanelItem(
        i18n.getLocalizer('settings.subtitles.characterEdge'),
        new CharacterEdgeSelectBox({
          overlay: this.overlay,
        }),
        config.useDynamicSettingsPanelItem,
      ),
      this.buildSettingsPanelItem(
        i18n.getLocalizer('settings.subtitles.characterEdge.color'),
        new CharacterEdgeColorSelectBox({
          overlay: this.overlay,
        }),
        config.useDynamicSettingsPanelItem,
      ),
      this.buildSettingsPanelItem(
        i18n.getLocalizer('settings.subtitles.background.color'),
        new BackgroundColorSelectBox({
          overlay: this.overlay,
        }),
        config.useDynamicSettingsPanelItem,
      ),
      this.buildSettingsPanelItem(
        i18n.getLocalizer('settings.subtitles.background.opacity'),
        new BackgroundOpacitySelectBox({
          overlay: this.overlay,
        }),
        config.useDynamicSettingsPanelItem,
      ),
      this.buildSettingsPanelItem(
        i18n.getLocalizer('settings.subtitles.window.color'),
        new WindowColorSelectBox({
          overlay: this.overlay,
        }),
        config.useDynamicSettingsPanelItem,
      ),
      this.buildSettingsPanelItem(
        i18n.getLocalizer('settings.subtitles.window.opacity'),
        new WindowOpacitySelectBox({
          overlay: this.overlay,
        }),
        config.useDynamicSettingsPanelItem,
      ),
    ];

    const backItem = new SettingsPanelItem({
      label: new SettingsPanelPageBackButton({
        container: this.settingsPanel,
      }),
      settingComponent: new SubtitleSettingsResetButton({}),
      cssClasses: ['title-item'],
      isSetting: false,
    });

    if (config.useDynamicSettingsPanelItem) {
      components.unshift(backItem);
    } else {
      components.push(backItem);
    }

    this.config = this.mergeConfig(
      config,
      {
        components: components,
      },
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onActive.subscribe(() => {
      this.overlay.enablePreviewSubtitleLabel();

      // Dynamically reapply font size filter
      const fontSizeComponent = this.getComponents().find(
        (component: any) =>
          component instanceof SettingsPanelItem && component.getComponents().some(c => c instanceof FontSizeSelectBox),
      ) as SettingsPanelItem<SettingsPanelItemConfig>;

      if (fontSizeComponent) {
        const fontSizeSelectBox = fontSizeComponent
          .getComponents()
          .find(c => c instanceof FontSizeSelectBox) as FontSizeSelectBox;
        fontSizeSelectBox?.reapplyFilterAndReload();
      }
    });

    this.onInactive.subscribe(() => {
      this.overlay.removePreviewSubtitleLabel();
    });
  }

  private buildSettingsPanelItem(
    label: LocalizableText,
    setting: ListSelector<ListSelectorConfig>,
    useDynamicSettingsPanelItem: boolean = false,
  ): SettingsPanelItem<SettingsPanelItemConfig> {
    if (useDynamicSettingsPanelItem) {
      return new DynamicSettingsPanelItem({
        label: label,
        settingComponent: setting,
        container: this.settingsPanel,
      });
    } else {
      return new SettingsPanelItem({
        label: label,
        settingComponent: setting,
      });
    }
  }
}
