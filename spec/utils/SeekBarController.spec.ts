import { MockHelper, TestingPlayerAPI } from '../helper/MockHelper';
import { SeekBarController, SeekBarType } from '../../src/ts/utils/SeekBarController';
import { UIUtils } from '../../src/ts/utils/UIUtils';

describe('SeekBarController', () => {
  let playerMock: TestingPlayerAPI;
  let keydownHandler: (event: Partial<KeyboardEvent>) => void;
  let enabled: boolean;

  const pressKey = (keyCode: number) => {
    const event = { keyCode, preventDefault: jest.fn() };
    keydownHandler(event);
    return event;
  };

  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    jest.spyOn(playerMock, 'getCurrentTime').mockReturnValue(10);
    jest.spyOn(playerMock, 'getDuration').mockReturnValue(100);
    jest.spyOn(playerMock, 'isPlaying').mockReturnValue(true);
    playerMock.seek = jest.fn();
    playerMock.pause = jest.fn();

    const mockDomElement = MockHelper.generateDOMMock();
    enabled = true;
    new SeekBarController({ leftRight: 1, upDown: 5 }, playerMock, undefined).setSeekBarControls(
      mockDomElement,
      () => SeekBarType.Vod,
      () => enabled,
    );
    keydownHandler = MockHelper.getMockCallArg(mockDomElement.on as jest.Mock, { arg: 1 });
  });

  describe('when the seek bar is disabled', () => {
    beforeEach(() => {
      enabled = false;
    });

    it.each([
      { key: 'ArrowLeft', keyCode: UIUtils.KeyCode.LeftArrow },
      { key: 'ArrowRight', keyCode: UIUtils.KeyCode.RightArrow },
      { key: 'ArrowUp', keyCode: UIUtils.KeyCode.UpArrow },
      { key: 'ArrowDown', keyCode: UIUtils.KeyCode.DownArrow },
      { key: 'Home', keyCode: UIUtils.KeyCode.Home },
      { key: 'End', keyCode: UIUtils.KeyCode.End },
      { key: ',', keyCode: UIUtils.KeyCode.Comma },
      { key: '.', keyCode: UIUtils.KeyCode.Period },
    ])('should ignore $key', ({ keyCode }) => {
      const event = pressKey(keyCode);

      expect(playerMock.seek).not.toHaveBeenCalled();
      expect(playerMock.pause).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('should still toggle playback with Space', () => {
      pressKey(UIUtils.KeyCode.Space);

      expect(playerMock.pause).toHaveBeenCalled();
    });
  });

  it('should seek with the arrow keys when the seek bar is enabled', () => {
    pressKey(UIUtils.KeyCode.RightArrow);

    expect(playerMock.seek).toHaveBeenCalledWith(11);
  });
});
