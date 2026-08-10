import path from 'path';
import { Page } from '@playwright/test';

const DIST = path.resolve(__dirname, '../../dist');

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
  await page.addStyleTag({ path: path.join(DIST, 'css/bitmovinplayer-ui.css') });
  await page.addScriptTag({ path: path.join(DIST, 'js/bitmovinplayer-ui.js') });

  await page.evaluate(
    ({ isLive }) => {
      const container = document.getElementById('player')!;
      const handlers: Record<string, Function[]> = {};

      // `PlayerWrapper` copies the player's API by enumerating property names, so a Proxy `get`
      // trap is not enough: the stub has to really own every key. Take the surface from the real
      // Player prototype (no instance needed) so it tracks the player version we build against,
      // then override the handful of members that actually influence layout.
      const apiNames = Object.getOwnPropertyNames((window as any).bitmovin.player.Player.prototype).filter(
        name => name !== 'constructor',
      );
      const noops: Record<string, unknown> = {};
      apiNames.forEach(name => {
        // Collection getters must answer with an array: the UI iterates their result directly.
        const returnsList = /^(getAvailable|getSupported)/.test(name);
        noops[name] = returnsList ? () => [] : () => undefined;
      });

      const player = {
        ...noops,
        exports: (window as any).bitmovin.player,
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
        isPlaying: () => true,
        isPaused: () => false,
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
        getAvailableAudio: () => [],
        getVideoBufferLength: () => 0,
        getAudioBufferLength: () => 0,
        getThumbnail: () => null,
        subtitles: { list: () => [] },
        ads: { isLinearAdActive: () => false, getActiveAd: () => null },
        on: (event: string, cb: Function) => {
          (handlers[event] = handlers[event] || []).push(cb);
        },
        off: (event: string, cb: Function) => {
          handlers[event] = (handlers[event] || []).filter(h => h !== cb);
        },
        seek: () => true,
        timeShift: () => undefined,
        play: () => Promise.resolve(),
        pause: () => undefined,
        mute: () => undefined,
        unmute: () => undefined,
        setVolume: () => undefined,
        setAudio: () => undefined,
      };

      (window as any).__fire = (event: string, data: object = {}) => {
        (handlers[event] || []).forEach(cb => cb({ type: event, timestamp: Date.now(), ...data }));
      };

      (window as any).__ui = (window as any).bitmovin.playerui.UIFactory.buildUI(player as any, {
        // Auto-hide would leave the control bar at opacity 0. It stays measurable either way, but
        // an invisible UI makes `--ui` and `--headed` useless for anyone debugging a layout test.
        componentConfigOverrides: { UIContainer: { hideDelay: -1 } },
      });
    },
    { isLive: live },
  );
}

/** Advances the clock the way the player would, without any actual playback. */
export async function tick(page: Page, times: number): Promise<void> {
  await page.evaluate(count => {
    const PlayerEvent = (window as any).bitmovin.player.PlayerEvent;
    for (let i = 0; i < count; i++) {
      (window as any).__fire(PlayerEvent.TimeChanged, { time: i });
    }
  }, times);
}

/**
 * Width of every element inside the control bar, keyed by DOM position and class.
 *
 * Measures all descendants, not just the rows: the rows are full-width by construction, so
 * comparing only those would pass no matter how badly the controls inside them resized.
 */
export async function controlBarWidths(page: Page): Promise<Record<string, number>> {
  return page.evaluate(() => {
    const widths: Record<string, number> = {};
    const bar = document.querySelector('.bmpui-ui-controlbar');
    if (!bar) return widths;

    const walk = (element: Element, pathPrefix: string) => {
      Array.from(element.children).forEach((child, index) => {
        const cls = child.className.split(' ')[0] || child.tagName.toLowerCase();
        const key = `${pathPrefix}${index}:${cls}`;
        widths[key] = (child as HTMLElement).offsetWidth;
        walk(child, `${key} > `);
      });
    };
    walk(bar, '');
    return widths;
  });
}
