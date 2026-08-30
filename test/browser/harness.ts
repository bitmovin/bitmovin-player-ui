import fs from 'fs';
import path from 'path';
import { expect, Page, test as base } from '@playwright/test';

export { expect };

type PlayerEventHandler = (event: Record<string, unknown>) => void;

interface BrowserTestWindow extends Window {
  bitmovin: {
    player: {
      Player: { prototype: object };
      PlayerEvent: Record<string, string>;
    };
    playerui: {
      UIFactory: {
        buildUI(player: object, config: object): unknown;
      };
    };
  };
  __fire(event: string, data?: object): void;
  __ui?: unknown;
}

const DIST = path.resolve(__dirname, '../../dist');

/**
 * Resolves a file in the built bundle, or explains what to do about it.
 *
 * These tests run against `dist/`, not against `src/`. Without this, running `npx playwright test`
 * on a clean checkout fails with a bare ENOENT from deep inside Playwright.
 */
function distFile(relativePath: string): string {
  const absolute = path.join(DIST, relativePath);
  if (!fs.existsSync(absolute)) {
    throw new Error(
      `${relativePath} is missing from dist/. These tests run against the built bundle: run \`npm run test:browser\`, which builds first.`,
    );
  }
  return absolute;
}

/**
 * The `test` and `expect` these specs must import, instead of importing from `@playwright/test`.
 *
 * It fails a test on any uncaught exception in the page. Without this the suite is one player
 * version bump away from being silently useless: if the stub no longer satisfies the UI, the UI
 * throws mid-build, the DOM ends up partial, and comparing two partial snapshots still passes.
 *
 * Deliberately only `pageerror` (uncaught exceptions), not `console.error`. Console noise is not
 * evidence of a broken layout, and failing on it would make the suite reject unrelated changes.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.stack || error.message));

    await use(page);

    expect(pageErrors, 'the page threw while the UI was running').toEqual([]);
  },
});

export interface MountOptions {
  /**
   * Emulate a host page that ships a global `box-sizing: border-box` reset, the way Bootstrap,
   * Tailwind preflight and most normalize-style setups do. Off by default, because the bare CSS
   * default is the case our own styles have to survive on their own.
   */
  hostReset?: boolean;
  /** Live stream (`true`) or VOD. */
  live?: boolean;
}

/**
 * Builds the real UI, in a real browser, against a stub player.
 *
 * No manifest, no CDN, no video decode: time only advances when a test fires `tick()`. That is
 * what makes these tests fast and deterministic, and it is why they can assert on geometry at all.
 */
