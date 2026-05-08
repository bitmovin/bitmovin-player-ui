import { formatBitrate, formatSeconds, truncateMiddle } from '../../../src/ts/components/overlays/DebugInfoOverlay';

describe('DebugInfoOverlay helpers', () => {
  describe('formatBitrate', () => {
    it('returns "? kbps" for missing or non-finite values', () => {
      expect(formatBitrate(undefined)).toBe('? kbps');
      expect(formatBitrate(0)).toBe('? kbps');
      expect(formatBitrate(Number.POSITIVE_INFINITY)).toBe('? kbps');
      expect(formatBitrate(Number.NaN)).toBe('? kbps');
    });

    it('formats sub-megabit values as kbps', () => {
      expect(formatBitrate(128_000)).toBe('128 kbps');
      expect(formatBitrate(999_999)).toBe('1000 kbps');
    });

    it('formats megabit values as Mbps with two decimals', () => {
      expect(formatBitrate(1_000_000)).toBe('1.00 Mbps');
      expect(formatBitrate(6_210_000)).toBe('6.21 Mbps');
    });
  });

  describe('formatSeconds', () => {
    it('returns ∞ for non-finite values', () => {
      expect(formatSeconds(Number.POSITIVE_INFINITY)).toBe('∞');
    });

    it('formats sub-hour values as m:ss', () => {
      expect(formatSeconds(0)).toBe('0:00');
      expect(formatSeconds(45)).toBe('0:45');
      expect(formatSeconds(125)).toBe('2:05');
    });

    it('formats hour-or-greater values as h:mm:ss', () => {
      expect(formatSeconds(3600)).toBe('1:00:00');
      expect(formatSeconds(3725)).toBe('1:02:05');
    });

    it('preserves a leading minus for negative values', () => {
      expect(formatSeconds(-30)).toBe('-0:30');
      expect(formatSeconds(-3661)).toBe('-1:01:01');
    });
  });

  describe('truncateMiddle', () => {
    it('returns the original string when within the limit', () => {
      expect(truncateMiddle('short', 10)).toBe('short');
    });

    it('inserts an ellipsis in the middle when too long', () => {
      const result = truncateMiddle('https://cdn.example.com/very/long/manifest.mpd', 20);
      expect(result.length).toBeLessThanOrEqual(20);
      expect(result).toContain('…');
      expect(result.startsWith('https://')).toBe(true);
      expect(result.endsWith('.mpd')).toBe(true);
    });
  });
});
