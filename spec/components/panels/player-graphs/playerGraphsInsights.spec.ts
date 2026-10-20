import {
  collectInsights,
  findTimingDrifts,
} from '../../../../src/ts/components/panels/player-graphs/playerGraphsInsights';
import { frame, record } from './graphTestHelpers';

/** A 2 s segment declared at `start` that plays for `realDuration` from `mediaStart`. */
function parsed(uid: string, start: number, mediaStart: number, realDuration = 2) {
  return record(uid, start, { mediaStart, mediaEnd: mediaStart + realDuration, url: `https://cdn/${uid}.ts?token=1` });
}

describe('player graphs insights', () => {
  describe('findTimingDrifts', () => {
    it('reports a rendition whose segments last shorter than declared, from the first of two in a row', () => {
      const drifts = findTimingDrifts(
        frame([parsed('s1', 0, 0), parsed('s2', 2, 1.96, 1.96), parsed('s3', 4, 3.92, 1.96)]),
      );

      expect(drifts).toEqual([
        expect.objectContaining({ declaredDuration: 2, realDuration: 1.96, url: 'https://cdn/s2.ts?token=1' }),
      ]);
      expect(collectInsights(frame([]), drifts, 0)[0].text).toBe(
        'Video "1080p": manifest declares segments of 2.000s, but they last 1.960s, so its timeline drifts from the media. ' +
          'First seen at s2.ts.',
      );
    });

    it('ignores a single segment declared short, and exact segments', () => {
      expect(findTimingDrifts(frame([parsed('s1', 0, 0, 1.5), parsed('s2', 2, 1.5), parsed('s3', 4, 3.5)]))).toEqual(
        [],
      );
    });

    it('reports segments offset from their declared start by more than half a segment', () => {
      expect(findTimingDrifts(frame([parsed('s1', 0, 1.5), parsed('s2', 2, 3.5)]))).toHaveLength(1);
    });

    it('waits for the request of a segment parsed before it, whose declared span is not known yet', () => {
      expect(findTimingDrifts(frame([record('s1', 0, { end: 0, mediaStart: 0, mediaEnd: 0.5 })]))).toEqual([]);
    });
  });

  describe('collectInsights', () => {
    it('counts the retried segments that have not scrolled out of the window', () => {
      const insights = collectInsights(
        frame([
          record('old', 0, { failures: 1 }),
          record('s1', 30, { failures: 2 }),
          record('s2', 70, { failures: 1 }),
        ]),
        [],
        10,
      );

      expect(insights).toEqual([expect.objectContaining({ kind: 'retries', count: 2 })]);
    });

    it('says when the audio is muxed into the video, and counts the refills from the player cache', () => {
      const insights = collectInsights(
        frame([record('s1', 0, { reused: 2 }), record('s2', 2, { reused: 1 })], { muxedAudio: true }),
        [],
        0,
      );

      expect(insights.map(insight => insight.kind)).toEqual(['muxed', 'reuse']);
      expect(insights[1].text).toContain(
        "2 segments were refilled from the player's own segment cache without a new request (3 times in all)",
      );
    });
  });
});
