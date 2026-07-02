import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import {
  SubtitleOverlay,
  SubtitleLabel,
  SubtitleRegionContainer,
  SubtitleRegionContainerManager,
} from '../../../src/ts/components/overlays/SubtitleOverlay';
import { DOM } from '../../../src/ts/DOM';
import { PlayerEvent, PlayerResizedEvent, SubtitleCueEvent } from 'bitmovin-player';
import { ControlBar } from '../../../src/ts/components/ControlBar';
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
      mockDomElement = MockHelper.generateDOMMock();
      jest.spyOn(subtitleOverlay, 'getDomElement').mockReturnValue(mockDomElement);
      subtitleOverlay.configure(playerMock, uiInstanceManagerMock);
      subtitleRegionContainerManagerMock = (subtitleOverlay as any).subtitleContainerManager;
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
      jest.spyOn(subtitleOverlay, 'getDomElement').mockReturnValue(MockHelper.generateDOMMock());
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

      mockDomElement = MockHelper.generateDOMMock();
      jest.spyOn(mockDomElement, 'width').mockReturnValue(320);
      jest.spyOn(mockDomElement, 'height').mockReturnValue(180);
      jest.spyOn(mockDomElement, 'get').mockReturnValue([document.createElement('div')] as any);
      jest.spyOn(subtitleOverlay, 'getDomElement').mockReturnValue(mockDomElement);

      subtitleOverlay.configure(playerMock, uiInstanceManagerMock);
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

    it('skips CEA grid recalculation after controlbar show when pushup is disabled', () => {
      (subtitleOverlay as any).cea608Enabled = true;
      (subtitleOverlay as any).ensureCea608GridSizeUpdated = jest.fn();
      jest.spyOn(mockDomElement, 'hasClass').mockReturnValue(true);

      const onComponentShowHandler = MockHelper.getMockCallArg<(component: unknown) => void>(
        uiInstanceManagerMock.onComponentShow.subscribe as jest.Mock,
      );

      onComponentShowHandler(new ControlBar({}));

      expect((subtitleOverlay as any).ensureCea608GridSizeUpdated).not.toHaveBeenCalled();
    });
  });

  describe('CEA 608 pushup class', () => {
    let mockDomElement: DOM;

    beforeEach(() => {
      playerMock = MockHelper.getPlayerMock() as jest.Mocked<TestingPlayerAPI>;
      uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
      subtitleOverlay = new SubtitleOverlay();
      mockDomElement = MockHelper.generateDOMMock();
      jest.spyOn(subtitleOverlay, 'getDomElement').mockReturnValue(mockDomElement);
      // Container is mocked, so prefixCss() returns undefined by default — provide a real implementation.
      jest.spyOn(subtitleOverlay as any, 'prefixCss').mockImplementation((cls: string) => `bmpui-${cls}`);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    const pushupDisabledClass = expect.stringContaining('cea608-pushup-disabled');

    it('adds the pushup-disabled class on configure when player height is below the default threshold', () => {
      jest.spyOn(DOM.prototype, 'height').mockReturnValue(180);
      subtitleOverlay.configure(playerMock, uiInstanceManagerMock);

      expect(mockDomElement.addClass).toHaveBeenCalledWith(pushupDisabledClass);
    });

    it('adds the pushup-disabled class on configure when player height meets the default threshold', () => {
      jest.spyOn(DOM.prototype, 'height').mockReturnValue(360);
      subtitleOverlay.configure(playerMock, uiInstanceManagerMock);

      expect(mockDomElement.addClass).toHaveBeenCalledWith(pushupDisabledClass);
    });

    it('adds the pushup-disabled class when PlayerResized fires below the threshold', () => {
      jest.spyOn(DOM.prototype, 'height').mockReturnValue(400);
      subtitleOverlay.configure(playerMock, uiInstanceManagerMock);
      (mockDomElement.addClass as jest.Mock).mockClear();

      playerMock.eventEmitter.fireEvent({
        type: PlayerEvent.PlayerResized,
        height: '180px',
        width: '320px',
        timestamp: Date.now(),
      } as PlayerResizedEvent);

      expect(mockDomElement.addClass).toHaveBeenCalledWith(pushupDisabledClass);
    });

    it('adds the pushup-disabled class when PlayerResized fires at the threshold', () => {
      jest.spyOn(DOM.prototype, 'height').mockReturnValue(400);
      subtitleOverlay.configure(playerMock, uiInstanceManagerMock);
      (mockDomElement.addClass as jest.Mock).mockClear();

      playerMock.eventEmitter.fireEvent({
        type: PlayerEvent.PlayerResized,
        height: '360px',
        width: '640px',
        timestamp: Date.now(),
      } as PlayerResizedEvent);

      expect(mockDomElement.addClass).toHaveBeenCalledWith(pushupDisabledClass);
    });

    it('removes the pushup-disabled class when PlayerResized fires above the threshold', () => {
      jest.spyOn(DOM.prototype, 'height').mockReturnValue(180);
      subtitleOverlay.configure(playerMock, uiInstanceManagerMock);
      (mockDomElement.removeClass as jest.Mock).mockClear();

      playerMock.eventEmitter.fireEvent({
        type: PlayerEvent.PlayerResized,
        height: '400px',
        width: '640px',
        timestamp: Date.now(),
      } as PlayerResizedEvent);

      expect(mockDomElement.removeClass).toHaveBeenCalledWith(pushupDisabledClass);
    });

    it('respects a custom cea608SmallPlayerHeightThreshold config value', () => {
      (uiInstanceManagerMock.getConfig as jest.Mock).mockReturnValue({
        cea608SmallPlayerHeightThreshold: 500,
        events: { onUpdated: MockHelper.getEventDispatcherMock() },
        metadata: { markers: [] },
      });
      jest.spyOn(DOM.prototype, 'height').mockReturnValue(400);
      subtitleOverlay.configure(playerMock, uiInstanceManagerMock);

      expect(mockDomElement.addClass).toHaveBeenCalledWith(pushupDisabledClass);
    });

    it('never adds the pushup-disabled class when cea608SmallPlayerHeightThreshold is 0', () => {
      (uiInstanceManagerMock.getConfig as jest.Mock).mockReturnValue({
        cea608SmallPlayerHeightThreshold: 0,
        events: { onUpdated: MockHelper.getEventDispatcherMock() },
        metadata: { markers: [] },
      });
      jest.spyOn(DOM.prototype, 'height').mockReturnValue(180);
      subtitleOverlay.configure(playerMock, uiInstanceManagerMock);

      expect(mockDomElement.addClass).not.toHaveBeenCalledWith(pushupDisabledClass);
    });
  });

  describe('CEA 608 caption formatting config', () => {
    // This block uses the real Container implementation (via jest.isolateModules + jest.unmock)
    // so that the SubtitleOverlay constructor's mergeConfig call actually runs. That means the
    // "default is true" contract is exercised end-to-end — if the mergeConfig defaults object
    // ever loses this field, these tests will fail.
    let RealSubtitleOverlay: typeof SubtitleOverlay;
    let RealSubtitleRegionContainer: typeof SubtitleRegionContainer;
    let RealSubtitleLabel: typeof SubtitleLabel;

    beforeAll(() => {
      jest.isolateModules(() => {
        jest.unmock('../../../src/ts/components/Container');
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const module = require('../../../src/ts/components/overlays/SubtitleOverlay');
        RealSubtitleOverlay = module.SubtitleOverlay;
        RealSubtitleRegionContainer = module.SubtitleRegionContainer;
        RealSubtitleLabel = module.SubtitleLabel;
      });
    });

    beforeEach(() => {
      playerMock = MockHelper.getPlayerMock() as jest.Mocked<TestingPlayerAPI>;
      uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
    });

    afterEach(() => jest.restoreAllMocks());

    function fireCea608CueEnter() {
      // position triggers the CEA-608 code path in SubtitleOverlay (see isCea608SubtitleCue)
      playerMock.eventEmitter.fireSubtitleCueEnterEvent({ position: { row: 5, column: 10 } });
    }

    function setupOverlay(
      config: { enableCea608CaptionFormatting?: boolean; enableCea608CaptionPositioning?: boolean } = {},
    ): {
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
      // updateComponents on both the overlay and its region containers touches DOM plumbing
      // (innerContainerElement, child .remove()) that isn't set up under the mocked DOM.
      jest.spyOn(overlay, 'updateComponents').mockImplementation(() => undefined);
      jest.spyOn(RealSubtitleRegionContainer.prototype, 'updateComponents').mockImplementation(() => undefined);
      return { overlay, overlayDom };
    }

    function getLetterSpacingStyle(addLabelSpy: jest.SpyInstance): unknown {
      const label = addLabelSpy.mock.calls[0][0] as SubtitleLabel;
      const labelCssCalls = (label.getDomElement().css as jest.Mock).mock.calls;
      // The CEA-608 cue path calls css() exactly once with a style object. If a future
      // change adds another call (or switches to the css(name, value) form), fail loudly
      // here rather than silently filtering it out.
      expect(labelCssCalls).toHaveLength(1);
      const style = labelCssCalls[0][0] as Record<string, string>;
      return style['letter-spacing'];
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

    it('removes both CEA-608 classes on reset, even when the formatting class was never added', () => {
      // When the formatting class is disabled it's never added, but the reset path still
      // calls removeClass on it. Guard against a future refactor that makes the removal
      // conditional and accidentally leaves stale classes on the overlay.
      const { overlayDom } = setupOverlay({ enableCea608CaptionFormatting: false });

      fireCea608CueEnter();
      playerMock.eventEmitter.fireSourceUnloadedEvent();

      expect(overlayDom.removeClass).toHaveBeenCalledWith(expect.stringMatching(/cea608$/));
      expect(overlayDom.removeClass).toHaveBeenCalledWith(expect.stringMatching(/cea608-formatting$/));
    });

    it.each([
      {
        label: 'does not re-apply letter-spacing on grid recalculation when formatting is disabled',
        config: { enableCea608CaptionFormatting: false },
        letterSpacingExpected: false,
      },
      {
        label: 'does re-apply letter-spacing on grid recalculation when formatting is enabled (default)',
        config: {},
        letterSpacingExpected: true,
      },
    ])('$label', ({ config, letterSpacingExpected }) => {
      // Regression: ensureCea608GridSizeUpdated runs on onShow/PlayerResized/ControlBar toggles
      // and used to unconditionally write letter-spacing onto every active label, undoing the
      // formatting opt-out for already-rendered cues. Root cause of the f1-stream bug.
      const overlay = new RealSubtitleOverlay(config);
      const overlayDom = MockHelper.generateDOMMock();
      (overlayDom.width as jest.Mock).mockReturnValue(1280);
      (overlayDom.height as jest.Mock).mockReturnValue(720);
      (overlayDom.get as jest.Mock).mockReturnValue([{ style: { setProperty: jest.fn() } }]);
      jest.spyOn(overlay, 'getDomElement').mockReturnValue(overlayDom);
      jest.spyOn(overlay, 'updateComponents').mockImplementation(() => undefined);
      jest.spyOn(RealSubtitleRegionContainer.prototype, 'getDomElement').mockReturnValue(MockHelper.generateDOMMock());
      jest.spyOn(RealSubtitleRegionContainer.prototype, 'updateComponents').mockImplementation(() => undefined);
      // Labels use their DOM for measurements inside the grid calc (dummy label) and for
      // style writes (the actual cue label). Non-zero width/height avoids NaN in the calc.
      // Spy on the isolated-module's SubtitleLabel, not the outer import — otherwise the
      // real code's `new SubtitleLabel()` creates instances whose prototype isn't the one
      // we spied on.
      const labelDom = MockHelper.generateDOMMock();
      (labelDom.width as jest.Mock).mockReturnValue(10);
      (labelDom.height as jest.Mock).mockReturnValue(20);
      jest.spyOn(RealSubtitleLabel.prototype, 'getDomElement').mockReturnValue(labelDom);

      overlay.configure(playerMock, uiInstanceManagerMock);
      fireCea608CueEnter();
      // Change overlay dimensions so the grid recalc doesn't bail on the unchanged-size check.
      (overlayDom.width as jest.Mock).mockReturnValue(1920);
      (overlayDom.height as jest.Mock).mockReturnValue(1080);
      (labelDom.css as jest.Mock).mockClear();
      (overlay as any).ensureCea608GridSizeUpdated();

      const cssCalls = (labelDom.css as jest.Mock).mock.calls;
      const writtenStyles = cssCalls.map((call: unknown[]) => call[0]).filter(arg => arg && typeof arg === 'object');
      const hasLetterSpacingWrite = writtenStyles.some(style => 'letter-spacing' in (style as object));
      expect(hasLetterSpacingWrite).toBe(letterSpacingExpected);
    });
  });

  describe('CEA-608 caption positioning config', () => {
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
      playerMock.eventEmitter.fireSubtitleCueEnterEvent({ position: { row: 5, column: 10 } });
    }

    function setupPositioningOverlay(
      config: { enableCea608CaptionFormatting?: boolean; enableCea608CaptionPositioning?: boolean } = {},
    ): {
      overlay: SubtitleOverlay;
      overlayDom: jest.Mocked<DOM>;
    } {
      const overlay = new RealSubtitleOverlay(config);
      overlay.configure(playerMock, uiInstanceManagerMock);
      (overlay as any).ensureCea608GridSizeUpdated = (): void => undefined;
      const overlayDom = MockHelper.generateDOMMock();
      jest.spyOn(overlay, 'getDomElement').mockReturnValue(overlayDom);
      jest.spyOn(RealSubtitleRegionContainer.prototype, 'getDomElement').mockReturnValue(MockHelper.generateDOMMock());
      jest.spyOn(overlay, 'updateComponents').mockImplementation(() => undefined);
      jest.spyOn(RealSubtitleRegionContainer.prototype, 'updateComponents').mockImplementation(() => undefined);
      return { overlay, overlayDom };
    }

    it('does not apply the cea608 class when enableCea608CaptionPositioning is false', () => {
      const { overlayDom } = setupPositioningOverlay({ enableCea608CaptionPositioning: false });

      fireCea608CueEnter();

      expect(overlayDom.addClass).not.toHaveBeenCalledWith(expect.stringMatching(/cea608$/));
    });

    it('does not set left offset or regionStyle on the label when enableCea608CaptionPositioning is false', () => {
      const { overlay } = setupPositioningOverlay({ enableCea608CaptionPositioning: false });
      const addLabelSpy = jest.spyOn((overlay as any).subtitleContainerManager, 'addLabel');

      fireCea608CueEnter();

      const label = addLabelSpy.mock.calls[0][0] as SubtitleLabel;
      const cssCalls = (label.getDomElement().css as jest.Mock).mock.calls;
      expect(cssCalls).toHaveLength(0);
      expect((label as any).regionStyle).toBeUndefined();
    });

    it('still applies cea608-formatting class when positioning is disabled and formatting is enabled', () => {
      const { overlayDom } = setupPositioningOverlay({ enableCea608CaptionPositioning: false });

      fireCea608CueEnter();

      expect(overlayDom.addClass).toHaveBeenCalledWith(expect.stringMatching(/cea608-formatting$/));
    });

    it('does not apply cea608-formatting class when both positioning and formatting are disabled', () => {
      const { overlayDom } = setupPositioningOverlay({
        enableCea608CaptionPositioning: false,
        enableCea608CaptionFormatting: false,
      });

      fireCea608CueEnter();

      expect(overlayDom.addClass).not.toHaveBeenCalledWith(expect.stringMatching(/cea608-formatting$/));
    });

    it('removes the cea608-formatting class on reset when positioning was disabled', () => {
      const { overlayDom } = setupPositioningOverlay({ enableCea608CaptionPositioning: false });

      fireCea608CueEnter();
      playerMock.eventEmitter.fireSourceUnloadedEvent();

      expect(overlayDom.removeClass).toHaveBeenCalledWith(expect.stringMatching(/cea608-formatting$/));
    });

    it('adds both cea608 and cea608-formatting classes when positioning and formatting are both enabled (default)', () => {
      const { overlayDom } = setupPositioningOverlay();

      fireCea608CueEnter();

      expect(overlayDom.addClass).toHaveBeenCalledWith(expect.stringMatching(/cea608$/));
      expect(overlayDom.addClass).toHaveBeenCalledWith(expect.stringMatching(/cea608-formatting$/));
    });
  });

  describe('WebVTT container behavior', () => {
    beforeEach(() => {
      playerMock = MockHelper.getPlayerMock() as jest.Mocked<TestingPlayerAPI>;
      uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();

      subtitleOverlay = new SubtitleOverlay();
      jest.spyOn(subtitleOverlay, 'getDomElement').mockReturnValue(MockHelper.generateDOMMock());
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
