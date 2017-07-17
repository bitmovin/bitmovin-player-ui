import {ColorUtils} from './colorutils';

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

  /**
   * Stores a string item into localStorage.
   * @param key the item's key
   * @param data the item's data
   */
  export function setItem(key: string, data: string): void {
    if (StorageUtils.hasLocalStorage()) {
      window.localStorage.setItem(key, data);
    }
  }

  /**
   * Gets an item's string value from the localStorage.
   * @param key the key to look up its associated value
   * @return {string | null} Returns the string if found, null if there is no data stored for the key
   */
  export function getItem(key: string): string | null {
    if (StorageUtils.hasLocalStorage()) {
      return window.localStorage.getItem(key);
    } else {
      return null;
    }
  }

  const ColorUtilsColorMarker = 'ColorUtils.Color::';

  /**
   * Stores an object into localStorage. The object will be serialized to JSON. The following types are supported
   * in addition to the default types:
   *  - ColorUtils.Color
   *
   * @param key the key to store the data to
   * @param data the object to store
   */
  export function setObject<T>(key: string, data: T): void {
    if (StorageUtils.hasLocalStorage()) {
      let json = JSON.stringify(data, (key: string, value: any) => {
        if (value instanceof ColorUtils.Color) {
          return ColorUtilsColorMarker + value.toCSS();
        }
        return value;
      });

      setItem(key, json);
    }
  }

  /**
   * Gets an object for the given key from localStorage. The object will be deserialized from JSON. Beside the
   * default types, the following types are supported:
   *  - ColorUtils.Color
   *
   * @param key the key to look up its associated object
   * @return {any} Returns the object if found, null otherwise
   */
  export function getObject<T>(key: string): T {
    if (StorageUtils.hasLocalStorage()) {
      let json = getItem(key);

      if (key) {
        let object = JSON.parse(json, (key: any, value: any) => {
          if (typeof value === 'string' && value.indexOf(ColorUtilsColorMarker) === 0) {
            return ColorUtils.colorFromCss(value.substr(ColorUtilsColorMarker.length));
          }
          return value;
        });

        return <T>object;
      }
    }
    return null;
  }
}
