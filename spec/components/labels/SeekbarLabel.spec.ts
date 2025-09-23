import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import { SeekBarLabel } from '../../../src/ts/components/seekbar/SeekBarLabel';
import { SeekPreviewEventArgs } from '../../../src/ts/components/seekbar/SeekBar';
import { DOM } from '../../../src/ts/DOM';

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

      it('with correct seek target value respecting seekable range', () => {
        jest.spyOn(playerMock, 'getSeekableRange').mockReturnValue({
          start: 10,
          end: 20,
        });

        let args: SeekPreviewEventArgs = {
          scrubbing: false,
          position: 10,
        };

        (seekbarLabel as any).handleSeekPreview(seekbarLabel, args);

        expect(playerMock.getThumbnail).toHaveBeenCalledWith(11);
      });
    });
  });

  describe('calculates correct values for thumbnail positioning', () => {
    const uiContainerBoundingRect = {
      x: 200,
      y: 150,
      width: 1600,
      height: 900,
      top: 150,
      right: 1800,
      bottom: 1050,
      left: 200,
    } as DOMRect;

    let containerGetDomElementMock: () => jest.Mocked<DOM>;

    beforeEach(() => {
      containerGetDomElementMock = jest.fn().mockReturnValue(MockHelper.generateDOMMock());

      containerGetDomElementMock().get = jest.fn().mockReturnValue({
        parentElement: jest.fn().mockReturnValue({
          getBoundingClientRect: jest.fn(),
        }),
      });

      seekbarLabel['container'].getDomElement = containerGetDomElementMock;
    });

    it('when thumbnail would overflow UI container leftside', () => {
      const labelRect = {
        x: 180,
        y: 700,
        width: 200,
        height: 120,
        top: 700,
        right: 380,
        bottom: 820,
        left: 180,
      } as DOMRect;

      containerGetDomElementMock().get(0).parentElement!.getBoundingClientRect = jest.fn().mockReturnValue(labelRect);

      seekbarLabel.setPositionInBounds(100, uiContainerBoundingRect);

      expect(seekbarLabel.getDomElement().css).toHaveBeenCalledWith('left', '120px');
    });

    it('when thumbnail would overflow UI container rightside', () => {
      const labelRect = {
        x: 1650,
        y: 700,
        width: 200,
        height: 120,
        top: 700,
        right: 1850,
        bottom: 820,
        left: 1650,
      } as DOMRect;

      containerGetDomElementMock().get(0).parentElement!.getBoundingClientRect = jest.fn().mockReturnValue(labelRect);

      seekbarLabel.setPositionInBounds(100, uiContainerBoundingRect);

      expect(seekbarLabel.getDomElement().css).toHaveBeenCalledWith('left', '50px');
    });
  });
});
