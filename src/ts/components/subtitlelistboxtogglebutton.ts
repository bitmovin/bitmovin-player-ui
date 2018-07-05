import {ListBoxToggleButton, ListBoxToggleButtonConfig} from './listboxtogglebutton';

/**
 * A button that toggles the `SubtitlesListBox` visibility
 */
export class SubtitleListBoxToggleButton extends ListBoxToggleButton {
  constructor(config: ListBoxToggleButtonConfig) {
    super(config);
    this.config = this.mergeConfig(config, {
      cssClass: 'ui-subtitles-listbox-toggle-button',
    }, this.config);
  }
}
