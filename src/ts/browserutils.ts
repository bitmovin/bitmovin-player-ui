export class BrowserUtils {

  // isMobile only needs to be evaluated once (it cannot change during a browser session)
  // Mobile detection according to Mozilla recommendation: "In summary, we recommend looking for the string “Mobi”
  // anywhere in the User Agent to detect a mobile device."
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent
  static get isMobile(): boolean {
    if (!this.windowExists()) {
      return false;
    }
    return navigator && navigator.userAgent && /Mobi/.test(navigator.userAgent);
  }

  static get isChrome(): boolean {
    if (!this.windowExists()) {
      return false;
    }
    return navigator && navigator.userAgent && /Chrome/.test(navigator.userAgent);
  }

  static get isAndroid(): boolean {
    if (!this.windowExists()) {
      return false;
    }
    return navigator && navigator.userAgent && /Android/.test(navigator.userAgent);
  }

  static get isIOS(): boolean {
    if (!this.windowExists()) {
      return false;
    }
    return navigator && navigator.userAgent && /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  static get isMacIntel(): boolean {
    if (!this.windowExists()) {
      return false;
    }
    return navigator && navigator.userAgent && navigator.platform === 'MacIntel';
  }

  // https://hacks.mozilla.org/2013/04/detecting-touch-its-the-why-not-the-how/
  static get isTouchSupported() {
    if (!this.windowExists()) {
      return false;
    }
    return 'ontouchstart' in window || navigator && navigator.userAgent && (navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0);
  }

  private static windowExists(): boolean {
    return typeof window !== 'undefined';
  }
}
