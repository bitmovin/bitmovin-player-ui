import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import {
  SubtitleOverlay,
  SubtitleLabel,
  SubtitleRegionContainer,
  SubtitleRegionContainerManager,
} from '../../../src/ts/components/overlays/SubtitleOverlay';
import { DOM } from '../../../src/ts/DOM';
import { VttUtils } from '../../../src/ts/utils/VttUtils';

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

  describe('CEA 608 caption formatting config', () => {
    // This block uses the real Container implementation (via jest.isolateModules + jest.unmock)
    // so that the SubtitleOverlay constructor's mergeConfig call actually runs. That means the
    // "default is true" contract is exercised end-to-end — if the mergeConfig defaults object
    // ever loses this field, these tests will fail.
    let RealSubtitleOverlay: typeof SubtitleOverlay;
    let RealSubtitleRegionContainer: typeof SubtitleRegionContainer;

    beforeAll(() => {
      jest.isolateModules(() => {
        jest.unmock('../../../src/ts/components/Container');
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const module = require('../../../src/ts/components/overlays/SubtitleOverlay');
        RealSubtitleOverlay = module.SubtitleOverlay;
        RealSubtitleRegionContainer = module.SubtitleRegionContainer;
      });
    });

    beforeEach(() => {
      playerMock = MockHelper.getPlayerMock() as jest.Mocked<TestingPlayerAPI>;
      uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
    });

    afterEach(() => jest.restoreAllMocks());

    function fireCea608CueEnter() {
      playerMock.eventEmitter.fireEvent({
        subtitleId: 'subtitleId',
        start: 0,
        end: 10,
        text: 'Test Subtitle',
        position: { row: 5, column: 10 },
        type: playerMock.exports.PlayerEvent.CueEnter,
      } as any);
    }

    function setupOverlay(config: { enableCea608CaptionFormatting?: boolean } = {}): {
      overlay: SubtitleOverlay;
      overlayDom: jest.Mocked<DOM>;
    } {
      const overlay = new RealSubtitleOverlay(config);
      overlay.configure(playerMock, uiInstanceManagerMock);
      // The real CEA-608 grid-size calculation reads pixel dimensions off the DOM, which are
      // unavailable under jsdom without a real layout. Stub it out: the tests only care about
      // the class-toggling and letter-spacing decisions, not the computed grid values.
      (overlay as any).ensureCea608GridSizeUpdated = (): void => undefined;
      const overlayDom = MockHelper.generateDOMMock();
      jest.spyOn(overlay, 'getDomElement').mockReturnValue(overlayDom);
      jest.spyOn(RealSubtitleRegionContainer.prototype, 'getDomElement').mockReturnValue(MockHelper.generateDOMMock());
      // updateComponents touches innerContainerElement which isn't set up under the mocked DOM.
      jest.spyOn(RealSubtitleRegionContainer.prototype, 'updateComponents').mockImplementation(() => undefined);
      return { overlay, overlayDom };
    }

    function getLetterSpacingStyle(addLabelSpy: jest.SpyInstance) {
      const label = addLabelSpy.mock.calls[0][0] as SubtitleLabel;
      const labelCssCalls = (label.getDomElement().css as jest.Mock).mock.calls;
      const styleArgs = labelCssCalls.map(call => call[0]).filter(arg => typeof arg === 'object');
      return styleArgs.find(style => 'letter-spacing' in style);
    }

    it('applies CEA-608 positioning and formatting classes when the config is not set (default behavior)', () => {
      const { overlayDom } = setupOverlay();

      fireCea608CueEnter();

      expect(overlayDom.addClass).toHaveBeenCalledWith(expect.stringMatching(/cea608$/));
      expect(overlayDom.addClass).toHaveBeenCalledWith(expect.stringMatching(/cea608-formatting$/));
    });

    it('applies CEA-608 positioning but not the formatting class when enableCea608CaptionFormatting is false', () => {
      const { overlayDom } = setupOverlay({ enableCea608CaptionFormatting: false });

      fireCea608CueEnter();

      expect(overlayDom.addClass).toHaveBeenCalledWith(expect.stringMatching(/cea608$/));
      expect(overlayDom.addClass).not.toHaveBeenCalledWith(expect.stringMatching(/cea608-formatting$/));
    });

    it('does not set inline letter-spacing on the label when enableCea608CaptionFormatting is false', () => {
      const { overlay } = setupOverlay({ enableCea608CaptionFormatting: false });
      const addLabelSpy = jest.spyOn((overlay as any).subtitleContainerManager, 'addLabel');

      fireCea608CueEnter();

      expect(getLetterSpacingStyle(addLabelSpy)).toBeUndefined();
    });

    it('sets inline letter-spacing on the label when the config is not set (default behavior)', () => {
      const { overlay } = setupOverlay();
      const addLabelSpy = jest.spyOn((overlay as any).subtitleContainerManager, 'addLabel');

      fireCea608CueEnter();

      expect(getLetterSpacingStyle(addLabelSpy)).toBeDefined();
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

    afterEach(() => jest.restoreAllMocks());

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
      jest.spyOn(SubtitleRegionContainer.prototype, 'getDomElement').mockReturnValue(MockHelper.generateDOMMock());
      jest.spyOn(subtitleOverlay, 'getDomElement').mockReturnValue({
        ...MockHelper.generateDOMMock(),
        size: jest.fn().mockReturnValue({ width: 0, height: 0 }),
      } as any);
      const replaceLabelSpy = jest.spyOn(subtitleRegionContainerManagerMock, 'replaceLabel');
      const cueEvent = createSubtitleCueEvent({ vtt: createVttProps() });

      playerMock.eventEmitter.fireEvent({ ...cueEvent, type: playerMock.exports.PlayerEvent.CueEnter } as any);
      playerMock.eventEmitter.fireEvent({ ...cueEvent, type: playerMock.exports.PlayerEvent.CueUpdate } as any);

      expect(replaceLabelSpy).toHaveBeenCalledTimes(1);
      expect(getLabelCssClasses(replaceLabelSpy, 0, 0)).toEqual(['subtitle-vtt-cue']);
      expect(getLabelCssClasses(replaceLabelSpy, 0, 1)).toEqual(['subtitle-vtt-cue']);
    });

    it('removes non-region VTT labels from the cue container on cue exit', () => {
      jest.spyOn(SubtitleRegionContainer.prototype, 'getDomElement').mockReturnValue(MockHelper.generateDOMMock());
      jest.spyOn(subtitleOverlay, 'getDomElement').mockReturnValue({
        ...MockHelper.generateDOMMock(),
        size: jest.fn().mockReturnValue({ width: 0, height: 0 }),
      } as any);
      const removeLabelSpy = jest.spyOn(subtitleRegionContainerManagerMock, 'removeLabel');
      const cueEvent = createSubtitleCueEvent({ vtt: createVttProps() });

      playerMock.eventEmitter.fireEvent({ ...cueEvent, type: playerMock.exports.PlayerEvent.CueEnter } as any);
      playerMock.eventEmitter.fireEvent({ ...cueEvent, type: playerMock.exports.PlayerEvent.CueExit } as any);

      expect(removeLabelSpy).toHaveBeenCalledTimes(1);
      expect(getLabelCssClasses(removeLabelSpy, 0, 0)).toEqual(['subtitle-vtt-cue']);
    });

    it('moves updated VTT cues into the correct container when the region assignment changes', () => {
      jest.spyOn(SubtitleRegionContainer.prototype, 'getDomElement').mockReturnValue(MockHelper.generateDOMMock());
      const overlaySize = { width: 640, height: 360 };
      const setVttRegionStylesSpy = jest.spyOn(VttUtils, 'setVttRegionStyles');
      const updateComponentsSpy = jest.spyOn(subtitleOverlay, 'updateComponents');
      jest.spyOn(subtitleOverlay, 'removeComponent');
      jest.spyOn(subtitleOverlay, 'getDomElement').mockReturnValue({
        ...MockHelper.generateDOMMock(),
        size: jest.fn().mockReturnValue(overlaySize),
      } as any);

      const previousCueEvent = createSubtitleCueEvent({ vtt: createVttProps() });
      const updatedCueEvent = createSubtitleCueEvent({
        vtt: createVttProps({ region: { id: 'region-1' } }),
      });

      playerMock.eventEmitter.fireEvent({ ...previousCueEvent, type: playerMock.exports.PlayerEvent.CueEnter } as any);
      playerMock.eventEmitter.fireEvent({ ...updatedCueEvent, type: playerMock.exports.PlayerEvent.CueUpdate } as any);

      expect(Object.keys((subtitleRegionContainerManagerMock as any).subtitleRegionContainers)).toEqual(['region-1']);
      expect(setVttRegionStylesSpy).toHaveBeenCalledWith(expect.anything(), updatedCueEvent.vtt.region, overlaySize);
      expect(subtitleOverlay.removeComponent).toHaveBeenCalledTimes(1);
      expect(updateComponentsSpy).toHaveBeenCalled();
    });
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
