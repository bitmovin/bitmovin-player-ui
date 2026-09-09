/**
 * Built-ins that postdate the oldest platform this UI supports (webOS 3.x / LG 2017, Chromium 38)
 * and that nothing else installs for us.
 *
 * Deliberately small: the web player bundle installs `Object.assign`, `Object.values`,
 * `Object.entries`, `Array.prototype.find`/`findIndex`/`includes`, `String.prototype.includes`/
 * `startsWith`/`endsWith`, `Map`, `WeakMap` and `Promise` while it is being evaluated, and a UI can
 * only be constructed around an existing player, so UI runtime code already has those. `Array.from`
 * is the one the player does not install, and `Object.assign` is kept because this module is loaded
 * first and cannot assume the player bundle was evaluated before it.
 *
 * This does not help code that runs while a module is still being evaluated: module bodies run
 * before this module on the paths that matter (the export barrel in main.ts, and consumers that
 * import `dist/js/framework` modules directly), so they must stay on the Chromium 38 baseline
 * regardless of what is polyfilled here. spec/Polyfills.spec.ts guards both rules.
 */

/**
 * Installs `value` unless the platform, or the player bundle, already provides it. Uses
 * defineProperty so prototype members would not become enumerable, and so that an existing
 * non-configurable polyfill is left alone rather than assigned over.
 */
function define(owner: any, member: string, value: (...args: any[]) => any): void {
  if (typeof owner[member] === 'function') {
    return;
  }

  Object.defineProperty(owner, member, { value, configurable: true, writable: true, enumerable: false });
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
define(Object, 'assign', function (target: any) {
  'use strict';
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }

  target = Object(target);
  for (let index = 1; index < arguments.length; index++) {
    const source = arguments[index];
    if (source != null) {
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
  }
  return target;
});

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
// Array-likes only. The UI uses Array.from on DOM collections (classList, NodeList), never on
// iterators, and iterator support would need Symbol.iterator which Chromium 38 also lacks.
define(Array, 'from', function (arrayLike: any, mapFn?: (value: any, index: number) => any, thisArg?: any) {
  if (arrayLike == null) {
    throw new TypeError('Array.from requires an array-like value');
  }

  const source = Object(arrayLike);
  const length = source.length >>> 0;
  const result: any[] = [];
  for (let index = 0; index < length; index++) {
    result.push(mapFn ? mapFn.call(thisArg, source[index], index) : source[index]);
  }
  return result;
});
