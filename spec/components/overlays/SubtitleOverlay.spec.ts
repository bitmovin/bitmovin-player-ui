import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import {
  SubtitleOverlay,
  SubtitleLabel,
  SubtitleRegionContainer,
  SubtitleRegionContainerManager,
} from '../../../src/ts/components/overlays/SubtitleOverlay';
import { DOM } from '../../../src/ts/DOM';
import { PlayerEvent, SubtitleCueEvent } from 'bitmovin-player';
import { ControlBar } from '../../../src/ts/components/ControlBar';

let playerMock: jest.Mocked<TestingPlayerAPI>;
let uiInstanceManagerMock: UIInstanceManager;
let subtitleOverlay: SubtitleOverlay;

jest.mock('../../../src/ts/components/Container');

let subtitleRegionContainerManagerMock: SubtitleRegionContainerManager;

describe('SubtitleOverlay', () => {
  describe('Subtitle Region Container', () => {
    let mockDomElement: DOM;
    beforeEach(() => {
      playerMock = MockHelper.getPlayerMock() as jest.Mocked<TestingPlayerAPI>;
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

    it('removes a subtitle label on cueExit', () => {
      playerMock.eventEmitter.fireSubtitleCueEnterEvent();
      const removeLabelSpy = jest.spyOn(subtitleRegionContainerManagerMock, 'removeLabel');
      jest.spyOn(subtitleOverlay, 'getDomElement').mockReturnValue(mockDomElement);
      playerMock.eventEmitter.fireSubtitleCueExitEvent();
      expect(removeLabelSpy).toHaveBeenCalled();
    });

    it('updates a subtitle label on cueUpdate', () => {
      const updateLabelSpy = jest.spyOn(subtitleRegionContainerManagerMock, 'replaceLabel');
      jest.spyOn(subtitleOverlay, 'getDomElement').mockReturnValue(mockDomElement);

      playerMock.eventEmitter.fireSubtitleCueEnterEvent();
      expect(updateLabelSpy).not.toHaveBeenCalled();

      playerMock.eventEmitter.fireSubtitleCueUpdateEvent();
      expect(updateLabelSpy).toHaveBeenCalled();
    });

    it('ignores cueUpdate event if it does not match a previous cue', () => {
      const updateLabelSpy = jest.spyOn(subtitleRegionContainerManagerMock, 'replaceLabel');
      jest.spyOn(subtitleOverlay, 'getDomElement').mockReturnValue(mockDomElement);

      playerMock.eventEmitter.fireSubtitleCueEnterEvent();
      expect(updateLabelSpy).not.toHaveBeenCalled();

      playerMock.eventEmitter.fireSubtitleCueUpdateEvent('some different text');
      expect(updateLabelSpy).not.toHaveBeenCalled();
    });

    it('remove only inactive cues when the player finishes seeking', () => {
      const removeLabelSpy = jest.spyOn(subtitleRegionContainerManagerMock, 'removeLabel');
      // create one active cue
      playerMock.getCurrentTime.mockReturnValue(1);
      playerMock.eventEmitter.fireSubtitleCueEnterEvent();

      // seek inside the cue and ensure it has not been removed
      playerMock.eventEmitter.fireSeekedEvent();
      expect(removeLabelSpy).not.toHaveBeenCalled();

      // seek outside of the cue and ensure it is removed
      playerMock.getCurrentTime.mockReturnValue(15);
      playerMock.eventEmitter.fireSeekedEvent();
      expect(removeLabelSpy).toHaveBeenCalled();
    });
  });

  describe('CEA 608 Font Size Factor', () => {
    beforeEach(() => {
      playerMock = MockHelper.getPlayerMock() as jest.Mocked<TestingPlayerAPI>;
      uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
      subtitleOverlay = new SubtitleOverlay();
      subtitleOverlay.configure(playerMock, uiInstanceManagerMock);
    });

    it('should preserve default cea608FontSizeFactor of 1 if no font size value on settings present', () => {
      expect(subtitleOverlay['cea608FontSizeFactor']).toBe(1);
    });

    // Font size factor clamping
    test.each([
      [0.2, 0.5], // Clamped to minimum
      [3.0, 2.0], // Clamped to maximum
      [1.5, 1.5], // Within range, no clamping
      [0.5, 0.5], // Exact minimum
      [2.0, 2.0], // Exact maximum
      [1.0, 1.0], // Default value
    ])('setFontSizeFactor(%f) results in cea608FontSizeFactor = %f', (inputFactor, expectedFactor) => {
      subtitleOverlay.setFontSizeFactor(inputFactor);
      expect(subtitleOverlay['cea608FontSizeFactor']).toBe(expectedFactor);
    });
  });

  describe('CEA 608 behavior', () => {
    let mockDomElement: DOM;

    beforeEach(() => {
      playerMock = MockHelper.getPlayerMock() as jest.Mocked<TestingPlayerAPI>;
      uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
      subtitleOverlay = new SubtitleOverlay();
      subtitleOverlay.configure(playerMock, uiInstanceManagerMock);

      mockDomElement = MockHelper.generateDOMMock();
      jest.spyOn(mockDomElement, 'width').mockReturnValue(320);
      jest.spyOn(mockDomElement, 'height').mockReturnValue(180);
      jest.spyOn(mockDomElement, 'get').mockReturnValue([document.createElement('div')] as any);
      jest.spyOn(subtitleOverlay, 'getDomElement').mockReturnValue(mockDomElement);
    });

    it('normalizes positioned cues into CEA row regions', () => {
      const cue = {
        subtitleId: 'subtitleId',
        start: 0,
        end: 10,
        text: 'CEA cue',
        type: PlayerEvent.CueEnter,
        position: {
          row: 4,
        },
      } as SubtitleCueEvent;

      const label = subtitleOverlay.generateLabel(cue) as SubtitleLabel;

      expect(cue.position.column).toBe(0);
      expect(label.region).toBe('cea608-row-4');
      expect(label.originalRowPosition).toBe(4);
    });

    it('toggles CEA mode on positioned cue enter and last cue exit', () => {
      jest.spyOn((subtitleOverlay as any).subtitleContainerManager, 'addLabel').mockImplementation(() => undefined);
      jest.spyOn((subtitleOverlay as any).subtitleContainerManager, 'removeLabel').mockImplementation(() => undefined);
      const cue = {
        subtitleId: 'subtitleId',
        start: 0,
        end: 10,
        text: 'CEA cue',
        type: PlayerEvent.CueEnter,
        position: {
          row: 2,
          column: 6,
        },
      } as SubtitleCueEvent;

      playerMock.eventEmitter.fireEvent<SubtitleCueEvent>(cue);

      expect((subtitleOverlay as any).cea608Enabled).toBe(true);

      playerMock.eventEmitter.fireEvent<SubtitleCueEvent>({
        ...cue,
        type: PlayerEvent.CueExit,
      });

      expect((subtitleOverlay as any).cea608Enabled).toBe(false);
    });

    it('recalculates the CEA grid after controlbar show even when no transition event fires', async () => {
      jest.useFakeTimers();

      const getComputedStyleSpy = jest.spyOn(window, 'getComputedStyle').mockReturnValue({
        transitionProperty: 'bottom',
        transitionDuration: '150ms',
        transitionDelay: '0s',
      } as CSSStyleDeclaration);

      try {
        (subtitleOverlay as any).cea608Enabled = true;
        (subtitleOverlay as any).ensureCea608GridSizeUpdated = jest.fn();

        const onComponentShowHandler = MockHelper.getMockCallArg<(component: unknown) => void>(
          uiInstanceManagerMock.onComponentShow.subscribe as jest.Mock,
        );

        onComponentShowHandler(new ControlBar({}));
        jest.advanceTimersByTime(200);
        await Promise.resolve();

        expect((subtitleOverlay as any).ensureCea608GridSizeUpdated).toHaveBeenCalled();
      } finally {
        getComputedStyleSpy.mockRestore();
        jest.useRealTimers();
      }
    });
  });
});
