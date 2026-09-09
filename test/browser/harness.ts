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
        buildSmallScreenUI(player: object, config: object): unknown;
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
  /** UI factory to exercise. Add another value only when a browser scenario needs it. */
  factory?: 'default' | 'smallScreen';
}

export interface BrowserPlayerController {
  /**
   * Replays deterministic player clock updates without actual playback.
   *
   * The stub holds `getCurrentTime()` constant so layout tests can separate self-measurement bugs
   * from legitimate size changes caused by longer time-label content.
   */
  tick(times?: number): Promise<void>;
}

export interface MountedUi {
  player: BrowserPlayerController;
}

/**
 * Builds the real UI, in a real browser, against a stub player.
 *
 * No manifest, no CDN, no video decode: time only advances when a test calls `ui.player.tick()`. That is
 * what makes these tests fast and deterministic, and it is why they can assert on geometry at all.
 */
export async function mountUi(page: Page, options: MountOptions = {}): Promise<MountedUi> {
  const { hostReset = false, live = true, factory = 'default' } = options;

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
    ({ isLive, uiFactory }) => {
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

      const uiConfig = {
        // Auto-hide would leave the control bar at opacity 0. It stays measurable either way, but
        // an invisible UI makes `--ui` and `--headed` useless for anyone debugging a layout test.
        componentConfigOverrides: { UIContainer: { hideDelay: -1 } },
      };
      switch (uiFactory) {
        case 'default':
          browserWindow.__ui = browserWindow.bitmovin.playerui.UIFactory.buildUI(player, uiConfig);
          break;
        case 'smallScreen':
          browserWindow.__ui = browserWindow.bitmovin.playerui.UIFactory.buildSmallScreenUI(player, uiConfig);
          break;
        default: {
          const unsupportedFactory: never = uiFactory;
          throw new Error(`unsupported UI factory: ${String(unsupportedFactory)}`);
        }
      }
    },
    { isLive: live, uiFactory: factory },
  );

  await expect(page.locator('.bmpui-ui-uicontainer'), 'exactly one UI variant should be mounted').toHaveCount(1);

  return {
    player: {
      tick: async (times = 1) => {
        await page.evaluate(count => {
          const browserWindow = window as unknown as BrowserTestWindow;
          const PlayerEvent = browserWindow.bitmovin.player.PlayerEvent;
          for (let i = 0; i < count; i++) {
            browserWindow.__fire(PlayerEvent.TimeChanged, { time: 0 });
          }
        }, times);
      },
    },
  };
}
