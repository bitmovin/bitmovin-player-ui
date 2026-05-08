import { buildTimestampLink } from '../../src/ts/components/PlayerContextMenu';

describe('PlayerContextMenu', () => {
  describe('buildTimestampLink', () => {
    it('appends ?t={seconds}s to a URL with no query string', () => {
      expect(buildTimestampLink(120, 'https://example.com/watch')).toBe('https://example.com/watch?t=120s');
    });

    it('appends &t=… when other query params already exist', () => {
      expect(buildTimestampLink(45, 'https://example.com/watch?foo=bar')).toBe(
        'https://example.com/watch?foo=bar&t=45s',
      );
    });

    it('replaces an existing t parameter rather than duplicating it', () => {
      expect(buildTimestampLink(99, 'https://example.com/watch?t=10s&foo=bar')).toBe(
        'https://example.com/watch?foo=bar&t=99s',
      );
    });

    it('replaces a trailing t parameter', () => {
      expect(buildTimestampLink(99, 'https://example.com/watch?foo=bar&t=10s')).toBe(
        'https://example.com/watch?foo=bar&t=99s',
      );
    });

    it('preserves the URL fragment', () => {
      expect(buildTimestampLink(7, 'https://example.com/watch?foo=bar#section')).toBe(
        'https://example.com/watch?foo=bar&t=7s#section',
      );
    });

    it('floors fractional seconds and clamps negatives to zero', () => {
      expect(buildTimestampLink(12.7, 'https://example.com/watch')).toBe('https://example.com/watch?t=12s');
      expect(buildTimestampLink(-3, 'https://example.com/watch')).toBe('https://example.com/watch?t=0s');
    });
  });
});
