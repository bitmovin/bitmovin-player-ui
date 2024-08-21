import { UIConfig } from './uiconfig';

/**
 * @category Utils
 */
export namespace StorageUtils {
 let disableStorageApi: boolean;

  export function setStorageApiDisabled(uiConfig: UIConfig) {
    disableStorageApi = uiConfig.disableStorageApi;
  }

  function shouldUseLocalStorage(): boolean {
    try {
      return (
        !disableStorageApi &&
        window.localStorage &&
        typeof localStorage.getItem === 'function' &&
        typeof localStorage.setItem === 'function'
      );
    } catch (e) {
      return false;
    }
  }

  /**
   * Stores a string item into localStorage.
   * @param key the item's key
   * @param data the item's data
   */
  export function setItem(key: string, data: string): void {
    if (shouldUseLocalStorage()) {
      try {
        window.localStorage.setItem(key, data);
      } catch (e) {
        console.debug(`Failed to set storage item ${key}`, e);
      }
    }
  }

  /**
   * Gets an item's string value from the localStorage.
   * @param key the key to look up its associated value
   * @return {string | null} Returns the string if found, null if there is no data stored for the key
   */
  export function getItem(key: string): string | null {
    if (shouldUseLocalStorage()) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        console.debug(`Failed to get storage item ${key}`, e);
      }
    }

    return null;
  }

  /**
   * Stores an object into localStorage. The object will be serialized to JSON. The following types are supported
   * in addition to the default types:
   *  - ColorUtils.Color
   *
   * @param key the key to store the data to
   * @param data the object to store
   */
  export function setObject<T>(key: string, data: T): void {
    let json = JSON.stringify(data);
    setItem(key, json);
  }

  /**
   * Gets an object for the given key from localStorage. The object will be deserialized from JSON. Beside the
   * default types, the following types are supported:
   *  - ColorUtils.Color
   *
   * @param key the key to look up its associated object
   * @return {any} Returns the object if found, null otherwise
   */
  export function getObject<T>(key: string): T | null {
    let json = getItem(key);

    if (json) {
      let object = JSON.parse(json);
      return <T>object;
    }
    return null;
  }
}
