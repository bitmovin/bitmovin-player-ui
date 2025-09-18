import {SubtitleOverlay} from '../../overlays/SubtitleOverlay';
import {ListSelectorConfig} from '../../lists/ListSelector';
import {SelectBox} from '../SelectBox';
import {SubtitleSettingsManager} from '../../../utils/SubtitleSettingsManager';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../../../UIManager';

/**
 * @category Configs
 */
export interface SubtitleSettingSelectBoxConfig extends ListSelectorConfig {
  overlay: SubtitleOverlay;
}

/**
 * Base class for all subtitles settings select box
 *
 * @category Components
 **/
export class SubtitleSettingSelectBox extends SelectBox {

  protected settingsManager?: SubtitleSettingsManager;
  readonly overlay: SubtitleOverlay;
  private currentCssClass: string;

  constructor(config: SubtitleSettingSelectBoxConfig) {
    super(config);

    this.overlay = config.overlay;
  }

  /**
   * Removes a previously set class and adds the passed in class.
   * @param cssClass The new class to replace the previous class with or null to just remove the previous class
   */
  protected toggleOverlayClass(cssClass: string|null): void {
    // Remove previous class if existing
    if (this.currentCssClass) {
      this.overlay.getDomElement().removeClass(this.currentCssClass);
      this.currentCssClass = null;
    }

    // Add new class if specified. If the new class is null, we don't add anything.
    if (cssClass) {
      this.currentCssClass = this.prefixCss(cssClass);
      this.overlay.getDomElement().addClass(this.currentCssClass);
    }
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    this.settingsManager = uimanager.getSubtitleSettingsManager();
  }
}
