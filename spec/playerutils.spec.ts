import { PlayerUtils } from '../src/ts/playerutils';
import { PlayerAPI } from 'bitmovin-player';

let PlayerMockClass: jest.Mock<PlayerAPI> = jest.fn().mockImplementation(() => ({
  isLive: jest.fn(),
  getSeekableRange: jest.fn().mockReturnValue({ start: -1, end: -1 }),
  getTimeShift: jest.fn(),
  getMaxTimeShift: jest.fn(),
  getCurrentTime: jest.fn(),
}));

describe('PlayerUtils', () => {
  let player: PlayerAPI;

  beforeEach(() => {
    player = new PlayerMockClass;
  });

  describe('getSeekableRange', () => {
    it('it should return seekable range from playerAPI if available', () => {
      const seekableRange = { start: 0, end: 15 };
      player.getSeekableRange = jest.fn().mockReturnValue(seekableRange);

      const utilSeekableRange = PlayerUtils.getSeekableRange(player);

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
        player.isLive = jest.fn().mockReturnValue(true);
        player.getTimeShift = jest.fn().mockReturnValue(timeshift);
        player.getMaxTimeShift = jest.fn().mockReturnValue(maxTimeshift);
        player.getCurrentTime = jest.fn().mockReturnValue(currentTime);

        const { start, end } = PlayerUtils.getSeekableRange(player);

        expect(start).toEqual(expectedStart);
        expect(end).toEqual(expectedEnd);
      },
    );
  });
});