export async function mountUi(page: Page, options: MountOptions = {}): Promise<void> {
  const { hostReset = false, live = true } = options;

  await page.setContent(`<!doctype html>
    <html><head><meta charset="utf-8">${
      hostReset ? '<style>html{box-sizing:border-box}*,::after,::before{box-sizing:inherit}</style>' : ''
    }</head>
    <body style="margin:0">
      <!-- position:relative matters. The UI container is absolutely positioned, so without a
           positioned ancestor it sizes against the viewport instead of the player. -->
      <div id="player" style="position:relative;width:1000px;height:562px;background:#000"></div>
    </body></html>`);

  // The player bundle is loaded only for its exported enums (PlayerEvent, ViewMode). No player is
  // instantiated; the UI is driven by the stub below.
  await page.addScriptTag({ path: path.resolve(__dirname, '../../node_modules/bitmovin-player/bitmovinplayer.js') });
  await page.addStyleTag({ path: distFile('css/bitmovinplayer-ui.css') });
  await page.addScriptTag({ path: distFile('js/bitmovinplayer-ui.js') });

  await page.evaluate(
    ({ isLive }) => {
      const browserWindow = window as unknown as BrowserTestWindow;
      const container = document.getElementById('player')!;
      const handlers: Record<string, PlayerEventHandler[]> = {};
      const PlayerEvent = browserWindow.bitmovin.player.PlayerEvent;

      // Monotonic instead of `Date.now()`: browser tests must not depend on wall clock.
      let timestamp = 0;
      const fire = (event: string, data: object = {}) => {
        timestamp += 1000;
        (handlers[event] || []).forEach(cb => cb({ type: event, timestamp, ...data }));
      };
      browserWindow.__fire = fire;

      let playing = true;

      // `PlayerWrapper` copies the player's API by enumerating property names, so a Proxy `get`
      // trap is not enough: the stub has to really own every key. Take the surface from the real
      // Player prototype (no instance needed) so it tracks the player version we build against,
      // then override the handful of members that influence the browser scenarios below.
      const apiNames = Object.getOwnPropertyNames(browserWindow.bitmovin.player.Player.prototype).filter(
        name => name !== 'constructor',
      );
      const noops: Record<string, unknown> = {};
      apiNames.forEach(name => {
        // Collection getters must answer with an array: the UI iterates their result directly.
        const returnsList = /^(getAvailable|getSupported)/.test(name);
        noops[name] = returnsList ? (): never[] => [] : (): undefined => undefined;
      });

      const player = {
        ...noops,
        exports: browserWindow.bitmovin.player,
        getContainer: () => container,
        getConfig: () => ({}),
        getSource: () => ({}),
        isLive: () => isLive,
        getDuration: () => (isLive ? Infinity : 600),
        getCurrentTime: () => 0,
        getTimeShift: () => 0,
        getMaxTimeShift: () => (isLive ? -100 : 0),
        getSeekableRange: () => ({ start: 0, end: isLive ? 100 : 600 }),
        getVolume: () => 100,
        isMuted: () => false,
        isPlaying: () => playing,
        isPaused: () => !playing,
        isStalled: () => false,
        isCasting: () => false,
        isAirplayActive: () => false,
        isAirplayAvailable: () => false,
        isViewModeAvailable: () => false,
        hasEnded: () => false,
        getViewMode: () => 'inline',
        getPlayerType: () => 'html5',
        getStreamType: () => 'hls',
        // Quality/track getters are dereferenced without a null check by the settings panels.
        getAudio: () => ({ id: 'audio-1', label: 'Audio' }),
        getVideoQuality: () => ({ id: 'video-1', label: 'Auto' }),
        getAudioQuality: () => ({ id: 'audio-q-1', label: 'Auto' }),
        getAvailableAudio: (): never[] => [],
        getVideoBufferLength: () => 0,
        getAudioBufferLength: () => 0,
        getThumbnail: (): null => null,
        subtitles: { list: (): never[] => [] },
        ads: { isLinearAdActive: () => false, getActiveAd: (): null => null },
        on: (event: string, cb: PlayerEventHandler) => {
          (handlers[event] = handlers[event] || []).push(cb);
        },
        off: (event: string, cb: PlayerEventHandler) => {
          handlers[event] = (handlers[event] || []).filter(h => h !== cb);
        },
        seek: () => true,
        timeShift: (): void => undefined,
        play: (issuer = 'api') => {
          playing = true;
          fire(PlayerEvent.Play, { time: 0, issuer });
          fire(PlayerEvent.Playing, { time: 0, issuer });
          return Promise.resolve();
        },
        pause: (issuer = 'api') => {
          playing = false;
          fire(PlayerEvent.Paused, { time: 0, issuer });
        },
        mute: (): void => undefined,
        unmute: (): void => undefined,
        setVolume: (): void => undefined,
        setAudio: (): void => undefined,
      };

      browserWindow.__ui = browserWindow.bitmovin.playerui.UIFactory.buildUI(player, {
        // Auto-hide would leave the control bar at opacity 0. It stays measurable either way, but
        // an invisible UI makes `--ui` and `--headed` useless for anyone debugging a layout test.
        componentConfigOverrides: { UIContainer: { hideDelay: -1 } },
      });
    },
    { isLive: live },
  );

  // Everything below measures the DOM, so an empty or half-built DOM would make every assertion
  // pass vacuously. Assert the shape we expect to measure before any test gets to look at it.
  const mounted = await page.evaluate(() => {
    const containers = Array.from(document.querySelectorAll('.bmpui-ui-uicontainer'));
    const seekBar = document.querySelector('.bmpui-ui-controlbar .bmpui-ui-seekbar');
    // Every variant except the main one carries a marker class, so their absence identifies it.
    const otherVariants = ['ads', 'smallscreen', 'tv', 'cast-receiver'].map(name => `bmpui-ui-${name}`);
    return {
      uiVariants: containers.length,
      variantMarkers: containers.flatMap(c => otherVariants.filter(marker => c.classList.contains(marker))),
      controlBars: document.querySelectorAll('.bmpui-ui-controlbar').length,
      controlRows: document.querySelectorAll('.bmpui-controlbar-top, .bmpui-controlbar-bottom').length,
      seekBarWidth: seekBar ? (seekBar as HTMLElement).offsetWidth : 0,
    };
  });

  // Exactly one variant: `buildUI` registers seven, but only the resolved one is added to the DOM.
  // More than one means a switch left the previous variant behind; zero means nothing mounted.
  expect(mounted.uiVariants, 'exactly one UI variant should be mounted').toBe(1);
  expect(mounted.variantMarkers, 'the main layout should be the resolved variant').toEqual([]);
  expect(mounted.controlBars, 'the mounted variant should contain exactly one control bar').toBe(1);
  expect(mounted.controlRows, 'the control bar should contain at least one row to measure').toBeGreaterThan(0);
  expect(mounted.seekBarWidth, 'the UI has to actually lay out, or nothing below asserts anything').toBeGreaterThan(0);
}

/**
 * Replays the player's clock, without any actual playback.
 *
 * The label renders from `player.getCurrentTime()`, not from the event payload, so the stub holds
 * the displayed text constant across ticks. That is on purpose: it separates size changes caused by
 * a component measuring itself from size changes legitimately caused by longer text.
 */
export async function tick(page: Page, times: number): Promise<void> {
  await page.evaluate(count => {
    const browserWindow = window as unknown as BrowserTestWindow;
    const PlayerEvent = browserWindow.bitmovin.player.PlayerEvent;
    for (let i = 0; i < count; i++) {
      browserWindow.__fire(PlayerEvent.TimeChanged, { time: 0 });
    }
  }, times);
}

