import {
  resolveTickStep,
  resolveWindow,
  spreadLabels,
  spreadLabelsAround,
  truncateToWidth,
} from '../../../../src/ts/components/panels/player-graphs/segmentTimelineLayout';

const MAX_WINDOW = 60;
const HOLD = 0.6;
const TICK_CANDIDATES = [5, 10, 15, 20, 30, 60];
// Stand-in for canvas text measurement: every character is six pixels wide.
const measure = (text: string) => text.length * 6;

describe('segmentTimelineLayout', () => {
  describe('resolveWindow', () => {
    it('keeps the window at the seekable start until playback reaches the hold point', () => {
      expect(resolveWindow(10, 0, 600, MAX_WINDOW, HOLD)).toEqual({ start: 0, seconds: 60 });
    });

    it('follows playback once past the hold point, keeping the playhead at the hold fraction', () => {
      const { start, seconds } = resolveWindow(100, 0, 600, MAX_WINDOW, HOLD);

      expect({ start, seconds }).toEqual({ start: 64, seconds: 60 });
      // 100s sits 36s into a 60s window, i.e. at the 60% hold point.
      expect((100 - start) / seconds).toBeCloseTo(HOLD);
    });

    it('shrinks the window to the seekable range for sources shorter than the window', () => {
      expect(resolveWindow(20, 0, 30, MAX_WINDOW, HOLD)).toEqual({ start: 0, seconds: 30 });
    });

    it('stops at the end of the stream, so the axis never runs past the duration', () => {
      // A 60 s clip at 45 s: the window would follow playback to 30–90; it stays at 0–60 instead.
      expect(resolveWindow(45, 0, 60, MAX_WINDOW, HOLD)).toEqual({ start: 0, seconds: 60 });
      expect(resolveWindow(100, 0, 120, MAX_WINDOW, HOLD)).toEqual({ start: 60, seconds: 60 });
    });

    it('never starts before the seekable start of a sliding live window', () => {
      expect(resolveWindow(520, 500, 1400, MAX_WINDOW, HOLD)).toEqual({ start: 500, seconds: 60 });
    });

    it('follows the live edge once far enough into the live window', () => {
      expect(resolveWindow(600, 500, 1400, MAX_WINDOW, HOLD)).toEqual({ start: 564, seconds: 60 });
    });

    it('falls back to the maximum window when the seekable range is empty', () => {
      expect(resolveWindow(10, 0, 0, MAX_WINDOW, HOLD).seconds).toBe(60);
    });

    it('falls back to the maximum window when the seekable end is not finite', () => {
      expect(resolveWindow(10, 0, Infinity, MAX_WINDOW, HOLD).seconds).toBe(60);
    });
  });

  describe('resolveTickStep', () => {
    it('uses the finest step when the lane is wide enough for every label', () => {
      expect(resolveTickStep(1200, 60, 52, TICK_CANDIDATES)).toBe(5);
    });

    it('coarsens the step as the lane narrows so labels cannot collide', () => {
      const narrow = resolveTickStep(300, 60, 52, TICK_CANDIDATES);
      const wide = resolveTickStep(1200, 60, 52, TICK_CANDIDATES);

      expect(narrow).toBeGreaterThan(wide);
      expect(60 / narrow).toBeLessThanOrEqual(Math.floor(300 / 52));
    });

    it('falls back to the coarsest step when even that does not fit', () => {
      expect(resolveTickStep(10, 60, 52, TICK_CANDIDATES)).toBe(60);
    });

    it('allows a finer step for a shorter window at the same width', () => {
      expect(resolveTickStep(300, 30, 52, TICK_CANDIDATES)).toBeLessThan(resolveTickStep(300, 60, 52, TICK_CANDIDATES));
    });
  });

  describe('truncateToWidth', () => {
    it('leaves text that already fits untouched', () => {
      expect(truncateToWidth(measure, '1080p', 100, '…')).toBe('1080p');
    });

    it('truncates with an ellipsis so the result fits', () => {
      const result = truncateToWidth(measure, '1920x818, 6214kbps', 60, '…');

      expect(result.endsWith('…')).toBe(true);
      expect(measure(result)).toBeLessThanOrEqual(60);
    });

    it('keeps at least one character plus the ellipsis when nothing fits', () => {
      expect(truncateToWidth(measure, '1920x818', 1, '…')).toBe('1…');
    });
  });

  describe('spreadLabels', () => {
    it('leaves labels that are far enough apart where they are', () => {
      expect(spreadLabels([10, 40, 70], 14, 0, 100)).toEqual([10, 40, 70]);
    });

    it('pushes a label down from a neighbour that is too close, in the order given', () => {
      expect(spreadLabels([30, 20, 25], 14, 0, 100)).toEqual([48, 20, 34]);
    });

    it('pulls labels back up where they would run past the bottom', () => {
      expect(spreadLabels([90, 95, 100], 14, 0, 100)).toEqual([72, 86, 100]);
    });

    it('keeps labels inside the top and bottom', () => {
      expect(spreadLabels([-5, 120], 14, 0, 100)).toEqual([0, 100]);
    });

    it('gives up when the labels need more room than there is', () => {
      expect(spreadLabels([10, 20, 30], 14, 0, 20)).toBeNull();
    });
  });

  describe('spreadLabelsAround', () => {
    it('keeps the anchor at its wanted position and spreads the others around it', () => {
      expect(spreadLabelsAround([40, 45, 50], 1, 14, 0, 100)).toEqual([31, 45, 59]);
    });

    it('puts labels wanted at the anchor position on the side with more room', () => {
      expect(spreadLabelsAround([100, 100, 100], 1, 14, 0, 100)).toEqual([72, 100, 86]);
      expect(spreadLabelsAround([0, 0], 0, 14, 0, 100)).toEqual([0, 14]);
    });

    it('judges ties by the wanted position, also where it lies past the bottom', () => {
      expect(spreadLabelsAround([110, 110, 110], 1, 14, 0, 100)).toEqual([72, 100, 86]);
    });

    it('moves the anchor only as far as the labels on one side need', () => {
      expect(spreadLabelsAround([5, 5, 10], 2, 14, 0, 100)).toEqual([0, 14, 28]);
    });

    it('gives up when the labels need more room than there is', () => {
      expect(spreadLabelsAround([10, 20, 30], 1, 14, 0, 20)).toBeNull();
    });
  });
});
