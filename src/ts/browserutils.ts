export namespace BrowserUtils {
  // set default value for navigator when using package in nodejs or ssr app
  const navigator = typeof window === 'undefined' ? {userAgent: ''} : window.navigator;

  // isMobile only needs to be evaluated once (it cannot change during a browser session)
  // Mobile detection according to Mozilla recommendation: "In summary, we recommend looking for the string “Mobi”
  // anywhere in the User Agent to detect a mobile device."
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent
  export const isMobile = navigator && navigator.userAgent && /Mobi/.test(navigator.userAgent);

  export const isChrome = navigator && navigator.userAgent && /Chrome/.test(navigator.userAgent);

  export const isAndroid = navigator && navigator.userAgent && /Android/.test(navigator.userAgent);
}
