import {SubtitleOverlay} from '../subtitleoverlay';
import {ListSelectorConfig} from '../listselector';
import {SelectBox} from '../selectbox';


export interface SubtitleSettingConfig extends ListSelectorConfig {
  overlay: SubtitleOverlay;
}

export class SubtitleSettingSelectBox extends SelectBox {

  protected overlay: SubtitleOverlay;

  constructor(config: SubtitleSettingConfig) {
    super(config);
    this.overlay = config.overlay;
  }
}
