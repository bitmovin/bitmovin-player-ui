import {SubtitleOverlay} from '../subtitleoverlay';
import {ListSelectorConfig} from '../listselector';
import {SelectBox} from '../selectbox';
import {SubtitleSettingsManager} from './subtitlesettingsmanager';

export interface SubtitleSettingSelectBoxConfig extends ListSelectorConfig {
  overlay: SubtitleOverlay;
  settingsManager: SubtitleSettingsManager;
}

/**
 * Base class for all subtitles settings select box
 **/
export class SubtitleSettingSelectBox extends SelectBox {

  protected settingsManager: SubtitleSettingsManager;
  protected overlay: SubtitleOverlay;
  private currentCssClass: string;

  constructor(config: SubtitleSettingSelectBoxConfig) {
    super(config);

    this.settingsManager = config.settingsManager;
    this.overlay = config.overlay;
  }

  /**
   * Removes a previously set class and adds the passed in class.
   * @param cssClass The new class to replace the previous class with or null to just remove the previous class
   */
  protected toggleOverlayClass(cssClass: string): void {
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
}
