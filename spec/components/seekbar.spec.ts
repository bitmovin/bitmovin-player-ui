import { MockHelper, TestingPlayerAPI } from '../helper/MockHelper';
import { SeekBar } from '../../src/ts/components/seekbar';
import { UIInstanceManager } from '../../src/ts/uimanager';

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;

let seekbar: SeekBar;

describe('SeekBar', () => {
  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();

    seekbar = new SeekBar();
  });

  describe('becomes visible when switching from live to vod', () => {
    it('when live had no time shift', () => {
      jest.spyOn(playerMock, 'getMaxTimeShift').mockReturnValue(0);
      jest.spyOn(playerMock, 'isLive').mockReturnValue(true);

      seekbar.configure(playerMock, uiInstanceManagerMock);

      jest.spyOn(playerMock, 'isLive').mockReturnValue(false);
      const showSpy = jest.spyOn(seekbar, 'show');

      playerMock.eventEmitter.fireDurationChangedEvent();

      expect(showSpy).toHaveBeenCalled();
    });
  });
});
