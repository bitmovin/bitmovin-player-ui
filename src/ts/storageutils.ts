import { UIConfig } from './uiconfig';

export namespace StorageUtils {
  /*
    At the time of using `storageutils` inside components, the config isn't yet processed.
    In order to know if we are allowed to use the `localStorage` API, we wait for the config to be
    provided.
  */
  let uiConfigSetResolver: (uiConfig: UIConfig) => void;
  let uiConfigSetPromise = new Promise<UIConfig>((resolve) => {
    uiConfigSetResolver = resolve;
  });

  export function resolveStorageAccess(uiConfig: UIConfig) {
    uiConfigSetResolver?.(uiConfig);
  }

  function isLocalStorageAvailable(): boolean {
    try {
      return (
        window.localStorage &&
        typeof localStorage.getItem === 'function' &&
        typeof localStorage.setItem === 'function'
      );
    } catch (e) {
      console.debug('Error while checking localStorage availablility', e);
      return false;
    }
  }

  function shouldUseLocalStorage(): Promise<boolean> {
    return uiConfigSetPromise.then((uiConfig) => {
      return !uiConfig.disableStorageApi && isLocalStorageAvailable();
    });
  }

  /**
   * Stores a string item into localStorage.
   * @param key the item's key
   * @param data the item's data
   */
  export async function setItem(key: string, data: string): Promise<void> {
    if (await shouldUseLocalStorage()) {

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
  export async function getItem(key: string): Promise<string | null> {
    if (await shouldUseLocalStorage()) {
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
  export async function setObject<T>(key: string, data: T): Promise<void> {
    let json = JSON.stringify(data);
    await setItem(key, json);
  }

  /**
   * Gets an object for the given key from localStorage. The object will be deserialized from JSON. Beside the
   * default types, the following types are supported:
   *  - ColorUtils.Color
   *
   * @param key the key to look up its associated object
   * @return {any} Returns the object if found, null otherwise
   */
  export async function getObject<T>(key: string): Promise<T | null> {
    let json = await getItem(key);

    if (json) {
      let object = JSON.parse(json);
      return <T>object;
    }
    return null;
  }
}
