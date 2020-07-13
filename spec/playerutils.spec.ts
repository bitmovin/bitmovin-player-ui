import { PlayerUtils } from '../src/ts/playerutils';
import { PlayerAPI } from 'bitmovin-player';
import { MockHelper } from './helper/MockHelper';

describe('PlayerUtils', () => {
  let playerMock: PlayerAPI;

  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
  });

  describe('getSeekableRange', () => {
    it('it should return seekable range from playerAPI if available', () => {
      const seekableRange = { start: 0, end: 15 };
      jest.spyOn(playerMock, 'getSeekableRange').mockReturnValue(seekableRange);

      const utilSeekableRange = PlayerUtils.getSeekableRange(playerMock);

      expect(utilSeekableRange).toEqual(seekableRange);
    });

    test.each`
    timeshift | maxTimeshift | currentTime    | expectedStart  | expectedEnd
    ${0}      | ${-260}       | ${1594646367} | ${1594646107} | ${1594646367}
    ${-25}    | ${-260}       | ${1594646367} | ${1594646132} | ${1594646392}
    ${-60}    | ${-260}       | ${1594646367} | ${1594646167} | ${1594646427}
  `(
      'should calculate start=$expectedStart and end=$expectedEnd seekable range',
      ({ timeshift, maxTimeshift, currentTime, expectedStart, expectedEnd }) => {
        jest.spyOn(playerMock, 'isLive').mockReturnValue(true);
        jest.spyOn(playerMock, 'getTimeShift').mockReturnValue(timeshift);
        jest.spyOn(playerMock, 'getMaxTimeShift').mockReturnValue(maxTimeshift);
        jest.spyOn(playerMock, 'getCurrentTime').mockReturnValue(currentTime);

        const { start, end } = PlayerUtils.getSeekableRange(playerMock);

        expect(start).toEqual(expectedStart);
        expect(end).toEqual(expectedEnd);
      },
    );
  });
});
