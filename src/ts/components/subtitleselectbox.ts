import {SelectBox} from './selectbox';
import {ListSelectorConfig} from './listselector';
import {UIInstanceManager} from '../uimanager';

/**
 * A select box providing a selection between available subtitle and caption tracks.
 */
export class SubtitleSelectBox extends SelectBox {

  constructor(config: ListSelectorConfig = {}) {
    super(config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let selectCurrentSubtitle = () => {
      let currentSubtitle = player.getSubtitle();

      if (currentSubtitle) {
        this.selectItem(currentSubtitle.id);
      }
    };

    let updateSubtitles = () => {
      this.clearItems();

      for (let subtitle of player.getAvailableSubtitles()) {
        this.addItem(subtitle.id, subtitle.label);
      }

      // Select the correct subtitle after the subtitles have been added
      selectCurrentSubtitle();
    };

    this.onItemSelected.subscribe((sender: SubtitleSelectBox, value: string) => {
      // called twice? first time with null as String second time with NULL
      player.setSubtitle(value === 'null' ? null : value);
      const subtitleActive = !(value === 'null' || value === null);
      this.setSubtitleActivatedClass(subtitleActive);
    });

    // React to API events
    player.addEventHandler(player.EVENT.ON_SUBTITLE_ADDED, updateSubtitles);
    player.addEventHandler(player.EVENT.ON_SUBTITLE_CHANGED, selectCurrentSubtitle);
    player.addEventHandler(player.EVENT.ON_SUBTITLE_REMOVED, updateSubtitles);
    // Update subtitles when source goes away
    player.addEventHandler(player.EVENT.ON_SOURCE_UNLOADED, updateSubtitles);
    // Update subtitles when a new source is loaded
    player.addEventHandler(player.EVENT.ON_READY, updateSubtitles);
    // Update subtitles when the period within a source changes
    player.addEventHandler(player.EVENT.ON_PERIOD_SWITCHED, updateSubtitles);

    // Populate subtitles at startup
    updateSubtitles();
  }

  /**
   * Add a css class when subtitles are activated
   * @param {boolean} activated
   */
  private setSubtitleActivatedClass(activated: boolean): void {
    const subtitleActivatedClass = this.prefixCss('subtitles-on');

    if (!activated) {
      this.getDomElement().removeClass(subtitleActivatedClass);
    } else if (!this.getDomElement().hasClass(subtitleActivatedClass)) {
      this.getDomElement().addClass(subtitleActivatedClass);
    }
  }
}