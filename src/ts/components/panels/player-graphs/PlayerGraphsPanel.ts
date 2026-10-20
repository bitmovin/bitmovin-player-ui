import type { Bitmovin8Adapter, ErrorEvent, PlayerAPI, SourceConfig } from 'bitmovin-player';
import { DOM } from '../../../DOM';
import { UIInstanceManager } from '../../../UIManager';
import { PlayerGraphsRendition, SegmentHistory, SegmentMediaType, SegmentRecord } from '../../../utils/SegmentHistory';
import { Timeout } from '../../../utils/Timeout';
import { version } from '../../../version';
import { Component, ComponentConfig } from '../../Component';
import { Label, LabelConfig } from '../../labels/Label';
import { SettingsPanel, SettingsPanelConfig } from '../../settings/SettingsPanel';
import { SettingsPanelItem, SettingsPanelItemConfig } from '../../settings/SettingsPanelItem';
import { SettingsPanelPage } from '../../settings/SettingsPanelPage';
import { DownloadSpeedGraph } from './DownloadSpeedGraph';
import { DownloadWait, formatPlayheadTime, GraphFrame, PlayerGraphsPlayerState } from './GraphCanvas';
import { collectInsights, describeError, findTimingDrifts, PlayerGraphsInsight } from './playerGraphsInsights';
import { PlayerGraphsPanelTitleItem } from './PlayerGraphsPanelTitleItem';
import { PlayerGraphsScrubber } from './PlayerGraphsScrubber';
import { SegmentTimelineGraph } from './SegmentTimelineGraph';

/**
 * Everything the graphs are drawn from, as plain JSON, so a session can be attached to a support
 * ticket and drawn again elsewhere with {@link PlayerGraphsPanel.loadSnapshot}.
 */
export interface PlayerGraphsSnapshot {
  format: 'bitmovin-player-graphs';
  version: 1;
  /** When it was exported, ISO 8601. */
  exportedAt: string;
  /** The UI version that exported it. */
  uiVersion: string;
  /** The findings at export, ahead of the bulk data so they are the first thing read in the file. */
  insights: PlayerGraphsInsight[];
  player: PlayerGraphsPlayerState;
  /** The lanes, in lane order. */
  renditions: PlayerGraphsRendition[];
  segments: SegmentRecord[];
}

const SNAPSHOT_FORMAT = 'bitmovin-player-graphs';
const SNAPSHOT_VERSION = 1;
const EMPTY_STATE: PlayerGraphsPlayerState = {
  currentTime: 0,
  seekableStart: 0,
  seekableEnd: 0,
  isLive: false,
  activeRenditionIds: [],
  muxedAudio: false,
};
const TIMELINE_CAPTION = 'Segment timeline';
const SPEED_CAPTION = 'Download speed';
const INSIGHTS_CAPTION = 'Insights';
/**
 * The height the panel leaves free inside the player, in its own em: the control bar below and the
 * title bar above. Matches `max-height: calc(100% - 12.5em)` in `_player-graphs-panel.scss`.
 */
const PANEL_INSET_EM = 12.5;
/** A media type without a download for this many segment durations, and at least this long, waits for one. */
const DOWNLOAD_WAIT_SEGMENTS = 2;
const MIN_DOWNLOAD_WAIT_SECONDS = 4;
const SPEED_NOTE =
  'Each bar is one segment: its size divided by its download time. Audio segments are a few tens of kB, ' +
  'so request set-up dominates them and audio reads well below video on the same connection. Read each ' +
  'band on its own, not against the other band.';
const ANALYTICS_HINT =
  '[player-graphs] No Bitmovin Analytics session is linked to this player. With Analytics, each graphs ' +
  'snapshot names its impression ID, which opens the same session in the Bitmovin Dashboard. ' +
  'See https://developer.bitmovin.com/playback/docs/setup-analytics-web.';

/**
 * What the graphs show: the attached player as it plays, the recording so far at a paused instant
 * while recording continues, or a snapshot.
 */
