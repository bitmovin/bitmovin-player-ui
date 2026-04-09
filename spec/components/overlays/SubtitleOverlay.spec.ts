import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import {
  SubtitleOverlay,
  SubtitleLabel,
  SubtitleRegionContainer,
  SubtitleRegionContainerManager,
} from '../../../src/ts/components/overlays/SubtitleOverlay';
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

  describe('WebVTT container behavior', () => {
    beforeEach(() => {
      playerMock = MockHelper.getPlayerMock() as jest.Mocked<TestingPlayerAPI>;
      uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();

      subtitleOverlay = new SubtitleOverlay();
      subtitleOverlay.configure(playerMock, uiInstanceManagerMock);
      subtitleRegionContainerManagerMock = (subtitleOverlay as any).subtitleContainerManager;
    });

    it('does not mark non-VTT labels as cue boxes', () => {
      const label = subtitleOverlay.generateLabel(createSubtitleCueEvent());

      expect(label.getConfig().cssClasses).toEqual([]);
    });

    it('marks non-region VTT labels as cue boxes', () => {
      const label = subtitleOverlay.generateLabel(createSubtitleCueEvent({ vtt: createVttProps() }));

      expect(label.getConfig().cssClasses).toEqual(['subtitle-vtt-cue']);
    });

    it('does not mark VTT region labels as cue boxes', () => {
      const label = subtitleOverlay.generateLabel(
        createSubtitleCueEvent({ vtt: createVttProps({ region: { id: 'region-1' } }) }),
      );

      expect(label.getConfig().cssClasses).toEqual([]);
    });

    it('creates a non-region VTT container that stays in normal flow and marks it as a cue container', () => {
      const regionContainerDom = MockHelper.generateDOMMock();
      jest.spyOn(SubtitleRegionContainer.prototype, 'getDomElement').mockReturnValue(regionContainerDom);
      const addComponentSpy = jest.spyOn(subtitleOverlay, 'addComponent');
      const mergeConfigMock = (SubtitleRegionContainer.prototype as any).mergeConfig as jest.Mock;
      mergeConfigMock.mockClear();

      const label = new SubtitleLabel({
        text: 'Test Subtitle',
        vtt: createVttProps(),
      });

      subtitleRegionContainerManagerMock.addLabel(label);

      expect(Object.keys((subtitleRegionContainerManagerMock as any).subtitleRegionContainers)).toContain('vtt');
      expect(addComponentSpy).toHaveBeenCalledTimes(1);
      expect(getMergedCssClasses(mergeConfigMock)).toEqual(['subtitle-position-vtt', 'subtitle-vtt-cue-container']);
      expect(regionContainerDom.css).toHaveBeenCalledWith('position', 'static');
    });

    it('creates a VTT region container with region-specific classes', () => {
      const regionContainerDom = MockHelper.generateDOMMock();
      jest.spyOn(SubtitleRegionContainer.prototype, 'getDomElement').mockReturnValue(regionContainerDom);
      const addComponentSpy = jest.spyOn(subtitleOverlay, 'addComponent');
      const mergeConfigMock = (SubtitleRegionContainer.prototype as any).mergeConfig as jest.Mock;
      mergeConfigMock.mockClear();

      const label = new SubtitleLabel({
        text: 'Test Subtitle',
        vtt: createVttProps({ region: { id: 'region-1' } }),
      });

      subtitleRegionContainerManagerMock.addLabel(label);

      expect(Object.keys((subtitleRegionContainerManagerMock as any).subtitleRegionContainers)).toContain('region-1');
      expect(addComponentSpy).toHaveBeenCalledTimes(1);
      expect(getMergedCssClasses(mergeConfigMock)).toEqual([
        'subtitle-position-vtt',
        'subtitle-vtt-region-container',
        'vtt-region-region-1',
      ]);
      expect(regionContainerDom.css).toHaveBeenCalledWith('position', 'static');
    });

    it('keeps non-VTT containers free of VTT-specific classes', () => {
      const mergeConfigMock = (SubtitleRegionContainer.prototype as any).mergeConfig as jest.Mock;
      mergeConfigMock.mockClear();

      subtitleRegionContainerManagerMock.addLabel(new SubtitleLabel({ text: 'Test Subtitle', region: 'default' }));

      expect(getMergedCssClasses(mergeConfigMock)).toEqual(['subtitle-position-default']);
    });

    it('preserves non-region VTT cue-box semantics on cue updates', () => {
      const replaceLabelSpy = jest.spyOn(subtitleRegionContainerManagerMock, 'replaceLabel');
      const cueEvent = createSubtitleCueEvent({ vtt: createVttProps() });

      playerMock.eventEmitter.fireEvent({ ...cueEvent, type: playerMock.exports.PlayerEvent.CueEnter } as any);
      playerMock.eventEmitter.fireEvent({ ...cueEvent, type: playerMock.exports.PlayerEvent.CueUpdate } as any);

      expect(replaceLabelSpy).toHaveBeenCalledTimes(1);
      expect(getLabelCssClasses(replaceLabelSpy, 0, 0)).toEqual(['subtitle-vtt-cue']);
      expect(getLabelCssClasses(replaceLabelSpy, 0, 1)).toEqual(['subtitle-vtt-cue']);
    });

    it('removes non-region VTT labels from the cue container on cue exit', () => {
      const removeLabelSpy = jest.spyOn(subtitleRegionContainerManagerMock, 'removeLabel');
      const cueEvent = createSubtitleCueEvent({ vtt: createVttProps() });

      playerMock.eventEmitter.fireEvent({ ...cueEvent, type: playerMock.exports.PlayerEvent.CueEnter } as any);
      playerMock.eventEmitter.fireEvent({ ...cueEvent, type: playerMock.exports.PlayerEvent.CueExit } as any);

      expect(removeLabelSpy).toHaveBeenCalledTimes(1);
      expect(getLabelCssClasses(removeLabelSpy, 0, 0)).toEqual(['subtitle-vtt-cue']);
    });

    it.todo('moves updated VTT cues into a different container when the region assignment changes');
  });
});

function getMergedCssClasses(mergeConfigMock: jest.Mock): string[] {
  return mergeConfigMock.mock.calls[0][0].cssClasses;
}

function getLabelCssClasses(spy: jest.SpyInstance, callIndex: number, argIndex: number): string[] {
  const label = spy.mock.calls[callIndex][argIndex] as SubtitleLabel;
  return label.getConfig().cssClasses;
}

function createSubtitleCueEvent(overrides: Record<string, unknown> = {}) {
  return {
    subtitleId: 'subtitleId',
    start: 0,
    end: 10,
    text: 'Test Subtitle',
    ...overrides,
  } as any;
}

function createVttProps(overrides: Record<string, unknown> = {}) {
  return {
    region: null,
    ...overrides,
  } as any;
}
