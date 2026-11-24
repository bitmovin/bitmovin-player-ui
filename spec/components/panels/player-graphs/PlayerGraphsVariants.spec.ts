import { Component } from '../../../../src/ts/components/Component';
import { PlayerGraphsPanel } from '../../../../src/ts/components/panels/player-graphs/PlayerGraphsPanel';
import { UIContainer } from '../../../../src/ts/components/UIContainer';
import { UIManager } from '../../../../src/ts/UIManager';
import { buildPlayer, installCanvasStub, PLAYER_EVENTS, PlayerStub, segmentRequest } from './graphTestHelpers';

/** A player with what `UIManager` and its `UIContainer` read, besides what the graphs read. */
function buildUiPlayer(): PlayerStub {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const player = buildPlayer({
    getContainer: () => container,
    getViewMode: () => 'inline',
    isPlaying: () => false,
    isPaused: () => true,
    isStalled: () => false,
    isCasting: () => false,
    hasEnded: () => false,
    getConfig: () => ({}),
    getVolume: () => 100,
    isMuted: () => false,
  });
  Object.assign(player.exports, { ViewMode: { Fullscreen: 'fullscreen' } });

  return player;
}

describe('PlayerGraphsPanel across UI variants', () => {
  let player: PlayerStub;
  let panels: PlayerGraphsPanel[];
  let uiManager: UIManager;
  let canvas: ReturnType<typeof installCanvasStub>;

  beforeEach(() => {
    jest.useFakeTimers();
    canvas = installCanvasStub();
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'info').mockImplementation(() => undefined);
    jest
      .spyOn(Component.prototype as unknown as { prefixCss: (cssClassOrId: string) => string }, 'prefixCss')
      .mockImplementation((cssClassOrId: string) => `bmpui-${cssClassOrId}`);
    player = buildUiPlayer();
    panels = [new PlayerGraphsPanel({ hidden: true }), new PlayerGraphsPanel({ hidden: true })];
    // The first variant is active until the context reports fullscreen, as a resize switches `main` and `smallScreen`.
    uiManager = new UIManager(player, [
      { ui: new UIContainer({ components: [panels[0]], hideDelay: -1 }), condition: context => !context.isFullscreen },
      { ui: new UIContainer({ components: [panels[1]], hideDelay: -1 }) },
    ]);
  });

  afterEach(() => {
    uiManager.release();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  function switchVariant(): void {
    uiManager.resolveUiVariant({ isFullscreen: true });
  }

  it('keeps the records from before a variant switch', () => {
    player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('before-switch', 4));
    switchVariant();
    player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('after-switch', 6));

    expect(panels[1].exportSnapshot().segments.map(segment => segment.uid)).toEqual(['before-switch', 'after-switch']);
  });

  it('writes one snapshot to the console at a player error', () => {
    switchVariant();
    player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4));
    player.fire(PLAYER_EVENTS.Error, { code: 1201 });

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(panels[0].getErrorSnapshot()?.segments).toHaveLength(1);
    expect(panels[1].getErrorSnapshot()?.segments).toHaveLength(1);
  });

  it('logs once that no Analytics session is linked', () => {
    switchVariant();
    player.fire(PLAYER_EVENTS.SegmentPlayback, {});

    expect(console.info).toHaveBeenCalledTimes(1);
  });

  it('stops painting the panel of a variant that is no longer active', () => {
    panels[0].show();
    switchVariant();
    canvas.texts.length = 0;
    jest.advanceTimersByTime(3000);

    expect(canvas.texts).toEqual([]);
  });

  it('paints the open panel again when its variant is active again', () => {
    panels[0].show();
    switchVariant();
    uiManager.resolveUiVariant({ isFullscreen: false });
    canvas.texts.length = 0;
    jest.advanceTimersByTime(1000);

    expect(canvas.texts).not.toEqual([]);
  });
});
