export namespace StorageUtils {
  export function isLocalStorageAvailable(): boolean {
    try {
      return (
        window.localStorage &&
        typeof localStorage.getItem === "function" &&
        typeof localStorage.setItem === "function"
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
    if (StorageUtils.isLocalStorageAvailable()) {
      window.localStorage.setItem(key, data);
    }
  }

  /**
   * Gets an item's string value from the localStorage.
   * @param key the key to look up its associated value
   * @return {string | null} Returns the string if found, null if there is no data stored for the key
   */
  export function getItem(key: string): string | null {
    if (StorageUtils.isLocalStorageAvailable()) {
      return window.localStorage.getItem(key);
    } else {
      return null;
    }
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
    if (StorageUtils.isLocalStorageAvailable()) {
      let json = JSON.stringify(data);
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
    if (StorageUtils.isLocalStorageAvailable()) {
      let json = getItem(key);

      if (key) {
        let object = JSON.parse(json);
        return <T>object;
      }
    }
    return null;
  }
}
