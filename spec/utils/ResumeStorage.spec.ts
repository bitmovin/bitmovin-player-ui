import { ResumeStorage } from '../../src/ts/utils/ResumeStorage';
import { StorageUtils } from '../../src/ts/utils/StorageUtils';
import { MockHelper, TestingPlayerAPI } from '../helper/MockHelper';

describe('ResumeStorage', () => {
  let player: TestingPlayerAPI;

  beforeEach(() => {
    StorageUtils.setStorageApiDisabled({ disableStorageApi: false });
    player = MockHelper.getPlayerMock();
    // Clear any leftover storage between tests.
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  describe('keyFor', () => {
    it('hashes the source title when provided', () => {
      (player.getSource as jest.Mock).mockReturnValue({});
      const k1 = ResumeStorage.keyFor(player, { metadata: { title: 'My Show E01' } });
      const k2 = ResumeStorage.keyFor(player, { metadata: { title: 'My Show E01' } });
      const k3 = ResumeStorage.keyFor(player, { metadata: { title: 'My Show E02' } });
      expect(k1).toBe(k2);
      expect(k1).not.toBe(k3);
      expect(k1).toMatch(/^bitmovin\.player\.ui\.resume\./);
    });

    it('falls back to the manifest URL when there is no title', () => {
      (player.getSource as jest.Mock).mockReturnValue({ dash: 'https://cdn.example/m.mpd' });
      const key = ResumeStorage.keyFor(player, {});
      expect(key).not.toBeNull();
      expect(key!).toMatch(/^bitmovin\.player\.ui\.resume\./);
    });

    it('returns null when the source has no usable identifier', () => {
      (player.getSource as jest.Mock).mockReturnValue({});
      const key = ResumeStorage.keyFor(player, {});
      expect(key).toBeNull();
    });
  });

  describe('write / read / clear', () => {
    const KEY = 'bitmovin.player.ui.resume.test';

    it('round-trips a saved entry', () => {
      ResumeStorage.write(KEY, 90, 600);
      const read = ResumeStorage.read(KEY);
      expect(read).not.toBeNull();
      expect(read!.t).toBe(90);
      expect(read!.d).toBe(600);
    });

    it('skips writing when too close to the start (< 5s)', () => {
      ResumeStorage.write(KEY, 2, 600);
      expect(ResumeStorage.read(KEY)).toBeNull();
    });

    it('skips writing when within 30s of the end', () => {
      ResumeStorage.write(KEY, 580, 600);
      expect(ResumeStorage.read(KEY)).toBeNull();
    });

    it('clear removes a previously saved entry', () => {
      ResumeStorage.write(KEY, 90, 600);
      ResumeStorage.clear(KEY);
      expect(ResumeStorage.read(KEY)).toBeNull();
    });
  });
});
