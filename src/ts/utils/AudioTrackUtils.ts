import { ListItem, ListSelector, ListSelectorConfig } from '../components/lists/ListSelector';
import { UIInstanceManager } from '../UIManager';
import { AudioTrackEvent, PlayerAPI, AudioTrack } from 'bitmovin-player';
import { i18n } from '../localization/i18n';

/**
 * Helper class to handle all audio tracks related events
 *
 * This class listens to player events as well as the `ListSelector` event if selection changed
 *
 * @category Utils
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
  }

  private bindSelectionEvent(): void {
    this.listElement.onItemSelectionChanged.subscribe((_, value: string) => {
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

  private hasComparator(): boolean {
    return this.listElement.getConfig().comparator != null;
  }

  private addAudioTrack = (event: AudioTrackEvent) => {
    const audioTrack = event.track;

    if (!this.hasComparator()) {
      if (!this.listElement.hasItem(audioTrack.id)) {
        this.listElement.addItem(audioTrack.id, i18n.getLocalizer(audioTrack.label), true);
      }
      return;
    }

    const audioTracks = this.player.getAvailableAudio();
    const mergedTracks = audioTracks.some(track => track.id === audioTrack.id) ? audioTracks : [...audioTracks, audioTrack];

    this.listElement.synchronizeItems(mergedTracks.map(track => ({ key: track.id, label: track.label })));
    this.selectCurrentAudioTrack();
  };

  private removeAudioTrack = (event: AudioTrackEvent) => {
    const audioTrack = event.track;
    if (this.listElement.hasItem(audioTrack.id)) {
      this.listElement.removeItem(audioTrack.id);
    }
  };

  private selectCurrentAudioTrack = () => {
    const currentAudioTrack = this.player.getAudio();

    // HLS streams don't always provide this, so we have to check
    if (currentAudioTrack) {
      this.listElement.selectItem(currentAudioTrack.id);
    }
  };

  private refreshAudioTracks = () => {
    const previouslySelectedAudioTrack = this.listElement.getSelectedItem();
    const audioTrackToListItem = (audioTrack: AudioTrack): ListItem => {
      return { key: audioTrack.id, label: audioTrack.label };
    };

    this.listElement.synchronizeItems(this.player.getAvailableAudio().map(audioTrackToListItem));
    if (this.player.getAudio()) {
      this.selectCurrentAudioTrack();
    } else if (previouslySelectedAudioTrack && this.listElement.hasItem(previouslySelectedAudioTrack)) {
      // HLS streams don't always report the selected audio track via getAudio() after a refresh.
      // If getAudio() is unavailable, restore the previously selected track if it still exists.
      this.listElement.selectItem(previouslySelectedAudioTrack);
    }
  };
}
