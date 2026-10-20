import { Component, ComponentConfig } from '../../../../src/ts/components/Component';
import { Container } from '../../../../src/ts/components/Container';
import type { GraphFrame } from '../../../../src/ts/components/panels/player-graphs/GraphCanvas';
import {
  PlayerGraphsPanel,
  PlayerGraphsPanelConfig,
} from '../../../../src/ts/components/panels/player-graphs/PlayerGraphsPanel';
import { SegmentTimelineGraph } from '../../../../src/ts/components/panels/player-graphs/SegmentTimelineGraph';
import { EventDispatcher } from '../../../../src/ts/EventDispatcher';
import type { UIInstanceManager } from '../../../../src/ts/UIManager';
import { buildPlayer, installCanvasStub, PLAYER_EVENTS, PlayerStub, segmentRequest } from './graphTestHelpers';

/** Only the dispatchers the base classes of the panel subscribe to. */
function buildUiInstanceManager(): UIInstanceManager {
  return {
    onConfigured: new EventDispatcher(),
    onControlsShow: new EventDispatcher(),
    onControlsHide: new EventDispatcher(),
    onComponentShow: new EventDispatcher(),
    onComponentHide: new EventDispatcher(),
    onComponentViewModeChanged: new EventDispatcher(),
    onRelease: new EventDispatcher(),
    getConfig: jest.fn(() => ({})),
  } as unknown as UIInstanceManager;
}

/** Initializes every component of the tree, as `UIManager` does. */
function initializeTree(component: Component<ComponentConfig>): void {
  component.initialize();
  if (component instanceof Container) {
    component.getComponents().forEach(initializeTree);
  }
}

