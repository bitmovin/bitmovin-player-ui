import { PlayerEvent, VolumeChangedEvent } from 'bitmovin-player';
import { VolumeController } from '../src/ts/volumecontroller';
import { MockHelper, TestingPlayerAPI } from './helper/MockHelper';

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
        sourceVolume: 0.2,
        targetVolume: 0.7,
        timestamp: Date.now(),
      });

      expect(volumeController.storeVolume).toHaveBeenCalledTimes(1);
    });
  });
});
