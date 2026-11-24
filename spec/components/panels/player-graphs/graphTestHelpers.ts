import type { PlayerAPI } from 'bitmovin-player';
import type { Component, ComponentConfig } from '../../../../src/ts/components/Component';
import type {
  GraphFrame,
  PlayerGraphsPlayerState,
} from '../../../../src/ts/components/panels/player-graphs/GraphCanvas';
import type { PlayerGraphsRendition, SegmentRecord } from '../../../../src/ts/utils/SegmentHistory';

export interface RectCall {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: unknown;
}

export interface TextCall {
  text: string;
  x: number;
  y: number;
  fill: unknown;
}

/**
 * jsdom has no 2D context. The stub records every `fillRect` and `fillText` with the fill in force, so
 * a test can name what was drawn instead of counting calls.
 */
export function installCanvasStub(): { rects: RectCall[]; texts: TextCall[]; strokes: string[] } {
  const rects: RectCall[] = [];
  const texts: TextCall[] = [];
  /** The stroke style of every stroked path. */
  const strokes: string[] = [];
  const style: { fillStyle: unknown; strokeStyle: string } = { fillStyle: '', strokeStyle: '' };
  const context = {
    get fillStyle(): unknown {
      return style.fillStyle;
    },
    set fillStyle(value: unknown) {
      style.fillStyle = value;
    },
    get strokeStyle(): string {
      return style.strokeStyle;
    },
    set strokeStyle(value: string) {
      style.strokeStyle = value;
    },
    font: '',
    textBaseline: '',
    fillRect: jest.fn((x: number, y: number, w: number, h: number) =>
      rects.push({ x, y, w, h, fill: style.fillStyle }),
    ),
    fillText: jest.fn((text: string, x: number, y: number) => texts.push({ text, x, y, fill: style.fillStyle })),
    strokeRect: jest.fn(),
    strokeText: jest.fn(),
    clearRect: jest.fn(() => {
      rects.length = 0;
      texts.length = 0;
      strokes.length = 0;
    }),
    beginPath: jest.fn(),
    closePath: jest.fn(),
    setLineDash: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(() => strokes.push(style.strokeStyle)),
    fill: jest.fn(),
    setTransform: jest.fn(),
    createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
    measureText: jest.fn((text: string) => ({ width: text.length * 6 })),
  };
  HTMLCanvasElement.prototype.getContext = jest.fn(() => context) as unknown as HTMLCanvasElement['getContext'];
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => 600 });

  return { rects, texts, strokes };
}

export const PLAYER_EVENTS = {
  Ready: 'ready',
  SourceLoaded: 'sourceloaded',
  SourceUnloaded: 'sourceunloaded',
  SegmentRequestFinished: 'segmentrequestfinished',
  SegmentPlayback: 'segmentplayback',
  SegmentParsed: 'segmentparsed',
  AdBreakStarted: 'adbreakstarted',
  AdBreakFinished: 'adbreakfinished',
  PeriodSwitched: 'periodswitched',
  VideoQualityAdded: 'videoqualityadded',
  AudioAdded: 'audioadded',
  Error: 'error',
  PlayerResized: 'playerresized',
};

export const VIDEO_1080 = { id: 'v1080', label: '1080p', bitrate: 5000000 };
export const VIDEO_720 = { id: 'v720', label: '720p', bitrate: 2500000 };
export const AUDIO_EN = { id: 'a-en', label: '128k', bitrate: 128000 };

export interface PlayerStub extends PlayerAPI {
  fire(eventType: string, event?: unknown): void;
  handlers: Map<string, ((event: unknown) => void)[]>;
}

