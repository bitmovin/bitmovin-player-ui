import type { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../../../UIManager';
import { PlayerGraphsRendition, SegmentHistory } from '../../../utils/SegmentHistory';
import { Timeout } from '../../../utils/Timeout';
import { Component, ComponentConfig } from '../../Component';
import { Label, LabelConfig } from '../../labels/Label';
import { SettingsPanel, SettingsPanelConfig } from '../../settings/SettingsPanel';
import { SettingsPanelItem, SettingsPanelItemConfig } from '../../settings/SettingsPanelItem';
import { SettingsPanelPage } from '../../settings/SettingsPanelPage';
import { DownloadSpeedGraph } from './DownloadSpeedGraph';
import { GraphFrame, PlayerGraphsPlayerState } from './GraphCanvas';
import { PlayerGraphsPanelTitleItem } from './PlayerGraphsPanelTitleItem';
import { SegmentTimelineGraph } from './SegmentTimelineGraph';

const TIMELINE_CAPTION = 'Segment timeline';
const SPEED_CAPTION = 'Download speed';
const SPEED_NOTE =
  'Each bar is one segment: its size divided by its download time. Audio segments are a few tens of kB, ' +
  'so request set-up dominates them and audio reads well below video on the same connection. Read each ' +
  'band on its own, not against the other band.';

/**
 * Configuration interface for a {@link PlayerGraphsPanel}.
 *
 * @category Configs
 */
export interface PlayerGraphsPanelConfig extends SettingsPanelConfig {
  /**
   * The interval in milliseconds at which the graphs are repainted while the panel is shown.
   * Set to -1 to only repaint when the panel is opened.
   * Default: 1000
   */
  refreshIntervalMs?: number;
}

/**
 * Player diagnostics panel that draws playback data as graphs: a segment timeline with one lane per
 * video and audio rendition, and the measured download speed of each segment on the same time axis.
 *
 * Excluded from the default layouts. Enable it with {@link UIConfig.playerGraphs} or with
 * `componentLayoutOverrides`.
 *
 * @category Components
 */
export class PlayerGraphsPanel extends SettingsPanel<PlayerGraphsPanelConfig> {
  private readonly history = new SegmentHistory();
  private readonly timeline: SegmentTimelineGraph;
  private readonly speed: DownloadSpeedGraph;
  private player: PlayerAPI | null = null;
  private refreshTimer: Timeout | null = null;
  /** The last player state read, which stands in while an ad plays and the player reports the ad's. */
  private lastLiveState: PlayerGraphsPlayerState | null = null;

  constructor(config: PlayerGraphsPanelConfig = {}) {
    super(config);

    const timeline = new SegmentTimelineGraph();
    const speed = new DownloadSpeedGraph();
    const titleItem = new PlayerGraphsPanelTitleItem();
    const rootPage = new SettingsPanelPage({
      components: [
        titleItem,
        buildGraphItem([buildCaption(TIMELINE_CAPTION)], timeline),
        buildGraphItem([buildCaption(SPEED_CAPTION), buildHint(SPEED_NOTE)], speed),
      ],
    });

    titleItem.setTarget(this);
    this.timeline = timeline;
    this.speed = speed;

    this.config = this.mergeConfig(
      config,
      {
        cssClasses: ['ui-player-graphs-panel'],
        hidden: true,
        hideDelay: -1,
        hideOnControlsHide: false,
        hideOnOtherSettingsPanelOpening: false,
        refreshIntervalMs: 1000,
      },
      this.config,
    );
    this.addComponent(rootPage);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.player = player;
    this.history.initialize(player);
    this.onShow.subscribe(this.startRendering);
    this.onHide.subscribe(this.stopTimer);
    // A panel configured visible is never shown, so `onShow` does not fire for it.
    if (this.isShown()) {
      this.startRendering();
    }
  }

  release(): void {
    this.stopTimer();
    this.history.release();
    this.player = null;
    super.release();
  }

  private readonly startRendering = (): void => {
    this.stopTimer();
    this.render();
    if (this.config.refreshIntervalMs !== -1) {
      this.refreshTimer = new Timeout(this.config.refreshIntervalMs, this.render, true).start();
    }
  };

  private readonly stopTimer = (): void => {
    this.refreshTimer?.clear();
    this.refreshTimer = null;
  };

  private readonly render = (): void => {
    const state = this.readLiveState();
    if (!state) {
      return;
    }

    const frame: GraphFrame = {
      records: this.history.getRecords(),
      renditions: this.history.getRenditions(),
      state,
      currentTime: state.currentTime,
      stillView: false,
      unsized: { video: this.history.getUnsizedCount('video'), audio: this.history.getUnsizedCount('audio') },
    };
    this.speed.render(frame, this.timeline.render(frame));
  };

  private readLiveState(): PlayerGraphsPlayerState | null {
    if (!this.player) {
      return null;
    }
    if (this.history.isAdPlaying() && this.lastLiveState) {
      return this.lastLiveState;
    }

    this.lastLiveState = readPlayerState(this.player, this.history.getRenditions());

    return this.lastLiveState;
  }
}

function readPlayerState(player: PlayerAPI, renditions: PlayerGraphsRendition[]): PlayerGraphsPlayerState {
  const isLive = player.isLive();
  const currentTime = player.getCurrentTime();
  const liveEdge = isLive ? currentTime - player.getTimeShift() : undefined;
  let { start: seekableStart, end: seekableEnd } = player.getSeekableRange();
  // Some live HLS sources report a seekable range of `{ -1, -1 }`, while the time shift window is known.
  if (liveEdge != null && !(seekableEnd > seekableStart)) {
    seekableEnd = liveEdge;
    seekableStart = liveEdge + Math.min(0, player.getMaxTimeShift());
  }
  // Before the first frame of a media type is decoded, the player reports a placeholder that is no known rendition.
  const knownIds = renditions.map(rendition => rendition.id);

  return {
    currentTime,
    seekableStart,
    seekableEnd,
    isLive,
    liveEdge,
    activeRenditionIds: [player.getPlaybackVideoData().id, player.getPlaybackAudioData().id].filter(id =>
      knownIds.includes(id),
    ),
    muxedAudio: player.getAudio()?.isMuxedIntoVideo === true,
  };
}

function buildCaption(text: string): Label<LabelConfig> {
  return new Label<LabelConfig>({ text, cssClasses: ['ui-player-graphs-panel-item-label'] });
}

/** An ⓘ beside a caption that shows `text` as its tooltip. */
function buildHint(text: string): Label<LabelConfig> {
  const hint = new Label<LabelConfig>({ text: 'ⓘ', cssClasses: ['ui-player-graphs-panel-item-hint'] });
  hint.getDomElement().attr('title', text);
  hint.getDomElement().attr('aria-label', text);

  return hint;
}

/** A row with the caption above the graph. A configured `label` would be placed after the graph. */
function buildGraphItem(
  captions: Label<LabelConfig>[],
  graph: Component<ComponentConfig>,
): SettingsPanelItem<SettingsPanelItemConfig> {
  const item = new SettingsPanelItem({
    label: null,
    cssClasses: ['ui-player-graphs-panel-item'],
    isSetting: false,
    role: 'group',
    tabIndex: -1,
  });
  captions.forEach(caption => item.addComponent(caption));
  item.addComponent(graph);

  return item;
}
