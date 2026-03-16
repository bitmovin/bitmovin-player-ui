import { PlayerEvent, VolumeChangedEvent } from 'bitmovin-player';
import { VolumeController } from '../../src/ts/utils/VolumeController';
import { MockHelper, TestingPlayerAPI } from '../helper/MockHelper';

describe('VolumeController', () => {
  let playerMock: TestingPlayerAPI;
  let volumeController: VolumeController;

  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    volumeController = new VolumeController(playerMock);
  });

  describe('onChangedEvent', () => {
    it('should update the stored volume on VolumeChanged event', () => {
      volumeController.storeVolume = jest.fn();

      playerMock.eventEmitter.fireEvent<VolumeChangedEvent>({
        type: PlayerEvent.VolumeChanged,
        sourceVolume: 20,
        targetVolume: 70,
        timestamp: Date.now(),
      });

      expect(volumeController.storeVolume).toHaveBeenCalledTimes(1);
    });

    it('should not update the stored volume when player is muted with zero volume', () => {
      (playerMock.getVolume as jest.Mock).mockReturnValue(50);
      volumeController = new VolumeController(playerMock);

      (playerMock.isMuted as jest.Mock).mockReturnValue(true);
      (playerMock.getVolume as jest.Mock).mockReturnValue(0);

      playerMock.eventEmitter.fireEvent<VolumeChangedEvent>({
        type: PlayerEvent.VolumeChanged,
        sourceVolume: 50,
        targetVolume: 0,
        timestamp: Date.now(),
      });

      // Zero volume should not overwrite the previously stored volume
      volumeController.recallVolume();
      expect(playerMock.setVolume).toHaveBeenCalledWith(50, expect.any(String));
    });

    it('should not update the stored volume when volume is zero', () => {
      (playerMock.getVolume as jest.Mock).mockReturnValue(50);
      volumeController = new VolumeController(playerMock);

      (playerMock.isMuted as jest.Mock).mockReturnValue(false);
      (playerMock.getVolume as jest.Mock).mockReturnValue(0);

      playerMock.eventEmitter.fireEvent<VolumeChangedEvent>({
        type: PlayerEvent.VolumeChanged,
        sourceVolume: 50,
        targetVolume: 0,
        timestamp: Date.now(),
      });

      // Zero volume should not overwrite the previously stored volume
      volumeController.recallVolume();
      expect(playerMock.setVolume).toHaveBeenCalledWith(50, expect.any(String));
    });

    it('should store volume when muted at non-zero volume', () => {
      (playerMock.isMuted as jest.Mock).mockReturnValue(true);
      (playerMock.getVolume as jest.Mock).mockReturnValue(50);

      playerMock.eventEmitter.fireEvent<VolumeChangedEvent>({
        type: PlayerEvent.VolumeChanged,
        sourceVolume: 70,
        targetVolume: 50,
        timestamp: Date.now(),
      });

      volumeController.recallVolume();
      expect(playerMock.setVolume).toHaveBeenCalledWith(50, expect.any(String));
    });
  });

  describe('volume transition (scrubbing)', () => {
    it('should not store intermediate volume values during scrubbing', () => {
      // Start with volume at 80
      (playerMock.getVolume as jest.Mock).mockReturnValue(80);
      volumeController = new VolumeController(playerMock);

      // Start a transition (user starts scrubbing)
      const transition = volumeController.startTransition();

      // Simulate intermediate volume changes during scrubbing (e.g. slowly dragging to low values)
      (playerMock.getVolume as jest.Mock).mockReturnValue(1);
      playerMock.eventEmitter.fireEvent<VolumeChangedEvent>({
        type: PlayerEvent.VolumeChanged,
        sourceVolume: 80,
        targetVolume: 1,
        timestamp: Date.now(),
      });

      // Finish the transition at 0 (user dragged to mute)
      transition.finish(0);

      // Recalling should restore the original volume (80), not the intermediate value (1)
      volumeController.recallVolume();
      expect(playerMock.setVolume).toHaveBeenCalledWith(80, expect.any(String));
    });

    it('should resume storing volume after transition finishes', () => {
      (playerMock.getVolume as jest.Mock).mockReturnValue(50);
      volumeController = new VolumeController(playerMock);

      const transition = volumeController.startTransition();
      transition.finish(50);

      // After transition ends, volume changes should be stored again
      (playerMock.getVolume as jest.Mock).mockReturnValue(30);
      playerMock.eventEmitter.fireEvent<VolumeChangedEvent>({
        type: PlayerEvent.VolumeChanged,
        sourceVolume: 50,
        targetVolume: 30,
        timestamp: Date.now(),
      });

      volumeController.recallVolume();
      expect(playerMock.setVolume).toHaveBeenCalledWith(30, expect.any(String));
    });
  });

  describe('recallVolume', () => {
    it('should default to volume 100 when no volume was ever stored', () => {
      (playerMock.getVolume as jest.Mock).mockReturnValue(0);
      volumeController = new VolumeController(playerMock);

      volumeController.recallVolume();

      expect(playerMock.unmute).toHaveBeenCalled();
      expect(playerMock.setVolume).toHaveBeenCalledWith(100, expect.any(String));
    });

    it('should default to volume 100 when stored volume is explicitly 0', () => {
      volumeController = new VolumeController(playerMock);
      (volumeController as any).storedVolume = 0;

      volumeController.recallVolume();

      expect(playerMock.unmute).toHaveBeenCalled();
      expect(playerMock.setVolume).toHaveBeenCalledWith(100, expect.any(String));
    });

    it('should restore previously stored non-zero volume', () => {
      (playerMock.getVolume as jest.Mock).mockReturnValue(42);
      volumeController = new VolumeController(playerMock);

      volumeController.recallVolume();

      expect(playerMock.unmute).toHaveBeenCalled();
      expect(playerMock.setVolume).toHaveBeenCalledWith(42, expect.any(String));
    });
  });
});
