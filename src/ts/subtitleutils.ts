import { ListItem, ListSelector, ListSelectorConfig } from './components/listselector';
import { UIInstanceManager } from './uimanager';
import { PlayerAPI, SubtitleEvent, SubtitleTrack } from 'bitmovin-player';
import { i18n } from './localization/i18n';

/**
 * Helper class to handle all subtitle related events
 *
 * This class listens to player events as well as the `ListSelector` event if selection changed
 */
export class SubtitleSwitchHandler {

  private static SUBTITLES_OFF_KEY: string = 'null';

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
    this.selectCurrentSubtitle();
  }

  private bindSelectionEvent(): void {
    this.listElement.onItemSelected.subscribe((_, value: string) => {
      // TODO add support for multiple concurrent subtitle selections
      if (value === SubtitleSwitchHandler.SUBTITLES_OFF_KEY) {
        const currentSubtitle = this.player.subtitles.list().filter((subtitle) => subtitle.enabled).pop();
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
    this.player.on(this.player.exports.PlayerEvent.SubtitleEnabled, this.selectCurrentSubtitle);
    this.player.on(this.player.exports.PlayerEvent.SubtitleDisabled, this.selectCurrentSubtitle);
    this.player.on(this.player.exports.PlayerEvent.SubtitleRemoved, this.removeSubtitle);
    // Update subtitles when source goes away
    this.player.on(this.player.exports.PlayerEvent.SourceUnloaded, this.refreshSubtitles);
    // Update subtitles when the period within a source changes
    this.player.on(this.player.exports.PlayerEvent.PeriodSwitched, this.refreshSubtitles);
    this.uimanager.getConfig().events.onUpdated.subscribe(this.refreshSubtitles);
  }

  private addSubtitle = (event: SubtitleEvent) => {
    const subtitle = event.subtitle;
    if (!this.listElement.hasItem(subtitle.id)) {
      this.listElement.addItem(subtitle.id, subtitle.label);
    }
  };

  private removeSubtitle = (event: SubtitleEvent) => {
    const subtitle = event.subtitle;
    if (this.listElement.hasItem(subtitle.id)) {
      this.listElement.removeItem(subtitle.id);
    }
  };

  private selectCurrentSubtitle = () => {
    if (!this.player.subtitles) {
      // Subtitles API not available (yet)
      return;
    }

    let currentSubtitle = this.player.subtitles.list().filter((subtitle) => subtitle.enabled).pop();
    this.listElement.selectItem(currentSubtitle ? currentSubtitle.id : SubtitleSwitchHandler.SUBTITLES_OFF_KEY);
  };

  private refreshSubtitles = () => {
    if (!this.player.subtitles) {
      // Subtitles API not available (yet)
      return;
    }

    const offListItem: ListItem = {
      key: SubtitleSwitchHandler.SUBTITLES_OFF_KEY,
      label: i18n.getLocalizableCallback('off'),
    };

    const subtitles = this.player.subtitles.list();
    const subtitleToListItem = (subtitle: SubtitleTrack): ListItem => {
      return { key: subtitle.id, label: subtitle.label };
    };

    this.listElement.synchronizeItems([
      offListItem, ...subtitles.map(subtitleToListItem),
    ]);
  };
}
