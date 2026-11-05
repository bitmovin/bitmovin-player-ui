/**
 * Guards the two rules that keep the UI loadable on the oldest supported platform
 * (webOS 3.x / LG 2017, Chromium 38):
 *
 * 1. Direct framework imports must install polyfills before constructing components during module
 *    evaluation, without relying on main.ts or the player bundle being loaded first.
 * 2. main.ts must also install the polyfills before evaluating its exports.
 *
 * Rule 1 is exactly how https://github.com/bitmovin/bitmovin-player-ui broke on webOS 3.x: a
 * top-level `const STORAGE_KEY_PREFIX = ` + '`${prefixCss(...)}.`' + ` in UIPreferencesManager and
 * ResumePositionTracker instantiated a Component at module-evaluation time, and the Component
 * constructor calls Object.assign.
 *
 * Note that nothing in here may use a Jest matcher while the built-ins are removed: expect() itself
 * needs them, and would fail with a misleading error. Observations are collected first and asserted
 * once the built-ins are back.
 */

// Built-ins removed before loading each entry point to exercise polyfill installation order.
const postBaselineMembers: Array<[string, string]> = [
  ['Object', 'assign'],
  ['Object', 'values'],
  ['Object', 'entries'],
  ['Array', 'from'],
  ['Array.prototype', 'includes'],
  ['Array.prototype', 'find'],
  ['Array.prototype', 'findIndex'],
  ['String.prototype', 'includes'],
  ['String.prototype', 'startsWith'],
  ['String.prototype', 'endsWith'],
  ['String.prototype', 'padStart'],
  ['String.prototype', 'padEnd'],
  ['String.prototype', 'repeat'],
];

// The subset src/ts/polyfills.ts installs itself. The rest of the list above is provided by the web
// player bundle, which is always evaluated before a UI can be constructed around a player.
const polyfilledMembers: Array<[string, string]> = [
  ['Object', 'assign'],
  ['Array', 'from'],
];

// Direct framework imports must work without going through main.ts.
const entryPoints = [
  { name: 'UIPreferencesManager', path: '../src/ts/utils/UIPreferencesManager' },
  { name: 'ResumePositionTracker', path: '../src/ts/utils/ResumePositionTracker' },
  { name: 'ShadowDomManager', path: '../src/ts/utils/ShadowDomManager' },
  { name: 'SubtitleSettingsManager', path: '../src/ts/utils/SubtitleSettingsManager' },
  { name: 'TimelineMarkersHandler', path: '../src/ts/utils/TimelineMarkersHandler' },
  { name: 'UIManager', path: '../src/ts/UIManager' },
];

function resolveOwner(ownerPath: string): any {
  // Avoids the Array.prototype methods that this spec removes.
  let owner: any = globalThis;
  const parts = ownerPath.split('.');
  for (let i = 0; i < parts.length && owner != null; i++) {
    owner = owner[parts[i]];
  }
  return owner;
}

/**
 * Runs `observe` with every post-Chromium-38 built-in removed and restores them afterwards. Returns
 * whatever `observe` returned, plus the error it threw, if any.
 */
function onChromium38Baseline<T>(observe: () => T): { result: T | null; error: any } {
  const removed: Array<{ owner: any; member: string; descriptor: PropertyDescriptor }> = [];

  for (let i = 0; i < postBaselineMembers.length; i++) {
    const owner = resolveOwner(postBaselineMembers[i][0]);
    const member = postBaselineMembers[i][1];
    const descriptor = owner == null ? undefined : Object.getOwnPropertyDescriptor(owner, member);

    if (descriptor != null) {
      removed.push({ owner, member, descriptor });
      // Deleted rather than set to undefined: on Chromium 38 the property is absent, and assigning
      // over an existing property would keep its descriptor, hiding whether a polyfill installs
      // itself as enumerable.
      delete owner[member];
    }
  }

  let result: T | null = null;
  let error: any = null;
  try {
    result = observe();
  } catch (e) {
    error = e;
  } finally {
    for (let i = 0; i < removed.length; i++) {
      Object.defineProperty(removed[i].owner, removed[i].member, removed[i].descriptor);
    }
  }

  return { result, error };
}

describe('ES5 baseline for module evaluation', () => {
  it.each(entryPoints)('$name evaluates on the Chromium 38 baseline', ({ path }) => {
    jest.isolateModules(() => {
      const { error } = onChromium38Baseline(() => require(path));
      expect(error).toBeNull();
    });
  });

  it('BrowserUtils resolves the platform on the Chromium 38 baseline', () => {
    // BrowserUtils is a leaf util that consumers can import without src/ts/polyfills.ts, so it stays
    // on the baseline rather than relying on the player bundle having installed its polyfills.
    jest.isolateModules(() => {
      const { error } = onChromium38Baseline(() => {
        const { BrowserUtils } = require('../src/ts/utils/BrowserUtils');
        return [BrowserUtils.isTv, BrowserUtils.isWebOs, BrowserUtils.isMobile];
      });
      expect(error).toBeNull();
    });
  });
});

describe('polyfill installation', () => {
  it.each([
    { name: 'main', path: '../src/ts/main' },
    { name: 'Component', path: '../src/ts/components/Component' },
    ...entryPoints,
  ])('$name installs the polyfills before module evaluation completes', ({ path }) => {
    jest.isolateModules(() => {
      const { result, error } = onChromium38Baseline(() => {
        require(path);
        // Read inside the baseline window: restoring puts the native built-ins back.
        const installed: string[] = [];
        for (let i = 0; i < polyfilledMembers.length; i++) {
          const owner = resolveOwner(polyfilledMembers[i][0]);
          const member = polyfilledMembers[i][1];
          if (typeof owner[member] === 'function') {
            installed.push(polyfilledMembers[i][0] + '.' + member);
          }
        }
        return installed;
      });

      expect(error).toBeNull();
      expect(result).toEqual(polyfilledMembers.map(([ownerPath, member]) => `${ownerPath}.${member}`));
    });
  });

  it('the polyfills behave like the built-ins they replace', () => {
    jest.isolateModules(() => {
      const { result, error } = onChromium38Baseline(() => {
        require('../src/ts/main');

        return {
          objectAssign: Object.assign({ a: 1 }, { b: 2 }, null, { a: 3 }),
          arrayFrom: Array.from({ length: 2, 0: 'a', 1: 'b' } as any),
          arrayFromMapped: Array.from({ length: 2, 0: 1, 1: 2 } as any, (value: number) => value * 2),
          arrayFromEmpty: Array.from({ length: 0 } as any),
        };
      });

      expect(error).toBeNull();
      expect(result).toEqual({
        objectAssign: { a: 3, b: 2 },
        arrayFrom: ['a', 'b'],
        arrayFromMapped: [2, 4],
        arrayFromEmpty: [],
      });
    });
  });
});
