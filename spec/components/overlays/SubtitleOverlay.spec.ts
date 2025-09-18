import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import { SubtitleOverlay, SubtitleRegionContainer, SubtitleRegionContainerManager } from '../../../src/ts/components/overlays/SubtitleOverlay';
import { DOM } from '../../../src/ts/DOM';

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

    // Font size factor clamping
    test.each([
      [0.2, 0.5],  // Clamped to minimum
      [3.0, 2.0],  // Clamped to maximum
      [1.5, 1.5],  // Within range, no clamping
      [0.5, 0.5],  // Exact minimum
      [2.0, 2.0],  // Exact maximum
      [1.0, 1.0],  // Default value
    ])('setFontSizeFactor(%f) results in FONT_SIZE_FACTOR = %f', (inputFactor, expectedFactor) => {
      subtitleOverlay.setFontSizeFactor(inputFactor);
      expect(subtitleOverlay['FONT_SIZE_FACTOR']).toBe(expectedFactor);
    });

    // Grid recalculations
    test.each([
      [1.0, 15 / 1.0, 32 / 1.0],  // Standard grid
      [2.0, 15 / 2.0, 32 / 2.0],  // Larger factor, smaller grid
      [0.5, 15 / 1.0, 32 / 0.5],  // Factor <1 → rows stay 15, columns grow
    ])('setFontSizeFactor(%f) recalculates grid: ROWS = %f, COLUMNS = %f', (factor, expectedRows, expectedColumns) => {
      // We need to floor for whole rows as they are represented in precompiled sass styles
      const expectedWholeRows = Math.floor(expectedRows)
      subtitleOverlay.setFontSizeFactor(factor);
      subtitleOverlay.recalculateCEAGrid();

      expect(subtitleOverlay['CEA608_NUM_ROWS']).toBe(expectedWholeRows);
      expect(subtitleOverlay['CEA608_NUM_COLUMNS']).toBe(expectedColumns);
    });

    test.each([
      [1.0, 5, 5, 5],         // Factor 1.0: grid remains 15 rows; row 5 remains unchanged.
      [1.0, 14, 14, 14],      // Factor 1.0: grid remains 15 rows; row 14 remains unchanged.
      [2.0, 14, 14, 6],       // Factor 2.0: grid becomes floor(15/2)=7 rows; rowDelta = 15-7=8; 14-8=6.
      [1.5, 12, 12, 7],       // Factor 1.5: grid becomes floor(15/1.5)=10 rows; 12 > 10 so rowDelta=15-10=5; 12-5=7.
      [1.5, 8, 8, 8],         // Factor 1.5: grid becomes 10 rows; 8 <= 10 so no clamping.
      [2.0, 14, undefined, 6] // If no originalRow provided, falls back to initial row (14) and is clamped to 6.
    ])(
      'with fontSizeFactor=%f, initialRow=%d, labelOriginalRow=%s, expected new row=%d',
      (fontSizeFactor, initialRow, labelOriginalRow, expectedRow) => {
        const element = document.createElement('div');
        const initialClass = `subtitle-position-cea608-row-${initialRow}`;
        element.classList.add(initialClass);

        const label = {
          getConfig: () =>
            labelOriginalRow !== undefined
              ? { originalRowPosition: labelOriginalRow }
              : {}
        };

        const regionContainer = {
          getDomElement: jest.fn(() => ({ get: () => [element] })),
          getComponents: jest.fn(() => [label]),
        } as unknown as SubtitleRegionContainer;

        subtitleOverlay.setFontSizeFactor(fontSizeFactor);
        subtitleOverlay.updateRegionRowPosition(regionContainer);

        const expectedClass = `subtitle-position-cea608-row-${expectedRow}`;
        expect(element.classList.contains(expectedClass)).toBe(true);

        // If the new class differs from the original, ensure the original is removed.
        if (expectedClass !== initialClass) {
          expect(element.classList.contains(initialClass)).toBe(false);
        }
      }
    );
  });
});