describe('PlayerGraphsPanel', () => {
  let player: PlayerStub;
  let renderSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    installCanvasStub();
    // Webpack replaces `{{PREFIX}}` at build time, so under jest the published prefix stands in for it.
    jest
      .spyOn(Component.prototype as unknown as { prefixCss: (cssClassOrId: string) => string }, 'prefixCss')
      .mockImplementation((cssClassOrId: string) => `bmpui-${cssClassOrId}`);
    renderSpy = jest.spyOn(SegmentTimelineGraph.prototype, 'render');
    player = buildPlayer();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  function buildPanel(config: PlayerGraphsPanelConfig = {}): PlayerGraphsPanel {
    const panel = new PlayerGraphsPanel(config);
    initializeTree(panel);
    panel.configure(player, buildUiInstanceManager());

    return panel;
  }

  function lastFrame(): GraphFrame {
    return renderSpy.mock.calls[renderSpy.mock.calls.length - 1][0];
  }

  it('records while hidden and repaints every second while shown', () => {
    const panel = buildPanel();
    player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4));
    expect(renderSpy).not.toHaveBeenCalled();

    panel.show();
    expect(lastFrame().records).toEqual([expect.objectContaining({ uid: 's1' })]);
    jest.advanceTimersByTime(2000);
    expect(renderSpy).toHaveBeenCalledTimes(3);

    panel.hide();
    jest.advanceTimersByTime(2000);
    expect(renderSpy).toHaveBeenCalledTimes(3);
  });

  it('paints a panel configured visible without waiting for it to be shown', () => {
    buildPanel({ hidden: false });

    expect(renderSpy).toHaveBeenCalledTimes(1);
  });

  it('draws the player state from before an ad break while the ad plays', () => {
    const panel = buildPanel();
    panel.show();
    player.fire(PLAYER_EVENTS.AdBreakStarted);
    (player as any).getCurrentTime = () => 2;
    jest.advanceTimersByTime(1000);

    expect(lastFrame().currentTime).toBe(10);
  });

  it('highlights only renditions the player lists', () => {
    (player as any).getPlaybackVideoData = () => ({ id: 'undefined' });
    buildPanel().show();

    expect(lastFrame().state.activeRenditionIds).toEqual(['a-en']);
  });

  it('stops recording and painting when released', () => {
    const panel = buildPanel();
    panel.show();
    panel.release();
    jest.advanceTimersByTime(2000);

    // `PlayerResized` belongs to `SettingsPanel`.
    expect(Array.from(player.handlers.keys())).toEqual([PLAYER_EVENTS.PlayerResized]);
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });

  describe('pause', () => {
    it('stands still at the paused instant while recording continues, and resumes following the player', () => {
      const panel = buildPanel();
      panel.show();
      panel.pause();
      (player as any).getCurrentTime = () => 20;
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 18));
      jest.advanceTimersByTime(1000);

      expect(panel.isPaused()).toBe(true);
      expect(lastFrame()).toEqual(expect.objectContaining({ currentTime: 10, stillView: true }));
      expect(lastFrame().records).toHaveLength(1);

      panel.resume();
      expect(lastFrame()).toEqual(expect.objectContaining({ currentTime: 20, stillView: false }));
    });
  });

  describe('snapshots', () => {
    it('exports what the graphs show and draws it again in another panel', () => {
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4));
      const snapshot = buildPanel().exportSnapshot();
      const other = buildPanel();
      other.show();
      other.loadSnapshot(JSON.parse(JSON.stringify(snapshot)));

      expect(snapshot).toEqual(
        expect.objectContaining({
          format: 'bitmovin-player-graphs',
          version: 1,
          player: expect.objectContaining({ currentTime: 10, source: 'https://example.com/manifest.mpd' }),
        }),
      );
      expect(other.isShowingSnapshot()).toBe(true);
      expect(lastFrame()).toEqual(expect.objectContaining({ stillView: true, records: snapshot.segments }));
    });

    it('rejects data that is not a snapshot', () => {
      expect(() => buildPanel().loadSnapshot({ format: 'other' } as any)).toThrow();
    });

    it('returns to the player when the next source unloads', () => {
      const panel = buildPanel();
      panel.loadSnapshot(panel.exportSnapshot());
      player.fire(PLAYER_EVENTS.SourceUnloaded);

      expect(panel.isShowingSnapshot()).toBe(false);
    });
  });

  describe('at a player error', () => {
    beforeEach(() => jest.spyOn(console, 'warn').mockImplementation(() => undefined));

    it('freezes on the session before the error when the source unloads, until the next source loads', () => {
      const panel = buildPanel();
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4));
      player.fire(PLAYER_EVENTS.Error, { code: 1201 });
      player.fire(PLAYER_EVENTS.SourceUnloaded);
      panel.show();

      expect(panel.isShowingSnapshot()).toBe(true);
      expect(lastFrame().records).toEqual([expect.objectContaining({ uid: 's1' })]);
      expect(panel.getErrorSnapshot()?.segments).toHaveLength(1);
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('player error 1201'));

      player.fire(PLAYER_EVENTS.SourceLoaded);
      expect(panel.isShowingSnapshot()).toBe(false);
    });
  });

  it('logs once that no Analytics session is linked', () => {
    jest.spyOn(console, 'info').mockImplementation(() => undefined);
    buildPanel();
    player.fire(PLAYER_EVENTS.SegmentPlayback, {});
    player.fire(PLAYER_EVENTS.SegmentPlayback, {});

    expect(console.info).toHaveBeenCalledTimes(1);
  });

  describe('insights', () => {
    function insightTexts(panel: PlayerGraphsPanel): string[] {
      return Array.from(panel.getDomElement().get(0).querySelectorAll('li')).map(item => item.textContent);
    }

    it('states the findings, counts them in the timeline caption and names the Analytics session', () => {
      (player as any).analytics = { getCurrentImpressionId: () => 'impression-1' };
      const panel = buildPanel();
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 12, { attempts: 3 }));
      panel.show();

      expect(insightTexts(panel)).toEqual([
        expect.stringContaining('1 segment on the timeline needed retries'),
        'Bitmovin Analytics impression impression-1: the same session in the Bitmovin Dashboard.',
      ]);
      expect(panel.getDomElement().get(0).textContent).toContain('Segment timeline — 1 with retries');
    });

    it('carries the findings in a snapshot, with the error first in a snapshot at a player error', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => undefined);
      const panel = buildPanel();
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 12, { attempts: 3 }));
      player.fire(PLAYER_EVENTS.Error, { code: 1201, name: 'SOURCE_ERROR', message: 'gone' });

      expect(panel.getErrorSnapshot().insights.map(insight => insight.kind)).toEqual(['error', 'retries']);
      expect(panel.getErrorSnapshot().insights[0].text).toBe('Player error 1201 SOURCE_ERROR: gone, at 00:10.00.');
    });
  });

  describe('buffer', () => {
    it('reads the forward buffer target of each media type', () => {
      buildPanel().show();

      expect(lastFrame().state.bufferTargets).toEqual({ video: 40, audio: 40 });
    });

    it('reports a media type without a download for two segment durations while its buffer has room', () => {
      const panel = buildPanel();
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4, { duration: 4 }));
      jest.advanceTimersByTime(7000);
      panel.show();
      expect(lastFrame().state.downloadWaits).toEqual({});

      jest.advanceTimersByTime(1000);
      expect(lastFrame().state.downloadWaits).toEqual({ video: { seconds: 8, bufferEnd: 30 } });
      expect(panel.getDomElement().get(0).textContent).toContain('no downloads');
    });
  });

  it('folds and unfolds a graph from its caption, and unfolds the insights when they have something to say', () => {
    const panel = buildPanel();
    panel.show();
    const captions = panel.getDomElement().get(0).querySelectorAll('.bmpui-ui-player-graphs-panel-item-label');
    const timeline = panel.getDomElement().get(0).querySelector('.bmpui-ui-player-graphs-segment-timeline');
    const insights = panel.getDomElement().get(0).querySelector('.bmpui-ui-player-graphs-panel-insights');
    expect(insights.classList).toContain('bmpui-hidden');

    (captions[0] as HTMLElement).click();
    expect(timeline.classList).toContain('bmpui-hidden');
    expect(captions[0].textContent).toContain('▶ Segment timeline');

    player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 12, { attempts: 2 }));
    jest.advanceTimersByTime(1000);
    expect(insights.classList).not.toContain('bmpui-hidden');
  });
});