type GraphsView =
  | { mode: 'live' }
  | { mode: 'paused'; state: PlayerGraphsPlayerState; time: number }
  | { mode: 'snapshot'; snapshot: PlayerGraphsSnapshot; time: number; atError: boolean };

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
  private readonly timelineSection: GraphSection;
  private readonly insightsSection: GraphSection;
  private readonly insightsList: PlayerGraphsInsightsList;
  private readonly titleItem: PlayerGraphsPanelTitleItem;
  private readonly scrubber: PlayerGraphsScrubber;
  private readonly scrubberItem: SettingsPanelItem<SettingsPanelItemConfig>;
  private player: PlayerAPI | null = null;
  private refreshTimer: Timeout | null = null;
  private view: GraphsView = { mode: 'live' };
  /**
   * The last player state read while live. It stands in while an ad plays, and for a snapshot at a
   * player error, because the player has dropped the source by the time the error event fires.
   */
  private lastLiveState: PlayerGraphsPlayerState | null = null;
  private errorSnapshot: PlayerGraphsSnapshot | null = null;
  /** Set by a player error, so the source unload that follows shows the error snapshot instead of empty graphs. */
  private freezeOnUnload = false;
  private analyticsHintLogged = false;

  constructor(config: PlayerGraphsPanelConfig = {}) {
    super(config);

    const timeline = new SegmentTimelineGraph();
    const speed = new DownloadSpeedGraph();
    const timelineCaption = buildCaption(TIMELINE_CAPTION);
    const speedCaption = buildCaption(SPEED_CAPTION);
    const insightsCaption = buildCaption(INSIGHTS_CAPTION);
    const titleItem = new PlayerGraphsPanelTitleItem();
    const scrubber = new PlayerGraphsScrubber();
    const scrubberItem = buildItem([scrubber], { hidden: true });
    // Folded until it has something to say. Hidden through its config, because `initialize()` resets an earlier `hide()`.
    const insightsList = new PlayerGraphsInsightsList({ hidden: true });
    const rootPage = new SettingsPanelPage({
      components: [
        titleItem,
        scrubberItem,
        buildItem([timelineCaption, timeline]),
        buildItem([speedCaption, buildHint(SPEED_NOTE), speed]),
        buildItem([insightsCaption, insightsList]),
      ],
    });

    titleItem.setTarget(this);
    scrubber.onScrub.subscribe((_, time) => {
      if (this.view.mode !== 'live') {
        this.view.time = time;
        this.render();
      }
    });
    this.timeline = timeline;
    this.speed = speed;
    this.timelineSection = new GraphSection(timelineCaption, timeline, TIMELINE_CAPTION, false);
    new GraphSection(speedCaption, speed, SPEED_CAPTION, false);
    this.insightsSection = new GraphSection(insightsCaption, insightsList, INSIGHTS_CAPTION, true);
    this.insightsList = insightsList;
    this.titleItem = titleItem;
    this.scrubber = scrubber;
    this.scrubberItem = scrubberItem;

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

    const events = player.exports.PlayerEvent;
    this.player = player;
    this.history.initialize(player);
    player.on(events.SourceLoaded, this.onSourceLoaded);
    player.on(events.SourceUnloaded, this.onSourceUnloaded);
    player.on(events.SegmentPlayback, this.onSegmentPlayback);
    player.on(events.Error, this.onError);
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
    const player = this.player;
    if (player) {
      const events = player.exports.PlayerEvent;
      player.off(events.SourceLoaded, this.onSourceLoaded);
      player.off(events.SourceUnloaded, this.onSourceUnloaded);
      player.off(events.SegmentPlayback, this.onSegmentPlayback);
      player.off(events.Error, this.onError);
    }
    this.player = null;
    super.release();
  }

  isPaused(): boolean {
    return this.view.mode === 'paused';
  }

  isShowingSnapshot(): boolean {
    return this.view.mode === 'snapshot';
  }

  /**
   * Freezes the graphs at this instant, with a scrubber over everything recorded so far. Recording
   * continues. Does nothing while a snapshot is shown.
   */
  pause(): void {
    const state = this.readLiveState();
    if (this.view.mode === 'live' && state) {
      this.setView({ mode: 'paused', state, time: state.currentTime });
    }
  }

  /** Returns a paused view to following the player. */
  resume(): void {
    if (this.view.mode === 'paused') {
      this.setView({ mode: 'live' });
    }
  }

  /** Everything the graphs show now, as plain data. */
  exportSnapshot(): PlayerGraphsSnapshot {
    if (this.view.mode === 'snapshot') {
      return { ...this.view.snapshot, exportedAt: new Date().toISOString() };
    }

    return this.buildSnapshot(this.view.mode === 'paused' ? this.view.state : (this.readLiveState() ?? EMPTY_STATE));
  }

  /**
   * Draws a snapshot exported earlier, with a scrubber over its whole recording, until the next
   * source unloads. Throws on data that is not a snapshot of this version.
   */
  loadSnapshot(snapshot: PlayerGraphsSnapshot): void {
    if (snapshot?.format !== SNAPSHOT_FORMAT || snapshot.version !== SNAPSHOT_VERSION) {
      throw new Error(`Not a ${SNAPSHOT_FORMAT} version ${SNAPSHOT_VERSION} snapshot`);
    }

    this.setView({ mode: 'snapshot', snapshot, time: snapshot.player.currentTime, atError: false });
  }

  /**
   * The snapshot taken at the most recent player error, or null. It survives the source unload that
   * follows the error. A copy.
   */
  getErrorSnapshot(): PlayerGraphsSnapshot | null {
    return this.errorSnapshot ? JSON.parse(JSON.stringify(this.errorSnapshot)) : null;
  }

  private setView(view: GraphsView): void {
    this.view = view;
    if (view.mode === 'live') {
      this.scrubberItem.hide();
    } else {
      const records = view.mode === 'snapshot' ? view.snapshot.segments : this.history.getRecords();
      const { start, end } = resolveRecordedSpan(records, view.time);
      this.scrubber.setRange(start, end, view.time);
      this.scrubberItem.show();
    }
    this.titleItem.refresh();
    if (this.isShown()) {
      this.render();
    }
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
    const frame = this.buildFrame();
    if (!frame) {
      return;
    }

    const drifts = findTimingDrifts(frame);
    frame.driftingIds = drifts.map(drift => drift.rendition.id);
    frame.heightBudget = this.resolveHeightBudget();
    const geometry = this.timeline.render(frame);
    this.speed.render(frame, geometry);

    const view = this.view;
    const insights =
      view.mode === 'snapshot'
        ? view.snapshot.insights
        : collectInsights(frame, drifts, geometry?.windowStart ?? -Infinity);
    const countOf = (kind: PlayerGraphsInsight['kind']) =>
      insights.filter(insight => insight.kind === kind).reduce((sum, insight) => sum + insight.count, 0);
    const retried = countOf('retries');
    const timingNotes = countOf('timing');
    let status: { word: string; line: string } | undefined;
    if (view.mode === 'snapshot') {
      status = {
        word: 'snapshot',
        line: view.atError
          ? 'Frozen at the player error after the source unloaded. The next source returns the graphs to the player.'
          : `Snapshot exported ${view.snapshot.exportedAt}. The graphs return to the player when its source unloads.`,
      };
    } else if (view.mode === 'paused') {
      status = {
        word: 'paused',
        line: `Paused at ${formatPlayheadTime(view.state.currentTime, true)}. Recording continues.`,
      };
    } else if (this.history.isAdPlaying()) {
      status = {
        word: 'ad break',
        line: 'An ad break plays. The graphs show the content as it was when the break started.',
      };
    }

    this.timelineSection.setCaption(
      [
        TIMELINE_CAPTION,
        retried > 0 ? `${retried} with retries` : '',
        timingNotes > 0 ? `${timingNotes} timing ${timingNotes === 1 ? 'note' : 'notes'}` : '',
        countOf('error') > 0 ? 'error' : '',
        countOf('wait') > 0 ? 'no downloads' : '',
        status?.word ?? '',
      ]
        .filter(part => part !== '')
        .join(' — '),
    );
    const impressionId = frame.state.impressionId;
    // The impression ID names the session rather than reporting on it, so it does not unfold the section.
    this.insightsSection.suggestCollapsed(insights.length === 0 && !status);
    this.insightsList.setItems([
      ...insights.map(insight => insight.text),
      ...(status ? [status.line] : []),
      ...(impressionId
        ? [`Bitmovin Analytics impression ${impressionId}: the same session in the Bitmovin Dashboard.`]
        : []),
    ]);
  };

  private buildFrame(): GraphFrame | null {
    const view = this.view;
    if (view.mode === 'snapshot') {
      const { snapshot } = view;
      return {
        records: snapshot.segments,
        renditions: snapshot.renditions,
        state: snapshot.player,
        currentTime: view.time,
        stillView: true,
        unsized: {},
      };
    }

    const state = view.mode === 'paused' ? view.state : this.readLiveState();
    if (!state) {
      return null;
    }

    return {
      records: this.history.getRecords(),
      renditions: this.history.getRenditions(),
      state,
      currentTime: view.mode === 'paused' ? view.time : state.currentTime,
      stillView: view.mode === 'paused',
      unsized: { video: this.history.getUnsizedCount('video'), audio: this.history.getUnsizedCount('audio') },
    };
  }

  /**
   * How tall each graph may be so the panel fits inside the player without scrolling, shared in
   * proportion to their full heights. None where the panel has no height cap or the graphs fit.
   */
  private resolveHeightBudget(): GraphFrame['heightBudget'] {
    const element = this.getDomElement().get(0);
    // The positioned UI container, which the `max-height` of the panel resolves against.
    const container = element.offsetParent as HTMLElement | null;
    const style = getComputedStyle(element);
    const fontSize = parseFloat(style.fontSize);
    if (style.maxHeight === 'none' || !container || !(container.clientHeight > 0) || !(fontSize > 0)) {
      return undefined;
    }

    const timelineHeight = this.timeline.isShown() ? this.timeline.naturalHeight() : 0;
    const speedHeight = this.speed.isShown() ? this.speed.naturalHeight() : 0;
    const overhead =
      element.scrollHeight -
      this.timeline.getDomElement().get(0).offsetHeight -
      this.speed.getDomElement().get(0).offsetHeight;
    const budget = container.clientHeight - PANEL_INSET_EM * fontSize - overhead;
    const natural = timelineHeight + speedHeight;
    if (natural === 0 || natural <= budget) {
      return undefined;
    }

    return {
      timeline: Math.floor((budget * timelineHeight) / natural),
      speed: Math.floor((budget * speedHeight) / natural),
    };
  }

  private readLiveState(): PlayerGraphsPlayerState | null {
    if (!this.player) {
      return null;
    }
    if (this.history.isAdPlaying() && this.lastLiveState) {
      return this.lastLiveState;
    }

    this.lastLiveState = readPlayerState(this.player, this.history);

    return this.lastLiveState;
  }

  private buildSnapshot(state: PlayerGraphsPlayerState): PlayerGraphsSnapshot {
    const frame: GraphFrame = {
      records: this.history.getRecords().map(record => ({ ...record })),
      renditions: this.history.getRenditions(),
      state,
      currentTime: state.currentTime,
      stillView: true,
      unsized: {},
    };

    return {
      format: SNAPSHOT_FORMAT,
      version: SNAPSHOT_VERSION,
      exportedAt: new Date().toISOString(),
      uiVersion: version,
      insights: collectInsights(frame, findTimingDrifts(frame), -Infinity),
      player: state,
      renditions: frame.renditions.slice(),
      segments: frame.records.slice(),
    };
  }

  /** Keeps the live state current while the panel is closed, for a snapshot at a player error. */
  private readonly onSegmentPlayback = (): void => {
    const state = this.readLiveState();
    if (state && !state.impressionId && !this.analyticsHintLogged) {
      this.analyticsHintLogged = true;
      console.info(ANALYTICS_HINT);
    }
  };

  /** Takes a snapshot of the session at a player error and writes it to the console. */
  private readonly onError = (event: ErrorEvent): void => {
    if (this.view.mode === 'snapshot') {
      return;
    }

    const snapshot = this.buildSnapshot(this.lastLiveState ?? this.readLiveState() ?? EMPTY_STATE);
    const at = formatPlayheadTime(snapshot.player.currentTime, true);
    snapshot.insights.unshift(describeError(event.code, event.name, event.message, at));
    this.errorSnapshot = snapshot;
    this.freezeOnUnload = true;
    console.warn(
      `[player-graphs] Snapshot at player error ${event.code}; load it with the graphs panel's Import:\n` +
        JSON.stringify(this.errorSnapshot),
    );
  };

  private readonly onSourceUnloaded = (): void => {
    this.lastLiveState = null;
    if (this.freezeOnUnload && this.errorSnapshot) {
      this.freezeOnUnload = false;
      const snapshot = this.errorSnapshot;
      this.setView({ mode: 'snapshot', snapshot, time: snapshot.player.currentTime, atError: true });
    } else if (this.view.mode !== 'live') {
      this.setView({ mode: 'live' });
    }
  };

  private readonly onSourceLoaded = (): void => {
    this.freezeOnUnload = false;
    if (this.view.mode === 'snapshot' && this.view.atError) {
      this.setView({ mode: 'live' });
    }
  };
}

