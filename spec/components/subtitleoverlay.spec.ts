import { MockHelper, TestingPlayerAPI } from '../helper/MockHelper';
import { UIInstanceManager } from '../../src/ts/uimanager';
import { SubtitleOverlay, SubtitleRegionContainerManager } from '../../src/ts/components/subtitleoverlay';
import { DOM } from '../../src/ts/dom';

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;
let subtitleOverlay: SubtitleOverlay;

jest.mock('../../src/ts/components/container');

let subtitleRegionContainerManagerMock: SubtitleRegionContainerManager;

describe('SubtitleOverlay', () => {
  describe('Subtitle Region Container', () => {
    let mockDomElement: DOM;
    beforeEach(() => {
      playerMock = MockHelper.getPlayerMock();
      uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();

      subtitleOverlay = new SubtitleOverlay();
      subtitleOverlay.configure(playerMock, uiInstanceManagerMock);
      subtitleRegionContainerManagerMock = (subtitleOverlay as any).subtitleContainerManager;

      mockDomElement = MockHelper.generateDOMMock();
      jest.spyOn(subtitleOverlay, 'getDomElement').mockReturnValue(mockDomElement);
    });

    it('adds a subtitle label on cueEnter', () => {
      const addLabelSpy = jest.spyOn(subtitleRegionContainerManagerMock, 'addLabel');
      playerMock.eventEmitter.fireSubtitleCueEnterEvent();
      expect(addLabelSpy).toHaveBeenCalled();
    });

    it('removes a subtitle label con cueExit', () => {
      playerMock.eventEmitter.fireSubtitleCueEnterEvent();
      const removeLabelSpy = jest.spyOn(subtitleRegionContainerManagerMock, 'removeLabel');
      jest.spyOn(subtitleOverlay, 'getDomElement').mockReturnValue(mockDomElement);
      playerMock.eventEmitter.fireSubtitleCueExitEvent();
      expect(removeLabelSpy).toHaveBeenCalled();
    });
  });
});
