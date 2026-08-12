import { StorageUtils } from '../../src/ts/utils/StorageUtils';

describe('StorageUtils', () => {
  const originalLocalStorage = window.localStorage;

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: originalLocalStorage,
    });
    StorageUtils.setStorageApiDisabled({ disableStorageApi: false });
    window.localStorage.clear();
  });

  it('does not use localStorage when removeItem is unavailable', () => {
    const storage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: storage,
    });
    StorageUtils.setStorageApiDisabled({ disableStorageApi: false });

    StorageUtils.setItem('key', 'value');
    StorageUtils.removeItem('key');
    const value = StorageUtils.getItem('key');

    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.getItem).not.toHaveBeenCalled();
    expect(value).toBeNull();
  });
});
