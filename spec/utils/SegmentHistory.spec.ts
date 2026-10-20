import { SegmentHistory } from '../../src/ts/utils/SegmentHistory';
import {
  AUDIO_EN,
  buildPlayer,
  PLAYER_EVENTS,
  PlayerStub,
  segmentRequest,
} from '../components/panels/player-graphs/graphTestHelpers';

describe('SegmentHistory', () => {
  let player: PlayerStub;
  let history: SegmentHistory;

  function initialize(overrides = {}): void {
    player = buildPlayer(overrides);
    history = new SegmentHistory();
    history.initialize(player);
  }

  beforeEach(() => initialize());

  describe('renditions', () => {
    it('lists video then audio, highest bitrate first', () => {
      expect(history.getRenditions().map(rendition => rendition.id)).toEqual(['v1080', 'v720', 'a-en']);
    });

    it('labels an audio track with one quality by its language, and one with several per quality', () => {
      initialize({
        getAvailableAudio: () => [
          { id: 'en', lang: 'en', getQualities: () => [AUDIO_EN] },
          {
            id: 'de',
            lang: 'de',
            getQualities: () => [
              { id: 'a-de-64', label: '64k', bitrate: 64000 },
              { id: 'a-de-128', label: '128k', bitrate: 128000 },
            ],
          },
        ],
      });

      expect(history.getRenditions().map(rendition => rendition.label)).toEqual([
        '1080p',
        '720p',
        'en',
        'de 128k',
        'de 64k',
      ]);
    });

    it('leaves out an audio track muxed into the video segments', () => {
      initialize({
        getAvailableAudio: () => [
          { id: 'muxed', lang: 'und', isMuxedIntoVideo: true, getQualities: (): unknown[] => [] },
        ],
      });

      expect(history.getRenditions().map(rendition => rendition.mediaType)).toEqual(['video', 'video']);
    });

    it('keeps the renditions of an earlier period when `Ready` lists the next period', () => {
      (player as any).getAvailableVideoQualities = () => [{ id: 'p2-v', label: '480p', bitrate: 1000000 }];
      player.fire(PLAYER_EVENTS.Ready);

      expect(history.getRenditions().map(rendition => rendition.id)).toEqual(['v1080', 'v720', 'p2-v', 'a-en']);
    });

    it('clears them when the source unloads', () => {
      player.fire(PLAYER_EVENTS.SourceUnloaded);

      expect(history.getRenditions()).toEqual([]);
    });
  });

  describe('segment requests', () => {
    it('records a downloaded segment with its declared span and throughput', () => {
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4));

      expect(history.getRecords()).toEqual([
        expect.objectContaining({ uid: 's1', mediaType: 'video', start: 4, end: 6, outcome: 'downloaded', mbps: 8 }),
      ]);
    });

    it('joins later requests for the same segment by uid and adds up their failed attempts', () => {
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4, { success: false, attempts: 3 }));
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4, { attempts: 2 }));

      expect(history.getRecords()).toEqual([expect.objectContaining({ outcome: 'downloaded', failures: 4 })]);
    });

    it('keeps the throughput of the first download', () => {
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4));
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4, { downloadTime: 0.001 }));

      expect(history.getRecords()[0].mbps).toBe(8);
    });

    it('counts a download without a size instead of measuring it', () => {
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4, { size: -1 }));

      expect(history.getRecords()[0].mbps).toBeUndefined();
      expect(history.getUnsizedCount('video')).toBe(1);
    });

    it.each([
      ['an init segment', { isInit: true }],
      ['a subtitle segment', { mimeType: 'application/mp4' }],
      ['a segment without a start time', { startTime: undefined }],
      ['a request cancelled for a seek', { success: false, cancelReason: 'cancel' }],
      ['a request adaptation abandoned after it received data', { success: false, cancelReason: 'abr', size: 5000 }],
    ])('ignores %s', (_, overrides) => {
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4, overrides));

      expect(history.getRecords()).toEqual([]);
    });

    it.each([
      ['abandoned without data', { cancelReason: 'abr', size: -1 }],
      ['that timed out', { cancelReason: 'timeout' }],
    ])('records a request %s as failed', (_, overrides) => {
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4, { success: false, ...overrides }));

      expect(history.getRecords()).toEqual([expect.objectContaining({ outcome: 'failed' })]);
    });

    it('records only prefetched content segments during an ad break', () => {
      player.fire(PLAYER_EVENTS.AdBreakStarted);
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('ad', 0));
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4, { wasPrefetched: true }));
      player.fire(PLAYER_EVENTS.AdBreakFinished);
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s2', 6));

      expect(history.getRecords().map(record => record.uid)).toEqual(['s1', 's2']);
    });

    it('clears the records when the source unloads', () => {
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4, { size: -1 }));
      player.fire(PLAYER_EVENTS.SourceUnloaded);

      expect(history.getRecords()).toEqual([]);
      expect(history.getUnsizedCount('video')).toBe(0);
    });
  });

  it('marks the segment that a playback event names as played', () => {
    player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4));
    player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s2', 6));
    player.fire(PLAYER_EVENTS.SegmentPlayback, { uid: 's2' });

    expect(history.getRecords().map(record => record.played)).toEqual([false, true]);
  });

  it('stops recording when released', () => {
    history.release();

    expect(player.handlers.size).toBe(0);
  });
});
