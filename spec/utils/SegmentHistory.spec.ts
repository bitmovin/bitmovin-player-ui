import { SegmentHistory } from '../../src/ts/utils/SegmentHistory';
import {
  AUDIO_EN,
  buildPlayer,
  PLAYER_EVENTS,
  PlayerStub,
  segmentParsed,
  segmentRequest,
  VIDEO_1080,
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

    it.each([PLAYER_EVENTS.PeriodSwitched, PLAYER_EVENTS.VideoQualityAdded])(
      'adds a video quality the player lists after `%s`',
      event => {
        (player as any).getAvailableVideoQualities = () => [VIDEO_1080, { id: 'v2160', label: '2160p', bitrate: 9e6 }];
        player.fire(event);

        expect(history.getRenditions().map(rendition => rendition.id)).toEqual(['v2160', 'v1080', 'v720', 'a-en']);
      },
    );

    it('adds an audio track the player lists after `AudioAdded`', () => {
      (player as any).getAvailableAudio = () => [
        { id: 'en', lang: 'en', getQualities: () => [AUDIO_EN] },
        { id: 'de', lang: 'de', getQualities: () => [{ id: 'a-de', label: '96k', bitrate: 96000 }] },
      ];
      player.fire(PLAYER_EVENTS.AudioAdded);

      expect(history.getRenditions().map(rendition => rendition.id)).toEqual(['v1080', 'v720', 'a-en', 'a-de']);
    });

    it('clears them when the source unloads', () => {
      player.fire(PLAYER_EVENTS.SourceUnloaded);

      expect(history.getRenditions()).toEqual([]);
    });

    it('adds a rendition the player does not list yet for its segment, with the bitrate its parse reports', () => {
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4, { representationId: 'v-next' }));
      player.fire(
        PLAYER_EVENTS.SegmentParsed,
        segmentParsed('s1', 4, { representationId: 'v-next', mediaInfo: { bitrate: 6e6, height: 2160 } }),
      );

      expect(history.getRenditions()).toEqual([
        { id: 'v-next', mediaType: 'video', label: 'v-next', bitrate: 6e6, isListed: false },
        expect.objectContaining({ id: 'v1080', isListed: true }),
        expect.objectContaining({ id: 'v720', isListed: true }),
        expect.objectContaining({ id: 'a-en', isListed: true }),
      ]);
    });

    it("takes the player's entry for a rendition once the player lists it", () => {
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4, { representationId: 'v2160' }));
      (player as any).getAvailableVideoQualities = () => [{ id: 'v2160', label: '2160p', bitrate: 9e6 }];
      player.fire(PLAYER_EVENTS.PeriodSwitched);

      expect(history.getRenditions()[0]).toEqual({
        id: 'v2160',
        mediaType: 'video',
        label: '2160p',
        bitrate: 9e6,
        isListed: true,
      });
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
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4, { success: false, attempt: 3 }));
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4, { attempt: 2 }));

      expect(history.getRecords()).toEqual([expect.objectContaining({ outcome: 'downloaded', failures: 4 })]);
    });

    it('counts no failed attempts for a request that does not report them, as from a custom segment loader', () => {
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4, { attempt: undefined }));

      expect(history.getRecords()).toEqual([expect.objectContaining({ failures: 0 })]);
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
    ])('records a request %s as failed, with its attempts', (_, overrides) => {
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4, { success: false, ...overrides }));

      expect(history.getRecords()).toEqual([expect.objectContaining({ outcome: 'failed', failures: 1 })]);
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

  describe('where a segment came from', () => {
    it('marks a segment the HTTP cache answered and leaves it unmeasured', () => {
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4, { loadedFrom: 'httpCache' }));

      expect(history.getRecords()).toEqual([expect.objectContaining({ httpCache: true })]);
      expect(history.getRecords()[0].mbps).toBeUndefined();
    });

    it('keeps a network download unmarked when the HTTP cache answers it again', () => {
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4, { wasPrefetched: true }));
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4, { loadedFrom: 'httpCache' }));

      expect(history.getRecords()).toEqual([expect.objectContaining({ httpCache: false, prefetched: true, mbps: 8 })]);
    });

    it('marks a segment the HTTP cache answered when a parsed chunk reported it first', () => {
      player.fire(PLAYER_EVENTS.SegmentParsed, segmentParsed('s1', 4));
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4, { loadedFrom: 'httpCache' }));

      expect(history.getRecords()).toEqual([expect.objectContaining({ httpCache: true })]);
    });

    it('counts the refills from the player cache', () => {
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4));
      player.fire(PLAYER_EVENTS.SegmentParsed, segmentParsed('s1', 4, { loadedFrom: 'cache' }));
      player.fire(PLAYER_EVENTS.SegmentParsed, segmentParsed('s1', 4, { loadedFrom: 'cache' }));

      expect(history.getRecords()[0].reused).toBe(2);
    });
  });

  describe('parsed timing', () => {
    it('places a segment where its media plays', () => {
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4));
      player.fire(PLAYER_EVENTS.SegmentParsed, segmentParsed('s1', 3.9, { duration: 1.5 }));

      expect(history.getRecords()).toEqual([
        expect.objectContaining({ start: 4, end: 6, mediaStart: 3.9, mediaEnd: 5.4 }),
      ]);
    });

    it('spans all chunks of a chunked CMAF segment, which are parsed before its request finishes', () => {
      player.fire(PLAYER_EVENTS.SegmentParsed, segmentParsed('s1', 4, { duration: 0.5 }));
      player.fire(PLAYER_EVENTS.SegmentParsed, segmentParsed('s1', 4.5, { duration: 0.5 }));
      expect(history.getRecords()).toEqual([expect.objectContaining({ start: 4, end: 4 })]);

      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4));
      expect(history.getRecords()).toEqual([expect.objectContaining({ start: 4, end: 6, mediaStart: 4, mediaEnd: 5 })]);
    });

    it('takes the timing of a muxed TS segment from its video part', () => {
      player.fire(PLAYER_EVENTS.SegmentRequestFinished, segmentRequest('s1', 4, { mimeType: 'video/mp2t' }));
      player.fire(PLAYER_EVENTS.SegmentParsed, segmentParsed('s1', 4, { duration: 2 }));
      player.fire(PLAYER_EVENTS.SegmentParsed, segmentParsed('s1', 4.02, { duration: 2.03, mimeType: 'audio/mp4' }));

      expect(history.getRecords()).toEqual([expect.objectContaining({ mediaStart: 4, mediaEnd: 6 })]);
    });

    it('falls back to the presentation timestamp before transmuxed TS knows its playback time', () => {
      player.fire(PLAYER_EVENTS.SegmentParsed, segmentParsed('s1', NaN, { presentationTimestamp: 8 }));

      expect(history.getRecords()[0].mediaStart).toBe(8);
    });
  });

  it('stops recording when released', () => {
    history.release();

    expect(player.handlers.size).toBe(0);
  });
});
