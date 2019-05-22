export class BrowserUtils {

  // isMobile only needs to be evaluated once (it cannot change during a browser session)
  // Mobile detection according to Mozilla recommendation: "In summary, we recommend looking for the string “Mobi”
  // anywhere in the User Agent to detect a mobile device."
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent
  static get isMobile(): boolean {
    return navigator && navigator.userAgent && /Mobi/.test(navigator.userAgent);
  }

  static get isChrome(): boolean {
    return navigator && navigator.userAgent && /Chrome/.test(navigator.userAgent);
  }

  static get isAndroid(): boolean {
    return navigator && navigator.userAgent && /Android/.test(navigator.userAgent);
  }
}