/**
 * Width of every element inside the control bar, keyed by DOM position and class.
 *
 * Measures all descendants, not just the rows: the rows are full-width by construction, so
 * comparing only those would pass no matter how badly the controls inside them resized.
 *
 * Uses `offsetWidth` deliberately, where {@link controlBarFlexRows} uses `getBoundingClientRect()`.
 * This is an exact-equality snapshot of two measurements taken from the same layout, so integer
 * widths are all it needs; a comparison between two *different* quantities needs the sub-pixel
 * value instead. Do not unify them without re-checking what each assertion can still detect.
 */
export async function controlBarWidths(page: Page): Promise<Record<string, number>> {
  return page.evaluate(() => {
    const widths: Record<string, number> = {};
    const bar = document.querySelector('.bmpui-ui-controlbar');
    // Throw rather than return `{}`: an empty result compares equal to the next empty result, so a
    // missing control bar would turn a stability assertion into a test that always passes.
    if (!bar) throw new Error('no .bmpui-ui-controlbar in the document');

    const walk = (element: Element, pathPrefix: string) => {
      Array.from(element.children).forEach((child, index) => {
        const cls = child.classList[0] || child.tagName.toLowerCase();
        const key = `${pathPrefix}${index}:${cls}`;
        widths[key] = (child as HTMLElement).offsetWidth;
        walk(child, `${key} > `);
      });
    };
    walk(bar, '');
    return widths;
  });
}

export interface FlexRow {
  /** First CSS class of the flex container, enough to identify it in a failure message. */
  row: string;
  /** Total width its laid-out children occupy, margins included. */
  used: number;
  /** Content-box width available to them. */
  available: number;
}

/**
 * Every non-wrapping horizontal flex container inside the control bar, with the space its children
 * occupy and the space it has.
 *
 * Explicitly *not* `.bmpui-controlbar-top` / `.bmpui-controlbar-bottom`: those rows hold a single
 * full-width `container-wrapper` child, so summing their children can never exceed them no matter
 * how badly the controls inside resize. The flex containers that actually distribute space are one
 * level further down, and buttons, the seek bar and the volume slider are flex rows of their own.
 *
 * Measured with `getBoundingClientRect()` rather than `offsetWidth`, because `offsetWidth` rounds
 * to whole pixels and the rounding alone can push a row a pixel over its parent.
 */
export async function controlBarFlexRows(page: Page): Promise<FlexRow[]> {
  return page.evaluate(() => {
    const bar = document.querySelector('.bmpui-ui-controlbar');
    if (!bar) throw new Error('no .bmpui-ui-controlbar in the document');

    const rows: FlexRow[] = [];

    // A `NaN` anywhere in the arithmetic below makes every `used > available` comparison false, so
    // an unparseable length would silently turn this into a test that cannot fail.
    const px = (value: string) => {
      const parsed = parseFloat(value);
      if (!Number.isFinite(parsed)) throw new Error(`expected a pixel length, got "${value}"`);
      return parsed;
    };

    // `column-gap` computes to the keyword `normal` when unset, which flexbox resolves to zero.
    // Every other value is a length, and an unexpected one must still be loud rather than NaN.
    const gap = (value: string) => (value === 'normal' ? 0 : px(value));

    const walk = (element: Element) => {
      const style = getComputedStyle(element);
      const isHorizontalFlex =
        (style.display === 'flex' || style.display === 'inline-flex') &&
        style.flexDirection.startsWith('row') &&
        style.flexWrap === 'nowrap';

      if (isHorizontalFlex) {
        // Out-of-flow children (the seek bar label, tooltips) are positioned against the row and are
        // supposed to be able to exceed it. Only in-flow children compete for the row's width.
        const inFlow = Array.from(element.children).filter(child => {
          const childStyle = getComputedStyle(child);
          return childStyle.display !== 'none' && childStyle.position !== 'absolute' && childStyle.position !== 'fixed';
        });

        if (inFlow.length > 0) {
          // Gaps occupy the row just as the children do. Omitting them understates `used` by
          // `(children - 1) * gap`, which is a window in which a row can overflow and still pass.
          const used =
            inFlow.reduce((sum, child) => {
              const childStyle = getComputedStyle(child);
              return sum + child.getBoundingClientRect().width + px(childStyle.marginLeft) + px(childStyle.marginRight);
            }, 0) +
            (inFlow.length - 1) * gap(style.columnGap);

          // Children lay out in the content box, so padding is not theirs to use.
          const available =
            element.getBoundingClientRect().width -
            px(style.paddingLeft) -
            px(style.paddingRight) -
            px(style.borderLeftWidth) -
            px(style.borderRightWidth);

          rows.push({ row: element.classList[0] || element.tagName.toLowerCase(), used, available });
        }
      }

      Array.from(element.children).forEach(walk);
    };

    walk(bar);
    return rows;
  });
}
