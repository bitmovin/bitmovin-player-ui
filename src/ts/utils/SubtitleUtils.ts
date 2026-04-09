import { ListItem, ListSelector, ListSelectorConfig } from '../components/lists/ListSelector';
import { UIInstanceManager } from '../UIManager';
import { PlayerAPI, SubtitleEvent, SubtitleTrack } from 'bitmovin-player';
import { i18n } from '../localization/i18n';

/**
 * Helper class to handle all subtitle related events
 *
 * This class listens to player events as well as the `ListSelector` event if selection changed
 *
 * @category Utils
 */
export class SubtitleSwitchHandler {
  static readonly SUBTITLES_OFF_KEY: string = 'null';

  private player: PlayerAPI;
  private listElement: ListSelector<ListSelectorConfig>;
  private uimanager: UIInstanceManager;

  constructor(player: PlayerAPI, element: ListSelector<ListSelectorConfig>, uimanager: UIInstanceManager) {
    this.player = player;
    this.listElement = element;
    this.uimanager = uimanager;

    this.bindSelectionEvent();
    this.bindPlayerEvents();
    this.refreshSubtitles();
  }

  private bindSelectionEvent(): void {
    this.listElement.onItemSelectionChanged.subscribe((_, value: string) => {
      // TODO add support for multiple concurrent subtitle selections
      if (value === SubtitleSwitchHandler.SUBTITLES_OFF_KEY) {
        const currentSubtitle = this.player.subtitles
          .list()
          .filter(subtitle => subtitle.enabled)
          .pop();
        if (currentSubtitle) {
          this.player.subtitles.disable(currentSubtitle.id);
        }
      } else {
        this.player.subtitles.enable(value, true);
      }
    });
  }

  private bindPlayerEvents(): void {
    this.player.on(this.player.exports.PlayerEvent.SubtitleAdded, this.addSubtitle);
    this.player.on(this.player.exports.PlayerEvent.SubtitleEnabled, this.onSubtitleEnabled);
    this.player.on(this.player.exports.PlayerEvent.SubtitleDisabled, this.selectCurrentSubtitle);
    this.player.on(this.player.exports.PlayerEvent.SubtitleRemoved, this.removeSubtitle);
    // Update subtitles when source goes away
    this.player.on(this.player.exports.PlayerEvent.SourceUnloaded, this.clearSubtitles);
    // Update subtitles when the period within a source changes
    this.player.on(this.player.exports.PlayerEvent.PeriodSwitched, this.refreshSubtitles);
    this.uimanager.getConfig().events.onUpdated.subscribe(this.refreshSubtitles);
  }

  private onSubtitleEnabled = (event: SubtitleEvent) => {
    this.selectCurrentSubtitle();

    // Update UI language to match subtitle language
    if (i18n.getConfig().adaptLocalizationToSubtitleLanguage) {
      const lang = typeof event.subtitle?.lang === 'string' ? event.subtitle.lang.trim() : '';
      if (lang) {
        i18n.setLanguage(lang);
      }
    }
  };

  private addSubtitle = (_event: SubtitleEvent) => {
    this.refreshSubtitles();
  };

  private removeSubtitle = (event: SubtitleEvent) => {
    const subtitle = event.subtitle;
    if (this.listElement.hasItem(subtitle.id)) {
      this.listElement.removeItem(subtitle.id);
    }

    this.selectCurrentSubtitle();
  };

  private selectCurrentSubtitle = () => {
    if (!this.player.subtitles) {
      // Subtitles API not available (yet)
      return;
    }

    const currentSubtitle = this.player.subtitles
      .list()
      .filter(subtitle => subtitle.enabled)
      .pop();
    this.listElement.selectItem(currentSubtitle ? currentSubtitle.id : SubtitleSwitchHandler.SUBTITLES_OFF_KEY);
  };

  private clearSubtitles = () => {
    this.listElement.clearItems();
  };

  private refreshSubtitles = () => {
    if (!this.player.subtitles) {
      // Subtitles API not available (yet)
      return;
    }

    const offListItem: ListItem = {
      key: SubtitleSwitchHandler.SUBTITLES_OFF_KEY,
      label: i18n.getLocalizer('off'),
    };

    const subtitleToListItem = (subtitle: SubtitleTrack): ListItem => {
      return { key: subtitle.id, label: subtitle.label };
    };

    this.listElement.synchronizeItems([offListItem, ...this.player.subtitles.list().map(subtitleToListItem)]);
    this.selectCurrentSubtitle();
  };
}