function readPlayerState(player: PlayerAPI, history: SegmentHistory): PlayerGraphsPlayerState {
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
  const knownIds = history.getRenditions().map(rendition => rendition.id);
  const bufferLevel = (mediaType: SegmentMediaType) =>
    player.buffer.getLevel(
      player.exports.BufferType.ForwardDuration,
      mediaType === 'video' ? player.exports.MediaType.Video : player.exports.MediaType.Audio,
    );
  const bufferTargets: PlayerGraphsPlayerState['bufferTargets'] = {};
  const downloadWaits: PlayerGraphsPlayerState['downloadWaits'] = {};
  (['video', 'audio'] as const).forEach(mediaType => {
    const { level, targetLevel } = bufferLevel(mediaType);
    bufferTargets[mediaType] = targetLevel;
    const wait = readDownloadWait(
      history,
      mediaType,
      level,
      targetLevel,
      isLive ? Infinity : player.getDuration() - currentTime,
    );
    if (wait) {
      downloadWaits[mediaType] = { ...wait, bufferEnd: currentTime + level };
    }
  });

  return {
    version: player.version,
    source: resolveSourceUrl(player.getSource()),
    streamType: player.getStreamType(),
    impressionId: readImpressionId(player),
    currentTime,
    seekableStart,
    seekableEnd,
    isLive,
    liveEdge,
    activeRenditionIds: [player.getPlaybackVideoData().id, player.getPlaybackAudioData().id].filter(id =>
      knownIds.includes(id),
    ),
    muxedAudio: player.getAudio()?.isMuxedIntoVideo === true,
    bufferTargets,
    downloadWaits,
  };
}