/** A player with the surface the graphs read. `overrides` replaces any of its methods. */
export function buildPlayer(overrides: Partial<Record<keyof PlayerAPI, unknown>> = {}): PlayerStub {
  const handlers = new Map<string, ((event: unknown) => void)[]>();
  const off = (eventType: string, handler: (event: unknown) => void) => {
    const rest = (handlers.get(eventType) ?? []).filter(other => other !== handler);
    if (rest.length > 0) {
      handlers.set(eventType, rest);
    } else {
      handlers.delete(eventType);
    }
  };

  return {
    on: jest.fn((eventType: string, handler: (event: unknown) => void) =>
      handlers.set(eventType, [...(handlers.get(eventType) ?? []), handler]),
    ),
    off: jest.fn(off),
    handlers,
    fire: (eventType: string, event: unknown = {}) =>
      (handlers.get(eventType) ?? []).slice().forEach(handler => handler(event)),
    exports: {
      PlayerEvent: PLAYER_EVENTS,
      MediaType: { Video: 'video', Audio: 'audio' },
      BufferType: { ForwardDuration: 'forwardduration' },
    },
    buffer: { getLevel: () => ({ level: 20, targetLevel: 40 }) },
    getAvailableVideoQualities: () => [VIDEO_720, VIDEO_1080],
    getAvailableAudio: () => [{ id: 'en', lang: 'en', label: 'English', getQualities: () => [AUDIO_EN] }],
    getAudio: () => ({ id: 'en', lang: 'en', label: 'English' }),
    isLive: () => false,
    getCurrentTime: () => 10,
    getTimeShift: () => 0,
    getMaxTimeShift: () => 0,
    getSeekableRange: () => ({ start: 0, end: 600 }),
    getDuration: () => 600,
    getPlaybackVideoData: () => ({ id: 'v1080' }),
    getPlaybackAudioData: () => ({ id: 'a-en' }),
    getStreamType: () => 'dash',
    getSource: () => ({ dash: 'https://example.com/manifest.mpd' }),
    version: '8.281.0',
    ...overrides,
  } as unknown as PlayerStub;
}

/** A successful video segment request of `uid`, 2 s long at `startTime`, 1 MB in 1 s. */
export function segmentRequest(uid: string, startTime: number, overrides: Record<string, unknown> = {}): unknown {
  return {
    uid,
    url: `https://example.com/${uid}.m4s`,
    success: true,
    isInit: false,
    mimeType: 'video/mp4',
    representationId: 'v1080',
    startTime,
    duration: 2,
    size: 1000000,
    downloadTime: 1,
    attempt: 1,
    ...overrides,
  };
}

/** The parse of the video segment `uid`, playing at `playbackTime`. */
export function segmentParsed(uid: string, playbackTime: number, overrides: Record<string, unknown> = {}): unknown {
  return {
    uid,
    url: `https://example.com/${uid}.m4s`,
    mimeType: 'video/mp4',
    representationId: 'v1080',
    startTime: 4,
    playbackTime,
    presentationTimestamp: playbackTime,
    duration: 2,
    loadedFrom: 'network',
    ...overrides,
  };
}

export const RENDITIONS: PlayerGraphsRendition[] = [
  { id: 'v1080', mediaType: 'video', label: '1080p', bitrate: 5000000, isListed: true },
  { id: 'a-en', mediaType: 'audio', label: 'en', bitrate: 128000, isListed: true },
];

export function record(uid: string, start: number, overrides: Partial<SegmentRecord> = {}): SegmentRecord {
  return {
    uid,
    representationId: 'v1080',
    mediaType: 'video',
    start,
    end: start + 2,
    outcome: 'downloaded',
    failures: 0,
    played: false,
    ...overrides,
  };
}

export function frame(records: SegmentRecord[], state: Partial<PlayerGraphsPlayerState> = {}): GraphFrame {
  const fullState: PlayerGraphsPlayerState = {
    currentTime: 10,
    seekableStart: 0,
    seekableEnd: 600,
    isLive: false,
    activeRenditionIds: ['v1080', 'a-en'],
    muxedAudio: false,
    ...state,
  };

  return {
    records,
    renditions: RENDITIONS,
    state: fullState,
    currentTime: fullState.currentTime,
    stillView: false,
    unsized: {},
  };
}

/** Puts the component's element into a 600 px wide parent, which is what a graph sizes itself to. */
export function mount<T extends Component<ComponentConfig>>(component: T): T {
  document.createElement('div').appendChild(component.getDomElement().get(0));

  return component;
}
