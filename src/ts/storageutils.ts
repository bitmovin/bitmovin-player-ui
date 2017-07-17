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

  const ColorUtilsColorMarker = 'ColorUtils.Color::';

  export function setObject<T>(item: string, object: T): void {
    if (StorageUtils.hasLocalStorage()) {
      let json = JSON.stringify(object, (key: string, value: any) => {
        if (value instanceof ColorUtils.Color) {
          return ColorUtilsColorMarker + value.toCSS();
        }
        return value;
      });

      setItem(item, json);
    }
  }

  export function getObject<T>(item: string): T {
    if (StorageUtils.hasLocalStorage()) {
      let json = getItem(item);

      if (item) {
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
