import { MockHelper, TestingPlayerAPI } from '../helper/MockHelper';
import { UIInstanceManager } from '../../src/ts/uimanager';
import { SeekBarLabel } from '../../src/ts/components/seekbarlabel';
import { SeekPreviewEventArgs } from '../../src/ts/components/seekbar';

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;

let seekbarLabel: SeekBarLabel;

describe('SeekBarLabel', () => {
  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();

    seekbarLabel = new SeekBarLabel();

    // Setup DOM Mock
    const mockDomElement = MockHelper.generateDOMMock();
    jest.spyOn(seekbarLabel, 'getDomElement').mockReturnValue(mockDomElement);
    jest.spyOn(seekbarLabel, 'setTitleText').mockImplementation();
    jest.spyOn(seekbarLabel, 'setText').mockImplementation();

    seekbarLabel.configure(playerMock, uiInstanceManagerMock);
  });

  describe('requests thumbnail from player', () => {
    describe('for a live stream', () => {
      beforeEach(() => {
        jest.spyOn(playerMock, 'isLive').mockReturnValue(true);
        jest.spyOn(playerMock, 'getMaxTimeShift').mockReturnValue(-10);
      });

      it('with correct time shift target value', () => {
        jest.spyOn(playerMock, 'getCurrentTime').mockReturnValue(100);
        jest.spyOn(playerMock, 'getTimeShift').mockReturnValue(0);

        let args: SeekPreviewEventArgs = {
          scrubbing: false,
          position: 10,
        };

        (seekbarLabel as any).handleSeekPreview(seekbarLabel, args);

        expect(playerMock.getThumbnail).toHaveBeenCalledWith(91);
      });

      it('with correct time shift target value if we are currently time shifted', () => {
        jest.spyOn(playerMock, 'getCurrentTime').mockReturnValue(95);
        jest.spyOn(playerMock, 'getTimeShift').mockReturnValue(-5);

        let args: SeekPreviewEventArgs = {
          scrubbing: false,
          position: 80,
        };

        (seekbarLabel as any).handleSeekPreview(seekbarLabel, args);

        expect(playerMock.getThumbnail).toHaveBeenCalledWith(98);
      });
    });

    describe('for a vod', () => {
      beforeEach(() => {
        jest.spyOn(playerMock, 'isLive').mockReturnValue(false);
        jest.spyOn(playerMock, 'getDuration').mockReturnValue(10);
      });

      it('with correct seek target value', () => {
        let args: SeekPreviewEventArgs = {
          scrubbing: false,
          position: 10,
        };

        (seekbarLabel as any).handleSeekPreview(seekbarLabel, args);

        expect(playerMock.getThumbnail).toHaveBeenCalledWith(1);
      });
    });
  });
});
