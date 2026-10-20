import { SegmentTimelineGraph } from '../../../../src/ts/components/panels/player-graphs/SegmentTimelineGraph';
import { frame, installCanvasStub, mount, record, RectCall, TextCall } from './graphTestHelpers';

const DOWNLOADED = '#c28744';
const PLAYED = '#3f9e5a';
const PLAYED_AHEAD = 'rgba(63, 158, 90, 0.45)';
const FAILED = '#d64545';

describe('SegmentTimelineGraph', () => {
  let rects: RectCall[];
  let texts: TextCall[];
  let graph: SegmentTimelineGraph;

  beforeEach(() => {
    ({ rects, texts } = installCanvasStub());
    graph = mount(new SegmentTimelineGraph());
  });

  /** The fills of segment bodies, which are the only rects 16 px high. */
  function segmentFills(): unknown[] {
    return rects.filter(rect => rect.h === 16).map(rect => rect.fill);
  }

  it('lays out a 60 s window that holds the playhead a quarter in, clamped to the seekable range', () => {
    const geometry = graph.render(frame([], { currentTime: 40 }));

    expect(geometry).toEqual(expect.objectContaining({ windowStart: 25, windowSeconds: 60 }));
    expect(graph.render(frame([], { currentTime: 5 }))).toEqual(expect.objectContaining({ windowStart: 0 }));
    expect(graph.render(frame([], { currentTime: 10, seekableEnd: 30 }))).toEqual(
      expect.objectContaining({ windowStart: 0, windowSeconds: 30 }),
    );
  });

  it('ignores the seekable range on live sources, so the played past stays in view', () => {
    const geometry = graph.render(
      frame([], { currentTime: 100, isLive: true, seekableStart: 98, seekableEnd: 104, liveEdge: 104 }),
    );

    expect(geometry).toEqual(expect.objectContaining({ windowStart: 85, windowSeconds: 60 }));
  });

  it('colours segments by what happened to them', () => {
    graph.render(
      frame(
        [
          record('downloaded', 20),
          record('played', 0, { played: true }),
          record('played-ahead', 30, { played: true }),
          record('failed', 2, { outcome: 'failed', played: true }),
          record('playing', 9, { representationId: 'v1080' }),
        ],
        { currentTime: 10 },
      ),
    );

    expect(segmentFills()).toEqual([DOWNLOADED, PLAYED, PLAYED_AHEAD, FAILED, PLAYED]);
  });

  it('does not mark the segment under the playhead as playing in a rendition that is not decoded', () => {
    graph.render(frame([record('other', 9, { representationId: 'v1080' })], { activeRenditionIds: ['a-en'] }));

    expect(segmentFills()).toEqual([DOWNLOADED]);
  });

  it('places a segment at its declared span on the plot', () => {
    const geometry = graph.render(frame([record('s', 20)], { currentTime: 10 }))!;
    const body = rects.find(rect => rect.h === 16)!;

    const pxPerSecond = geometry.plotWidth / 60;
    expect(body.x).toBe(Math.round(geometry.plotLeft + 20 * pxPerSecond));
    expect(body.w).toBe(Math.round(geometry.plotLeft + 22 * pxPerSecond) - body.x - 1);
  });

  it('marks retries with a bar and their count', () => {
    graph.render(frame([record('s', 20, { failures: 2 })]));

    expect(rects.filter(rect => rect.fill === FAILED && rect.h === 3)).toHaveLength(1);
    expect(texts.map(text => text.text)).toContain('2');
  });

  it('labels the playhead with the position, and the live edge with the distance to it', () => {
    graph.render(frame([], { currentTime: 100, isLive: true, liveEdge: 112.3 }));

    expect(texts.map(text => text.text)).toEqual(expect.arrayContaining(['01:40', 'live -12.3s']));
  });

  it('says that the audio is muxed into the video segments where it has no lane', () => {
    const muxed = frame([], { muxedAudio: true });
    graph.render({ ...muxed, renditions: muxed.renditions.filter(rendition => rendition.mediaType === 'video') });

    expect(texts.map(text => text.text)).toContain('muxed into the video segments');
  });

  it('draws a segment where its media plays, with a mark for where it came from', () => {
    const geometry = graph.render(
      frame([record('s', 20, { mediaStart: 30, mediaEnd: 32, httpCache: true, prefetched: true })]),
    )!;

    const body = rects.find(rect => rect.h === 16)!;
    expect(body.x).toBe(Math.round(geometry.plotLeft + 30 * (geometry.plotWidth / 60)));
    expect(rects.filter(rect => rect.h === 3 && rect.x === body.x).map(rect => rect.fill)).toEqual([
      '#7fb2ff',
      '#b98cff',
    ]);
  });

  it('draws the label of a drifting lane in amber', () => {
    graph.render({ ...frame([]), driftingIds: ['a-en'] });

    expect(texts.find(text => text.text.startsWith('e'))?.fill).toBe('#ffb347');
  });

  it('marks the buffer target, and where the buffer ends while a media type waits for a download', () => {
    graph.render(
      frame([], {
        currentTime: 10,
        bufferTargets: { video: 40, audio: 40 },
        downloadWaits: { video: { seconds: 12.7, bufferEnd: 14 } },
      }),
    );

    expect(texts.map(text => text.text)).toEqual(
      expect.arrayContaining(['buffer target 40.0s', 'no video download 12s']),
    );
  });

  it('shrinks lanes to fit a height budget, and collapses lanes without segments past that', () => {
    const fits = graph.render({ ...frame([record('s', 20)]), heightBudget: { timeline: 1000, speed: 0 } });
    const fullHeight = graph.naturalHeight();
    graph.render({ ...frame([record('s', 20)], { activeRenditionIds: [] }), heightBudget: { timeline: 10, speed: 0 } });

    expect(fits).not.toBeNull();
    expect(rects.find(rect => rect.fill === '#c28744' && rect.h > 3)?.h).toBe(10);
    expect(texts.map(text => text.text)).toContain('en');
    expect(fullHeight).toBeGreaterThan(0);
  });
});
