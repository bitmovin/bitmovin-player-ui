import { PlayerInsightsUtils } from '../../src/ts/utils/PlayerInsightsUtils';

describe('PlayerInsightsUtils', () => {
  describe('formatVideoQualityInsight', () => {
    it('marks the downloaded video rendition when it differs from playback', () => {
      const player = {
        getAvailableVideoQualities: jest.fn().mockReturnValue([
          {
            id: 'downloaded',
            bitrate: 2500000,
            width: 1280,
            height: 720,
            frameRate: 25,
            codec: 'avc1',
          },
        ]),
        getPlaybackVideoData: jest.fn().mockReturnValue({
          id: 'playback',
          bitrate: 5000000,
          width: 1920,
          height: 1080,
          frameRate: 25,
          codec: 'avc1',
        }),
        getDownloadedVideoData: jest.fn().mockReturnValue({
          id: 'downloaded',
          bitrate: 2500000,
          width: 1280,
          height: 720,
        }),
      };

      expect(PlayerInsightsUtils.formatVideoQualityInsight(player as any)).toBe(
        '1920x1080@25,5.00Mbps,avc1 / \u21931280x720@25,2.50Mbps,avc1',
      );
    });

    it('uses the playback video value when downloaded video data is unavailable', () => {
      const player = {
        getAvailableVideoQualities: jest.fn().mockReturnValue([]),
        getPlaybackVideoData: jest.fn().mockReturnValue({
          id: 'playback',
          bitrate: 5000000,
          width: 1920,
          height: 1080,
          frameRate: 25,
          codec: 'avc1',
        }),
        getDownloadedVideoData: jest.fn().mockReturnValue(undefined),
      };

      expect(PlayerInsightsUtils.formatVideoQualityInsight(player as any)).toBe('1920x1080@25,5.00Mbps,avc1');
    });
  });

  describe('formatAudioQualityInsight', () => {
    it('marks the downloaded audio rendition when it differs from playback', () => {
      const player = {
        getAvailableAudioQualities: jest.fn().mockReturnValue([
          {
            id: 'downloaded',
            bitrate: 256000,
            codec: 'opus',
          },
        ]),
        getPlaybackAudioData: jest.fn().mockReturnValue({
          id: 'playback',
          bitrate: 128000,
          codec: 'aac',
        }),
        getDownloadedAudioData: jest.fn().mockReturnValue({
          id: 'downloaded',
          bitrate: 256000,
        }),
      };

      expect(PlayerInsightsUtils.formatAudioQualityInsight(player as any)).toBe('128kbps,aac / \u2193256kbps,opus');
    });
  });

  describe('formatBufferInsight', () => {
    it('shows the audio buffer when no video buffer is available', () => {
      const mediaType = {
        Audio: 'audio',
        Video: 'video',
      };
      const player = {
        exports: {
          BufferType: {
            ForwardDuration: 'forwardduration',
          },
          MediaType: mediaType,
        },
        buffer: {
          getLevel: jest.fn((_bufferType, requestedMediaType) => ({
            level: requestedMediaType === mediaType.Video ? null : 2.5,
          })),
        },
      };

      expect(PlayerInsightsUtils.formatBufferInsight(player as any)).toBe('- / 2.50s');
    });
  });

  describe('formatViewportFramesInsight', () => {
    it('uses the player video element dimensions', () => {
      const player = {
        getVideoElement: jest.fn().mockReturnValue({
          clientWidth: 640,
          clientHeight: 360,
        }),
        getDroppedVideoFrames: jest.fn().mockReturnValue(3),
      };

      expect(PlayerInsightsUtils.formatViewportFramesInsight(player as any)).toBe('640x360 / 3 dropped');
      expect(player.getVideoElement).toHaveBeenCalled();
    });
  });
});
