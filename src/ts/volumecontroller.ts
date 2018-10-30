import { Event, EventDispatcher } from './eventdispatcher';

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

  constructor(private readonly player: bitmovin.PlayerAPI) {
    this.storeVolume();

    const handler = () => {
      this.onChangedEvent();
    };

    player.addEventHandler(player.EVENT.ON_READY, handler);
    player.addEventHandler(player.EVENT.ON_VOLUME_CHANGED, handler);
    player.addEventHandler(player.EVENT.ON_MUTED, handler);
    player.addEventHandler(player.EVENT.ON_UNMUTED, handler);
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
    this.setMuted(!this.isMuted());
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

  protected onChangedEvent() {
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