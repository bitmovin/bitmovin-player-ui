export function installPolyfills() {

  // https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
  if (typeof Object.assign !== 'function') {
    Object.assign = function(target: any) {
      'use strict';
      if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      target = Object(target);
      for (let index = 1; index < arguments.length; index++) {
        let source = arguments[index];
        if (source != null) {
          for (let key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }
      }
      return target;
    };
  }

  /*
  * Polyfill for Array Array.prototype.find
  * source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
  */
  if (!Array.prototype.find) {
    Array.prototype.find = function(predicate: any) {
      'use strict';
      if (this == null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }

      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      var list = Object(this);
      var length = list.length >>> 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        value = list[i];
        if (predicate.call(thisArg, value, i, list)) {
          return value;
        }
      }
      return undefined;
    };
  }
}
