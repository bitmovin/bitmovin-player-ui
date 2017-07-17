export namespace StorageUtils {
  let hasLocalStorageCache: boolean;

  export function hasLocalStorage(): boolean {
    if (hasLocalStorageCache) {
      return hasLocalStorageCache;
    }

    // hasLocalStorage is used to safely ensure we can use localStorage
    // taken from https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#Feature-detecting_localStorage
    let storage = window['localStorage'];
    try {
      let x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      hasLocalStorageCache = true;
    }
    catch (e) {
      hasLocalStorageCache = e instanceof DOMException && (
          // everything except Firefox
        e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === 'QuotaExceededError' ||
        // Firefox
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
        // acknowledge QuotaExceededError only if there's something already stored
        storage.length !== 0;
    }
    return hasLocalStorageCache;
  }

  export function setItem(item: string, value: string): void {
    if (StorageUtils.hasLocalStorage()) {
      window.localStorage.setItem(item, value);
    }
  }

  export function getItem(item: string): string | null {
    if (StorageUtils.hasLocalStorage()) {
      return window.localStorage.getItem(item);
    } else {
      return null;
    }
  }
}
