import fs from 'fs';
import path from 'path';
import { expect, Page, test as base } from '@playwright/test';
import type { SubtitleCueEvent } from 'bitmovin-player';

export { expect };

type PlayerEventHandler = (event: Record<string, unknown>) => void;

/**
 * Subtitle appearance settings, named as the subtitle settings panel stores them.
 *
 * Colors and their opacities are applied as a pair, so setting a color without its opacity
 * leaves the overlay unstyled.
 */
export interface SubtitleSettings {
  fontColor?: string;
  fontOpacity?: string;
  fontFamily?: string;
  fontSize?: string;
  fontStyle?: string;
  characterEdge?: string;
  characterEdgeColor?: string;
  backgroundColor?: string;
  backgroundOpacity?: string;
  windowColor?: string;
  windowOpacity?: string;
}

/** The part of the built UI the browser scenarios drive directly. */
interface UiHandle {
  getSubtitleSettingsManager(): Record<keyof SubtitleSettings, { value: string }>;
}

interface BrowserTestWindow extends Window {
  bitmovin: {
    player: {
      Player: { prototype: object };
      PlayerEvent: Record<string, string>;
    };
    playerui: {
      UIFactory: {
        buildUI(player: object, config: object): UiHandle;
        buildSmallScreenUI(player: object, config: object): UiHandle;
        buildTvUI(player: object, config: object): UiHandle;
      };
      i18n: { setLanguage(language: string): void };
    };
  };
  __fire(event: string, data?: object): void;
  __setSourceLoaded(sourceLoaded: boolean): void;
  __setCastAndAirPlayAvailable(available: boolean): void;
  __pausePlayback(): void;
  __ui?: UiHandle;
  /** Counts invocations of the active pause ad's `clickThroughUrlOpened`. See {@link MountedUi}. */
  __clickThroughCount?: number;
  /** Calls of `window.open`, which the harness records instead of opening, unless mounted with `realWindowOpen`. */
  __openedWindows: OpenedWindow[];
  /** Id of the pause ad the stub considers active, so `player.ads.skip()` can end that ad. */
  __activePauseAdId?: string;
  __currentTime?: number;
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
 * Rewrites a stylesheet the way an engine without CSS `max()` reads it.
 *
 * Such an engine skips `@supports` blocks that test for `max()`, and drops a declaration that uses `max()` while
 * parsing, so an earlier declaration of the same property applies instead. A declaration that also uses `var()`
 * is only validated after substituting the variables, though: it is kept while parsing, and once found invalid
 * its property falls back to its initial value, as if set to `unset`.
 */
function withoutCssMax(css: string): string {
  return css
    .replace(/@supports[^{]*\bmax\([^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '')
    .replace(/([\w-]+)\s*:([^;{}]*\bmax\([^;{}]*)(;|(?=\}))/g, (_declaration, property: string, value: string, end) =>
      /\bvar\(/.test(value) ? `${property}: unset${end}` : '',
    );
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
  factory?: 'default' | 'smallScreen' | 'tv';
  /**
   * Remove the `ShadowRoot` global before the UI loads, emulating engines without Shadow DOM support
   * such as the PS4 browser.
   */
  withoutShadowRoot?: boolean;
  /** Use a mobile user agent so the UI factory selects touch controls. */
  mobile?: boolean;
  /** UI control auto-hide delay. Defaults to disabled so layout tests stay visible while debugging. */
  hideDelay?: number;
  /** Available video qualities for scenarios that need a quality Settings row. */
  videoQualities?: { id: string; label: string }[];
  /**
   * Source metadata the UI renders in the title bar. Without it the metadata labels stay empty and
   * occupy no space, so a scenario about title-bar layout has to supply it.
   */
  metadata?: { title?: string; description?: string };
  /**
   * Custom translations, keyed by language and vocabulary key, for scenarios that depend on the
   * length or language of UI texts. They are merged into the built-in vocabularies.
   */
  vocabularies?: Record<string, Record<string, string>>;
  /**
   * Load the stylesheet the way an engine without CSS `max()` reads it, such as Chromium before 79 on older
   * webOS and Tizen TVs. See {@link withoutCssMax}.
   */
  withoutCssMax?: boolean;
  /**
   * Keep the browser's own `window.open`, so click-throughs open real popups. By default the harness records
   * the calls instead, see {@link BrowserPlayerController.openedWindows}. A scenario using this must route
   * every URL it opens, so that no request leaves the machine.
   */
  realWindowOpen?: boolean;
}

export interface PauseAdOptions {
  /**
   * Click-through destination carried by the creative. Omitted means a creative without one, which
   * the UI must leave fully transparent to pointer input.
   */
  clickThroughUrl?: string;
}

/** The arguments of a `window.open` call. */
export interface OpenedWindow {
  url: string;
  target?: string;
  features?: string;
}

/** A subtitle cue, as the player hands it to the UI, minus the fields the harness assigns. */
export type SubtitleCue = Partial<Omit<SubtitleCueEvent, 'type' | 'timestamp' | 'start' | 'end'>>;

export interface BrowserPlayerController {
  /**
   * Replays deterministic player clock updates without actual playback.
   *
   * Always reports time 0, and `getCurrentTime()` only changes through `seek()`, so layout tests can
   * separate self-measurement bugs from legitimate size changes caused by longer time-label content.
   */
  tick(times?: number): Promise<void>;

  /**
   * Pauses playback if needed, then starts a non-linear pause ad.
   *
   * The ad carries the producer-assigned `clickThroughUrlOpened` callback the UI invokes when the
   * user clicks the creative; {@link BrowserPlayerController.clickThroughCount} reports how often it
   * ran. The stub also remembers the ad as active, so `player.ads.skip()` ends this ad.
   */
  startPauseAd(options?: PauseAdOptions): Promise<void>;

  /** Ends a pause ad. */
  finishPauseAd(id?: string): Promise<void>;

  /**
   * Starts a linear ad that requests the UI, which makes the UI manager switch to its ads variant.
   *
   * Only emits the event the UI manager resolves its variant from. The stub still reports no active
   * linear ad, because nothing in the browser scenarios reads it.
   */
  startLinearAd(): Promise<void>;

  /** Emits a subtitle cue the way the player does while a subtitle track is active. */
  enterCue(cue: SubtitleCue): Promise<void>;

  /** Makes Cast and AirPlay available and emits the events that make the UI show their buttons. */
  makeCastAndAirPlayAvailable(): Promise<void>;

  /** Emits the source-unloaded lifecycle event. */
  unloadSource(): Promise<void>;

  /** Emits the source-loaded lifecycle event. */
  loadSource(): Promise<void>;

  /** Resizes the player viewport and emits the event that makes the UI resolve its active variant again. */
  resize(width: number): Promise<void>;

  /** How often the active pause ad's click-through has been reported since it started. */
  clickThroughCount(): Promise<number>;

  /** URLs the UI passed to `window.open` since mounting. */
  openedUrls(): Promise<string[]>;

  /** All arguments the UI passed to `window.open` since mounting. */
  openedWindows(): Promise<OpenedWindow[]>;

  /** Whether the stub player still considers a pause ad active. */
  pauseAdActive(): Promise<boolean>;

  /** Current playback position, including seeks made through the UI. */
  currentTime(): Promise<number>;
}

export interface MountedUi {
  player: BrowserPlayerController;

  /** Applies subtitle settings through the manager the settings panel writes to. */
  applySubtitleSettings(settings: SubtitleSettings): Promise<void>;

  /** Switches the UI language at runtime, the way an integrator or the subtitle language adaptation does. */
  setLanguage(language: string): Promise<void>;
}

/**
 * Builds the real UI, in a real browser, against a stub player.
 *
 * No manifest, no CDN, no video decode: time only advances when a test calls `ui.player.tick()`. That is
 * what makes these tests fast and deterministic, and it is why they can assert on geometry at all.
 */
export async function mountUi(page: Page, options: MountOptions = {}): Promise<MountedUi> {
  const {
    hostReset = false,
    live = true,
    factory = 'default',
    metadata = {},
    mobile = false,
    withoutShadowRoot = false,
    hideDelay = -1,
    videoQualities = [],
    vocabularies,
    withoutCssMax: emulateWithoutCssMax = false,
    realWindowOpen = false,
  } = options;

  await page.setContent(`<!doctype html>
    <html><head><meta charset="utf-8">${
      hostReset ? '<style>html{box-sizing:border-box}*,::after,::before{box-sizing:inherit}</style>' : ''
    }</head>
    <body style="margin:0">
      <!-- position:relative matters. The UI container is absolutely positioned, so without a
           positioned ancestor it sizes against the viewport instead of the player. -->
      <div id="player" style="position:relative;width:1000px;height:562px;background:#000"></div>
    </body></html>`);

  if (mobile) {
    const mobileUserAgent = `${await page.evaluate(() => navigator.userAgent)} Mobi`;
    await page.evaluate(userAgent => {
      Object.defineProperty(navigator, 'userAgent', { configurable: true, value: userAgent });
    }, mobileUserAgent);
  }

  // The player bundle is loaded only for its exported enums (PlayerEvent, ViewMode). No player is
  // instantiated; the UI is driven by the stub below.
  await page.addScriptTag({ path: path.resolve(__dirname, '../../node_modules/bitmovin-player/bitmovinplayer.js') });
  if (withoutShadowRoot) {
    await page.evaluate(() => {
      delete (window as { ShadowRoot?: unknown }).ShadowRoot;
    });
  }
  const stylesheet = distFile('css/bitmovinplayer-ui.css');
  await page.addStyleTag(
    emulateWithoutCssMax ? { content: withoutCssMax(fs.readFileSync(stylesheet, 'utf8')) } : { path: stylesheet },
  );
  await page.addScriptTag({ path: distFile('js/bitmovinplayer-ui.js') });

  await page.evaluate(
    ({ isLive, uiFactory, uiMetadata, availableVideoQualities, hideDelay, customVocabularies, recordWindowOpen }) => {
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

      // Record click-through navigation instead of opening real popups.
      browserWindow.__openedWindows = [];
      if (recordWindowOpen) {
        window.open = (url?: string | URL, target?: string, features?: string) => {
          browserWindow.__openedWindows.push({ url: String(url), target, features });
          return null;
        };
      }

      let playing = true;
      let sourceLoaded = true;
      let castAndAirPlayAvailable = false;
      browserWindow.__setCastAndAirPlayAvailable = available => {
        castAndAirPlayAvailable = available;
      };
      browserWindow.__setSourceLoaded = loaded => {
        sourceLoaded = loaded;
      };

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
        getSource: () => (sourceLoaded ? {} : null),
        isLive: () => isLive,
        getDuration: () => (isLive ? Infinity : 600),
        getCurrentTime: () => browserWindow.__currentTime || 0,
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
        isAirplayAvailable: () => castAndAirPlayAvailable,
        isCastAvailable: () => castAndAirPlayAvailable,
        isViewModeAvailable: () => false,
        hasEnded: () => false,
        getViewMode: () => 'inline',
        getPlayerType: () => 'html5',
        getStreamType: () => 'hls',
        // Quality/track getters are dereferenced without a null check by the settings panels.
        getAudio: () => ({ id: 'audio-1', label: 'Audio' }),
        getVideoQuality: () => ({ id: 'video-1', label: 'Auto' }),
        getAvailableVideoQualities: () => availableVideoQualities,
        getAudioQuality: () => ({ id: 'audio-q-1', label: 'Auto' }),
        getAvailableAudio: (): never[] => [],
        getVideoBufferLength: () => 0,
        getAudioBufferLength: () => 0,
        getThumbnail: (): null => null,
        subtitles: { list: (): never[] => [] },
        ads: {
          isLinearAdActive: () => false,
          getActiveAd: (): null => null,
          // The real player ends the active ad, which is what the pause-ad dismiss button relies
          // on: it calls `ads.skip()` and expects the ad's terminal event to follow.
          skip: () => {
            const activeAdId = browserWindow.__activePauseAdId;
            if (activeAdId) {
              browserWindow.__activePauseAdId = undefined;
              fire('nonlinearadskipped', { ad: { id: activeAdId } });
            }
          },
        },
        on: (event: string, cb: PlayerEventHandler) => {
          (handlers[event] = handlers[event] || []).push(cb);
        },
        off: (event: string, cb: PlayerEventHandler) => {
          handlers[event] = (handlers[event] || []).filter(h => h !== cb);
        },
        seek: (time: number) => {
          fire(PlayerEvent.Seek, { position: browserWindow.__currentTime || 0, seekTarget: time });
          browserWindow.__currentTime = time;
          fire(PlayerEvent.TimeChanged, { time });
          fire(PlayerEvent.Seeked);
          return true;
        },
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
      browserWindow.__pausePlayback = () => {
        if (playing) {
          player.pause();
        }
      };

      const uiConfig = {
        // Auto-hide would leave the control bar at opacity 0. It stays measurable either way, but
        // an invisible UI makes `--ui` and `--headed` useless for anyone debugging a layout test.
        componentConfigOverrides: { UIContainer: { hideDelay } },
        metadata: uiMetadata,
        ...(customVocabularies ? { localization: { language: 'en', vocabularies: customVocabularies } } : {}),
      };
      switch (uiFactory) {
        case 'default':
          browserWindow.__ui = browserWindow.bitmovin.playerui.UIFactory.buildUI(player, uiConfig);
          break;
        case 'smallScreen':
          browserWindow.__ui = browserWindow.bitmovin.playerui.UIFactory.buildSmallScreenUI(player, uiConfig);
          break;
        case 'tv':
          browserWindow.__ui = browserWindow.bitmovin.playerui.UIFactory.buildTvUI(player, uiConfig);
          break;
        default: {
          const unsupportedFactory: never = uiFactory;
          throw new Error(`unsupported UI factory: ${String(unsupportedFactory)}`);
        }
      }
    },
    {
      isLive: live,
      uiFactory: factory,
      uiMetadata: metadata,
      availableVideoQualities: videoQualities,
      hideDelay,
      customVocabularies: vocabularies,
      recordWindowOpen: !realWindowOpen,
    },
  );

  await expect(page.locator('.bmpui-ui-uicontainer'), 'exactly one UI variant should be mounted').toHaveCount(1);

  let cueStart = 0;

  return {
    player: {
      startPauseAd: async ({ clickThroughUrl }: PauseAdOptions = {}) => {
        await page.evaluate(url => {
          const browserWindow = window as unknown as BrowserTestWindow;
          // A pause ad only starts once playback is paused.
          browserWindow.__pausePlayback();
          browserWindow.__clickThroughCount = 0;
          browserWindow.__activePauseAdId = 'pause-ad-1';
          browserWindow.__fire('nonlinearadstarted', {
            ad: {
              id: 'pause-ad-1',
              clickThroughUrl: url,
              clickThroughUrlOpened: () => {
                browserWindow.__clickThroughCount = (browserWindow.__clickThroughCount || 0) + 1;
              },
            },
          });
        }, clickThroughUrl);
      },
      finishPauseAd: async (id = 'pause-ad-1') => {
        await page.evaluate(adId => {
          const browserWindow = window as unknown as BrowserTestWindow;
          // A terminal event for a different ad leaves this one active, exactly as it does in the UI.
          if (browserWindow.__activePauseAdId === adId) {
            browserWindow.__activePauseAdId = undefined;
          }
          browserWindow.__fire('nonlinearadfinished', { ad: { id: adId } });
        }, id);
      },
      startLinearAd: async () => {
        await page.evaluate(() => {
          const browserWindow = window as unknown as BrowserTestWindow;
          browserWindow.__fire(browserWindow.bitmovin.player.PlayerEvent.AdStarted, {
            ad: { id: 'linear-ad-1', isLinear: true, uiConfig: { requestsUi: true } },
          });
        });
      },
      enterCue: async (cue: SubtitleCue) => {
        // The overlay identifies a cue by its start time and text, so consecutive cues need
        // distinct start times to be shown side by side instead of replacing one another.
        const start = cueStart;
        cueStart += 1;
        await page.evaluate(
          ({ entered, cueStartTime }) => {
            const browserWindow = window as unknown as BrowserTestWindow;
            browserWindow.__fire(browserWindow.bitmovin.player.PlayerEvent.CueEnter, {
              start: cueStartTime,
              end: cueStartTime + 1,
              text: '',
              ...entered,
            });
          },
          { entered: cue, cueStartTime: start },
        );
      },
      makeCastAndAirPlayAvailable: async () => {
        await page.evaluate(() => {
          const browserWindow = window as unknown as BrowserTestWindow;
          const PlayerEvent = browserWindow.bitmovin.player.PlayerEvent;
          browserWindow.__setCastAndAirPlayAvailable(true);
          browserWindow.__fire(PlayerEvent.CastAvailable);
          browserWindow.__fire(PlayerEvent.AirplayAvailable);
        });
      },
      unloadSource: async () => {
        await page.evaluate(() => {
          const browserWindow = window as unknown as BrowserTestWindow;
          browserWindow.__setSourceLoaded(false);
          browserWindow.__fire(browserWindow.bitmovin.player.PlayerEvent.SourceUnloaded);
        });
      },
      loadSource: async () => {
        await page.evaluate(() => {
          const browserWindow = window as unknown as BrowserTestWindow;
          browserWindow.__setSourceLoaded(true);
          browserWindow.__fire(browserWindow.bitmovin.player.PlayerEvent.SourceLoaded);
        });
      },
      clickThroughCount: async () => {
        return page.evaluate(() => (window as unknown as BrowserTestWindow).__clickThroughCount || 0);
      },
      openedUrls: async () => {
        return page.evaluate(() => (window as unknown as BrowserTestWindow).__openedWindows.map(opened => opened.url));
      },
      openedWindows: async () => {
        return page.evaluate(() => (window as unknown as BrowserTestWindow).__openedWindows);
      },
      pauseAdActive: async () => {
        return page.evaluate(() => Boolean((window as unknown as BrowserTestWindow).__activePauseAdId));
      },
      currentTime: async () => {
        return page.evaluate(() => (window as unknown as BrowserTestWindow).__currentTime || 0);
      },
      resize: async (width: number) => {
        await page.setViewportSize({ width, height: 720 });
        await page.evaluate(playerWidth => {
          const browserWindow = window as unknown as BrowserTestWindow;
          const PlayerEvent = browserWindow.bitmovin.player.PlayerEvent;
          document.getElementById('player')!.style.width = `${playerWidth}px`;
          browserWindow.__fire(PlayerEvent.PlayerResized, { width: `${playerWidth}px`, height: '720px' });
        }, width);
      },
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
    applySubtitleSettings: async settings => {
      await page.evaluate(applied => {
        const manager = (window as unknown as BrowserTestWindow).__ui!.getSubtitleSettingsManager();
        Object.entries(applied).forEach(([setting, value]) => {
          manager[setting as keyof SubtitleSettings].value = value;
        });
      }, settings);
    },
    setLanguage: async language => {
      await page.evaluate(newLanguage => {
        (window as unknown as BrowserTestWindow).bitmovin.playerui.i18n.setLanguage(newLanguage);
      }, language);
    },
  };
}