/**
 * How long a media type has gone without a downloaded segment, where that is longer than a download
 * should take while the buffer has room for another segment. The room reaches up to the buffer
 * target, or up to the end of a stream that ends sooner. The player reports a request only when it
 * ends, so this is the only sign of a request the server holds open, and the same sign a player
 * gives that has stopped requesting.
 */
function readDownloadWait(
  history: SegmentHistory,
  mediaType: SegmentMediaType,
  level: number,
  targetLevel: number,
  remaining: number,
): Pick<DownloadWait, 'seconds'> | undefined {
  const last = history.getLastDownload(mediaType);
  if (!last || !Number.isFinite(level) || !Number.isFinite(targetLevel)) {
    return undefined;
  }

  const seconds = (Date.now() - last.at) / 1000;
  const segment = last.duration > 0 ? last.duration : 0;
  const room = Math.min(targetLevel, remaining) - level;

  return seconds >= Math.max(MIN_DOWNLOAD_WAIT_SECONDS, DOWNLOAD_WAIT_SEGMENTS * segment) && room > segment
    ? { seconds }
    : undefined;
}

function resolveSourceUrl(source: SourceConfig | null): string | undefined {
  return [source?.dash, source?.hls, source?.smooth, source?.progressive].find(
    (url): url is string => typeof url === 'string' && url.length > 0,
  );
}

