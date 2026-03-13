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

    it('should not update the stored volume when player is muted', () => {
      (playerMock.isMuted as jest.Mock).mockReturnValue(true);
      (playerMock.getVolume as jest.Mock).mockReturnValue(0);
      volumeController.storeVolume = jest.fn();

      playerMock.eventEmitter.fireEvent<VolumeChangedEvent>({
        type: PlayerEvent.VolumeChanged,
        sourceVolume: 0.7,
        targetVolume: 0,
        timestamp: Date.now(),
      });

      expect(volumeController.storeVolume).not.toHaveBeenCalled();
    });

    it('should not update the stored volume when volume is zero', () => {
      (playerMock.isMuted as jest.Mock).mockReturnValue(false);
      (playerMock.getVolume as jest.Mock).mockReturnValue(0);
      volumeController.storeVolume = jest.fn();

      playerMock.eventEmitter.fireEvent<VolumeChangedEvent>({
        type: PlayerEvent.VolumeChanged,
        sourceVolume: 0.7,
        targetVolume: 0,
        timestamp: Date.now(),
      });

      expect(volumeController.storeVolume).not.toHaveBeenCalled();
    });
  });
});
