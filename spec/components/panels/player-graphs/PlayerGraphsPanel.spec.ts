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
});
