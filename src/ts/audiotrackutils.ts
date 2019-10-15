import { ListItem, ListSelector, ListSelectorConfig } from './components/listselector';
import { UIInstanceManager } from './uimanager';
import { AudioTrackEvent, PlayerAPI, AudioTrack } from 'bitmovin-player';
import { i18n } from './localization/i18n';

/**
 * Helper class to handle all audio tracks related events
 *
 * This class listens to player events as well as the `ListSelector` event if selection changed
 */
export class AudioTrackSwitchHandler {

  private player: PlayerAPI;
  private listElement: ListSelector<ListSelectorConfig>;
  private uimanager: UIInstanceManager;

  constructor(player: PlayerAPI, element: ListSelector<ListSelectorConfig>, uimanager: UIInstanceManager) {
    this.player = player;
    this.listElement = element;
    this.uimanager = uimanager;

    this.bindSelectionEvent();
    this.bindPlayerEvents();
    this.refreshAudioTracks();
    this.selectCurrentAudioTrack();
  }

  private bindSelectionEvent(): void {
    this.listElement.onItemSelected.subscribe((_, value: string) => {
      this.player.setAudio(value);
    });
  }

  private bindPlayerEvents(): void {
    // Update selection when selected track has changed
    this.player.on(this.player.exports.PlayerEvent.AudioChanged, this.selectCurrentAudioTrack);
    // Update tracks when source goes away
    this.player.on(this.player.exports.PlayerEvent.SourceUnloaded, this.refreshAudioTracks);
    // Update tracks when the period within a source changes
    this.player.on(this.player.exports.PlayerEvent.PeriodSwitched, this.refreshAudioTracks);
    // Update tracks when a track is added or removed
    this.player.on(this.player.exports.PlayerEvent.AudioAdded, this.addAudioTrack);
    this.player.on(this.player.exports.PlayerEvent.AudioRemoved, this.removeAudioTrack);
    this.uimanager.getConfig().events.onUpdated.subscribe(this.refreshAudioTracks);
  }

  private addAudioTrack = (event: AudioTrackEvent) => {
    const audioTrack = event.track;
    if (!this.listElement.hasItem(audioTrack.id)) {
      this.listElement.addItem(audioTrack.id, i18n.getLocalizableCallback(audioTrack.label));
    }
  };

  private removeAudioTrack = (event: AudioTrackEvent) => {
    const audioTrack = event.track;
    if (this.listElement.hasItem(audioTrack.id)) {
      this.listElement.removeItem(audioTrack.id);
    }
  };

  private selectCurrentAudioTrack = () => {
    let currentAudioTrack = this.player.getAudio();

    // HLS streams don't always provide this, so we have to check
    if (currentAudioTrack) {
      this.listElement.selectItem(currentAudioTrack.id);
    }
  };

  private refreshAudioTracks = () => {
    const audioTracks = this.player.getAvailableAudio();
    const audioTrackToListItem = (audioTrack: AudioTrack): ListItem => {
      return { key: audioTrack.id, label: audioTrack.label };
    };

    this.listElement.synchronizeItems(audioTracks.map(audioTrackToListItem));
  };
}
