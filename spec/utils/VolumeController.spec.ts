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
      (playerMock.isMuted as jest.Mock).mockReturnValue(false);
      (playerMock.getVolume as jest.Mock).mockReturnValue(70);
      volumeController.storeVolume = jest.fn();

      playerMock.eventEmitter.fireEvent<VolumeChangedEvent>({
        type: PlayerEvent.VolumeChanged,
        sourceVolume: 0.2,
        targetVolume: 0.7,
        timestamp: Date.now(),
      });

      expect(volumeController.storeVolume).toHaveBeenCalledTimes(1);
    });

    it('should not update the stored volume when player is muted with zero volume', () => {
      (playerMock.isMuted as jest.Mock).mockReturnValue(true);
      (playerMock.getVolume as jest.Mock).mockReturnValue(0);

      playerMock.eventEmitter.fireEvent<VolumeChangedEvent>({
        type: PlayerEvent.VolumeChanged,
        sourceVolume: 0.7,
        targetVolume: 0,
        timestamp: Date.now(),
      });

      // storeVolume should not persist zero — verify via the private field
      expect((volumeController as any).storedVolume).not.toBe(0);
    });

    it('should not update the stored volume when volume is zero', () => {
      (playerMock.isMuted as jest.Mock).mockReturnValue(false);
      (playerMock.getVolume as jest.Mock).mockReturnValue(0);

      playerMock.eventEmitter.fireEvent<VolumeChangedEvent>({
        type: PlayerEvent.VolumeChanged,
        sourceVolume: 0.7,
        targetVolume: 0,
        timestamp: Date.now(),
      });

      // storeVolume should not persist zero — verify via the private field
      expect((volumeController as any).storedVolume).not.toBe(0);
    });
  });

  describe('recallVolume', () => {
    it('should default to volume 100 when stored volume is 0', () => {
      // Constructor calls storeVolume() which gets 0 — should not persist it
      (playerMock.getVolume as jest.Mock).mockReturnValue(0);
      volumeController = new VolumeController(playerMock);

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
