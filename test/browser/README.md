# Browser integration tests

```bash
npx playwright install chromium   # once per machine, after npm ci
npm run test:browser              # builds, type-checks, then runs Playwright
npx playwright test               # only if dist/ is already current
```

`npm ci` installs the Playwright _runner_, not the browser it drives. CI installs and caches the
browser keyed on the exact Playwright version.

The third command is a footgun worth naming: these tests load `dist/`, not `src/`. Running it after
editing SCSS or TypeScript without rebuilding tests the previous build. A missing `dist/` fails with
an explanatory message; a stale build cannot be detected, so rebuild before trusting a surprising
result.

## Choosing a test level

| Test level                            | Use it for                                                                                    |
| ------------------------------------- | --------------------------------------------------------------------------------------------- |
| Jest                                  | pure logic and component behavior that jsdom represents faithfully                            |
| Deterministic browser integration     | layout, computed styles, input/focus, browser APIs, Shadow DOM, rendered markup and UI wiring |
| Full-player browser system            | real Player playback, streams, networking and decoding                                        |
| Manual/platform-specific verification | mobile SDK bridges and WebView/native integration                                             |

Playwright is the browser automation tool, not the test level: both browser integration and
full-player system tests can use it. The tests in this directory are deterministic browser
integration tests, not full end-to-end or system tests. They exercise the built UI and CSS in a
real browser, but deliberately replace the external Player/media system with a deterministic stub.

## How the harness works

`harness.ts` loads the built bundle into a blank page and builds the real UI against a stub player.
There is no manifest, CDN, or video decode. The stub starts in a known playing state; `play()` and
`pause()` update that state and emit Player events synchronously. The clock only advances when a
test calls `tick()`, so browser scenarios are repeatable without sleeps.

The stub takes its API surface from the real `Player.prototype`, so it tracks the Player version the
repo builds against instead of maintaining a parallel method list. Members needed by browser
scenarios are implemented explicitly; everything else answers as a no-op.

Import both `test` and `expect` from `./harness`, not from `@playwright/test`. The harness fails a
test on any uncaught page exception, so Player API drift cannot leave a half-built DOM that quietly
passes assertions.

## Writing tests

- Arrange the mounted UI and initial state, act through the UI or a deterministic Player event,
  then assert the user-observable result. Use Arrange–Act–Assert comments only when they add clarity.
- Prefer role- and label-based locators plus web-first assertions for interaction tests. See
  `playback-toggle.pw.ts` for a click → Player event → accessible-name round trip.
- Use CSS selectors and `page.evaluate()` only when the subject is geometry or another browser
  property without a semantic locator.
- Mount a fresh UI per test. Do not share mutable page or stub state.
- Never sleep and never add retries. Wait for observable UI state through Playwright assertions;
  drive Player state through deterministic events.
- Break the behavior a new test protects, watch the expected assertion fail, then restore it.

## Layout tests

Jest runs in jsdom, which does no layout. `offsetWidth` and `getBoundingClientRect()` are always `0`
there, so sizing bugs require a real browser.

The regression that introduced this suite fed `PlaybackTimeLabel.offsetWidth` (a border-box value)
back into `min-width` (content-box by default). Once the LIVE indicator gained padding, every time
update grew the label and squeezed the seek bar. Jest was structurally unable to observe it.

`tick()` fires `TimeChanged` without changing `getCurrentTime()`, keeping the label text constant.
That isolates self-measurement bugs from legitimate size changes caused by longer content.

The layout spec checks two complementary invariants across live/VOD and host pages with/without a
global `box-sizing: border-box` reset:

| Suite                                               | Asserts                                                           |
| --------------------------------------------------- | ----------------------------------------------------------------- |
| `control bar geometry is stable under time updates` | no control bar descendant changes width when only the clock moves |
| `control bar rows contain their children`           | no flex row's children exceed its content box                     |

Never assert absolute pixel values: fonts differ across operating systems. Compare measurements
from the same run and assert relationships such as unchanged, did not grow, or fits within a
parent. Empty measurements must fail loudly; `{}` or `[]` must not turn a missing subject into a
passing comparison.

To prove the existing regression test, temporarily remove `box-sizing: border-box` from
`src/scss/components/labels/_playback-time-label.scss`, rebuild, and confirm exactly this one case
fails before restoring the rule:

```text
control bar geometry is stable under time updates › live, host page with no CSS reset
```
