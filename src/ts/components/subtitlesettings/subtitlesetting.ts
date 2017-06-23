import {SubtitleOverlay} from '../subtitleoverlay';
import {ListSelectorConfig} from '../listselector';
import {SelectBox} from '../selectbox';


export interface SubtitleSettingSelectBoxConfig extends ListSelectorConfig {
  overlay: SubtitleOverlay;
}

export class SubtitleSettingSelectBox extends SelectBox {

  protected overlay: SubtitleOverlay;

  constructor(config: SubtitleSettingSelectBoxConfig) {
    super(config);
    this.overlay = config.overlay;
  }
}
