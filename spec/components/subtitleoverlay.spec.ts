import { MockHelper, TestingPlayerAPI } from '../helper/MockHelper';
import { UIInstanceManager } from '../../src/ts/uimanager';
import {SubtitleOverlay, SubtitleRegionContainerManager } from '../../src/ts/components/subtitleoverlay';

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;
let subtitleOverlay: SubtitleOverlay;

jest.mock('../../src/ts/components/label');

let subtitleRegionContainerManagerMock: SubtitleRegionContainerManager;

describe('SubtitleOverlay', () => {
  describe('Subtitle Region Container', () => {
    beforeEach(() => {
      playerMock = MockHelper.getPlayerMock();
      uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();

      subtitleOverlay = new SubtitleOverlay();
      subtitleOverlay.configure(playerMock, uiInstanceManagerMock);
      subtitleRegionContainerManagerMock = (subtitleOverlay as any).subtitleContainerManager;
    });

    it('adds a subtitle label on cueEnter', () => {
      const addLabelSpy = jest.spyOn(subtitleRegionContainerManagerMock, 'addLabel');
      playerMock.eventEmitter.fireSubtitleCueEnterEvent();
      expect(addLabelSpy).toHaveBeenCalled();
    });
  });
});
