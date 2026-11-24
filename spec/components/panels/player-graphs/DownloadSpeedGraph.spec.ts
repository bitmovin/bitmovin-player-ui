import { DownloadSpeedGraph } from '../../../../src/ts/components/panels/player-graphs/DownloadSpeedGraph';
import type { GraphFrame, PlotGeometry } from '../../../../src/ts/components/panels/player-graphs/GraphCanvas';
import { frame, installCanvasStub, mount, record, RectCall, TextCall } from './graphTestHelpers';

const GEOMETRY: PlotGeometry = {
  labelLeft: 6,
  labelWidth: 40,
  plotLeft: 0,
  plotWidth: 600,
  windowStart: 0,
  windowSeconds: 60,
};

describe('DownloadSpeedGraph', () => {
  let rects: RectCall[];
  let texts: TextCall[];
  let strokes: string[];
  let graph: DownloadSpeedGraph;

  beforeEach(() => {
    ({ rects, texts, strokes } = installCanvasStub());
    graph = mount(new DownloadSpeedGraph());
  });

  /** Bar bodies are the only rects filled with a gradient object. */
  function bars(): RectCall[] {
    return rects.filter(rect => typeof rect.fill === 'object');
  }

  it('draws a bar under the media span of the segment it measured', () => {
    graph.render(frame([record('s', 10, { mbps: 4 })]), GEOMETRY);

    expect(bars()).toEqual([expect.objectContaining({ x: 100, w: 20 })]);
  });

  it('scales each band to its own bars, so audio is not flattened by video', () => {
    graph.render(
      frame([
        record('v', 10, { mbps: 40 }),
        record('a', 10, { mbps: 0.4, representationId: 'a-en', mediaType: 'audio' }),
      ]),
      GEOMETRY,
    );

    const [video, audio] = bars();
    expect(video.h).toBe(audio.h);
  });

  it('leaves out records without a throughput and bars outside the window', () => {
    graph.render(frame([record('failed', 10, { outcome: 'failed' }), record('late', 70, { mbps: 4 })]), GEOMETRY);

    expect(bars()).toEqual([]);
  });

  it('captions each band with the last, average and highest speed', () => {
    graph.render(frame([record('s1', 10, { mbps: 2 }), record('s2', 12, { mbps: 6 })]), GEOMETRY);

    expect(texts.map(text => text.text)).toContain('last 6.0 · avg 4.0 · max 6.0 Mbps');
  });

  it('outlines the scale values instead of putting them on a box', () => {
    graph.render(frame([record('s', 10, { mbps: 4 })]), GEOMETRY);

    const scaleTop = texts.find(text => text.text.endsWith(' Mbps') && !text.text.startsWith('last'))!;
    const strokeText = (HTMLCanvasElement.prototype.getContext as jest.Mock)().strokeText as jest.Mock;
    expect(strokeText).toHaveBeenCalledWith(scaleTop.text, scaleTop.x, scaleTop.y);
    expect(rects.filter(rect => rect.y === scaleTop.y - 6)).toEqual([]);
  });

  it('says why a band has no bars', () => {
    const muxed = frame([], { muxedAudio: true });
    graph.render({ ...muxed, unsized: { video: 3 } }, GEOMETRY);

    expect(texts.map(text => text.text)).toEqual(
      expect.arrayContaining(['downloads report no size (chunked transfer)', 'muxed into the video segments']),
    );
  });

  it('draws nothing without the x axis of the timeline', () => {
    graph.render(frame([record('s', 10, { mbps: 4 })]), null);

    expect(rects).toEqual([]);
  });

  it('marks the bitrate of every rendition as a named rung, the one being played in bold', () => {
    graph.render(frame([record('s', 10, { mbps: 4 })]), GEOMETRY);

    expect(texts.filter(text => text.text === '1080p' || text.text === 'en').map(text => text.text)).toEqual([
      '1080p',
      'en',
    ]);
    expect(texts.map(text => text.text)).toContain('log scale');
  });

  describe('with rungs close together', () => {
    const closeRungs = (): GraphFrame => ({
      ...frame([record('s', 10, { mbps: 4 })]),
      renditions: [
        { id: 'v1080', mediaType: 'video', label: 'A', bitrate: 5000000, isListed: true },
        { id: 'v-b', mediaType: 'video', label: 'B', bitrate: 4800000, isListed: true },
        { id: 'v-c', mediaType: 'video', label: 'C', bitrate: 4600000, isListed: true },
      ],
    });

    it('names every rung, with the names moved apart', () => {
      graph.render(closeRungs(), GEOMETRY);

      const ys = ['A', 'B', 'C'].map(label => texts.find(text => text.text === label)?.y);
      expect(ys).not.toContain(undefined);
      const sorted = (ys as number[]).sort((left, right) => left - right);
      expect(sorted[1] - sorted[0]).toBeGreaterThanOrEqual(14);
      expect(sorted[2] - sorted[1]).toBeGreaterThanOrEqual(14);
    });

    it('draws a grey line at every rung, dashed and brighter only for the rung being played', () => {
      graph.render(closeRungs(), GEOMETRY);

      const context = (HTMLCanvasElement.prototype.getContext as jest.Mock)();
      const dashes = (context.setLineDash as jest.Mock).mock.calls.filter(([dash]) => dash.length > 0);
      expect(strokes.filter(style => style === 'rgba(255, 255, 255, 0.14)')).toHaveLength(2);
      expect(strokes.filter(style => style === 'rgba(255, 255, 255, 0.7)')).toHaveLength(1);
      expect(dashes).toEqual([[[3, 3]]]);
    });

    it('draws the speed scale in the colour of the bars, apart from the rungs', () => {
      graph.render(closeRungs(), GEOMETRY);

      expect(strokes.filter(style => style === 'rgba(74, 168, 255, 0.22)').length).toBeGreaterThan(0);
      const scaleTop = texts.find(text => text.text.endsWith(' Mbps') && !text.text.startsWith('last'))!;
      expect(scaleTop.fill).toBe('#4aa8ff');
    });

    it('keeps the name of the rung being played at its line', () => {
      const close = closeRungs();
      // A higher rung moves the close ones away from the top of the band.
      const renditions = [
        { id: 'v-d', mediaType: 'video' as const, label: 'D', bitrate: 40000000, isListed: true },
        ...close.renditions,
      ];
      graph.render({ ...close, renditions, state: { ...close.state, activeRenditionIds: ['v-b'] } }, GEOMETRY);

      const lineTo = (HTMLCanvasElement.prototype.getContext as jest.Mock)().lineTo as jest.Mock;
      const fullLineYs = lineTo.mock.calls
        .filter(([x]) => x === GEOMETRY.plotLeft + GEOMETRY.plotWidth)
        .map(([, y]) => y);
      expect(fullLineYs).toContain(texts.find(text => text.text === 'B')!.y);
    });
  });

  it('marks a bar below the floor of the scale with its value', () => {
    const fast = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28].map((start, index) =>
      record(`s${index}`, start, { mbps: 4 }),
    );
    graph.render(frame([...fast, record('slow', 30, { mbps: 0.031 })]), GEOMETRY);

    expect(texts.map(text => text.text)).toContain('0.031');
  });

  it('draws a failed segment as an empty column at its span', () => {
    graph.render(frame([record('failed', 10, { outcome: 'failed' })]), GEOMETRY);

    expect(rects).toContainEqual(expect.objectContaining({ x: 100, w: 20, fill: 'rgba(214, 69, 69, 0.12)' }));
  });

  it('names the rungs under the pointer in a tooltip', () => {
    graph.render(frame([record('s', 10, { mbps: 4 })]), GEOMETRY);
    const rungLabel = texts.find(text => text.text === '1080p')!;
    const canvas = graph.getDomElement().get(0);
    canvas.getBoundingClientRect = () => ({ top: 0 }) as DOMRect;
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientY: rungLabel.y }));

    expect(texts.map(text => text.text)).toContain('1080p \u2014 5.0 Mbps');
  });
});
