import { Event, EventDispatcher } from './eventdispatcher';
import { PlayerAPI } from 'bitmovin-player';

export interface VolumeSettingChangedArgs {
  volume: number;
  muted: boolean;
}

/**
 * Can be used to centrally manage and control the volume and mute state of the player from multiple components.
 */
export class VolumeController {

  private static readonly issuerName = 'ui-volumecontroller';

  private readonly events = {
    onChanged: new EventDispatcher<VolumeController, VolumeSettingChangedArgs>(),
  };

  private storedVolume: number;

  constructor(private readonly player: PlayerAPI) {
    this.storeVolume();

    const handler = () => {
      this.onChangedEvent();
    };

    player.on(player.exports.PlayerEvent.SourceLoaded, handler);
    player.on(player.exports.PlayerEvent.VolumeChanged, handler);
    player.on(player.exports.PlayerEvent.Muted, handler);
    player.on(player.exports.PlayerEvent.Unmuted, handler);
  }

  setVolume(volume: number): void {
    this.player.setVolume(volume, VolumeController.issuerName);
  }

  getVolume(): number {
    return this.player.getVolume();
  }

  setMuted(muted: boolean): void {
    if (muted) {
      this.player.mute(VolumeController.issuerName);
    } else {
      this.player.unmute(VolumeController.issuerName);
    }
  }

  toggleMuted(): void {
    if (this.isMuted() || this.getVolume() === 0) {
      // Unmuting from the mute or zero-volume state recalls the previously saved volume setting. Setting the
      // volume automatically unmutes the player in v7.
      this.recallVolume();
    } else {
      this.setMuted(true);
    }
  }

  isMuted(): boolean {
    return this.player.isMuted();
  }

  /**
   * Stores (saves) the current volume so it can later be restored with {@link recallVolume}.
   */
  storeVolume(): void {
    this.storedVolume = this.getVolume();
  }

  /**
   * Recalls (sets) the volume previously stored with {@link storeVolume}.
   */
  recallVolume(): void {
    this.setVolume(this.storedVolume);
  }

  startTransition(): VolumeTransition {
    return new VolumeTransition(this);
  }

  onChangedEvent() {
    const playerMuted = this.isMuted();
    const playerVolume = this.getVolume();

    const uiMuted = playerMuted || playerVolume === 0;
    const uiVolume = playerMuted ? 0 : playerVolume;

    this.events.onChanged.dispatch(this, { volume: uiVolume, muted: uiMuted });
  }

  /**
   * Gets the event that is fired when the volume settings have changed.
   */
  get onChanged(): Event<VolumeController, VolumeSettingChangedArgs> {
    return this.events.onChanged.getEvent();
  }
}

export class VolumeTransition {

  constructor(private controller: VolumeController) {
    // Store the volume at the beginning of a volume change so we can recall it later in case we set the volume to
    // zero and actually mute the player.
    controller.storeVolume();
  }

  update(volume: number): void {
    // Update the volume while transitioning so the user has a "live preview" of the desired target volume
    this.controller.setVolume(volume);
  }

  finish(volume: number): void {
    if (volume === 0) {
      // When the volume is zero we essentially mute the volume so we recall the volume from the beginning of the
      // transition and mute the player instead. Recalling is necessary to return to the actual audio volume
      // when unmuting.
      // We must first recall the volume and then mute, because recalling sets the volume on the player
      // and setting a player volume > 0 unmutes the player in v7.
      this.controller.recallVolume();
      this.controller.setMuted(true);
    } else {
      this.controller.setVolume(volume);
      this.controller.storeVolume();
    }
  }
}