/** `player.analytics` is absent without the analytics module, and the collector can throw before it is set up. */
function readImpressionId(player: PlayerAPI): string | undefined {
  try {
    return (player.analytics as Bitmovin8Adapter | undefined)?.getCurrentImpressionId() || undefined;
  } catch {
    return undefined;
  }
}

/** From the earliest to the latest recorded time, widened to include `at`. */
function resolveRecordedSpan(records: readonly SegmentRecord[], at: number): { start: number; end: number } {
  if (records.length === 0) {
    return { start: at - 30, end: at + 30 };
  }

  return {
    start: Math.min(at, ...records.map(record => record.start)),
    end: Math.max(at, ...records.map(record => record.end)),
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

/** A row that stacks its components. A configured `label` would be placed after them. */
function buildItem(
  components: Component<ComponentConfig>[],
  config: SettingsPanelItemConfig = {},
): SettingsPanelItem<SettingsPanelItemConfig> {
  const item = new SettingsPanelItem({
    label: null,
    cssClasses: ['ui-player-graphs-panel-item'],
    isSetting: false,
    role: 'group',
    tabIndex: -1,
    ...config,
  });
  components.forEach(component => item.addComponent(component));

  return item;
}

/**
 * The findings as a list of sentences. Text, so it wraps and can be copied into a ticket.
 */
class PlayerGraphsInsightsList extends Component<ComponentConfig> {
  private items: string[] | null = null;

  constructor(config: ComponentConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, { cssClass: 'ui-player-graphs-panel-insights' }, this.config);
  }

  protected toDomElement(): DOM {
    return new DOM('ul', { class: this.getCssClasses() }, this);
  }

  /** Leaves the list alone when nothing changed, so a text selection survives the repaint. */
  setItems(items: string[]): void {
    if (this.items?.length === items.length && items.every((item, index) => item === this.items[index])) {
      return;
    }

    this.items = items;
    const list = this.getDomElement().get(0);
    list.textContent = '';
    (items.length > 0 ? items : ['Nothing to report.']).forEach(text => {
      const item = document.createElement('li');
      // Text, never markup: rendition names come from the manifest.
      item.textContent = text;
      list.appendChild(item);
    });
  }
}

/**
 * Makes a caption fold and unfold the component below it, with a chevron that shows which.
 */
class GraphSection {
  private toggledByUser = false;

  constructor(
    private readonly caption: Label<LabelConfig>,
    private readonly content: Component<ComponentConfig>,
    private text: string,
    // Matches the `hidden` config of the content, which hides it at initialization.
    private collapsed: boolean,
  ) {
    const element = caption.getDomElement();
    element.attr('role', 'button');
    element.attr('tabindex', '0');
    element.on('click', () => this.toggleByUser());
    element.on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.toggleByUser();
      }
    });
    this.paint();
  }

  setCaption(text: string): void {
    this.text = text;
    this.paint();
  }

  /** Folds or unfolds the section to suit its content, until the user folds or unfolds it. */
  suggestCollapsed(collapsed: boolean): void {
    if (!this.toggledByUser && collapsed !== this.collapsed) {
      this.toggle();
    }
  }

  private toggleByUser(): void {
    this.toggledByUser = true;
    this.toggle();
  }

  private toggle(): void {
    this.collapsed = !this.collapsed;
    if (this.collapsed) {
      this.content.hide();
    } else {
      this.content.show();
    }
    this.paint();
  }

  private paint(): void {
    this.caption.setText(`${this.collapsed ? '▶' : '▼'} ${this.text}`);
  }
}
