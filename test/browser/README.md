# Browser layout tests

```bash
npx playwright install chromium   # once per machine, after npm ci
npm run test:browser              # builds, then runs Playwright
npx playwright test               # only if dist/ is already current
```

`npm ci` installs the Playwright _runner_, not the browser it drives, and there is no `postinstall`
hook that would download one behind your back. On a fresh checkout the first command is required;
after that it is a no-op. CI installs the browser itself, keyed on the exact Playwright version.

The third form is a footgun worth naming: Playwright loads `dist/`, not `src/`. Run it after editing
SCSS or TypeScript without rebuilding and you are testing the previous build. A _missing_ `dist/`
now fails with an explanatory message; a _stale_ one cannot be detected, so when a result surprises
you, rebuild before believing it.

## Why these exist

Jest runs in jsdom, which does no layout. `offsetWidth` is always `0` there, so a whole class of
bug is invisible to the existing specs: anything about how big things end up on screen.

The case that prompted this: `PlaybackTimeLabel` fed its own `offsetWidth` (a border-box value)
back into `min-width` (content-box by default). Once the LIVE indicator gained padding in 4.18.0,
every time update wrote back a larger value, so the label grew and the seek bar next to it shrank
away. Every check in the repo was structurally blind to it, and it reached a customer.

## How it works

`harness.ts` loads the built bundle into a blank page and builds the real UI against a **stub
player**. No manifest, no CDN, no video decode. The clock only moves when a test calls `tick()`,
which is why the suite runs in about two seconds and produces identical numbers every time.

The stub takes its API surface from the real `Player.prototype`, so it tracks the player version
the repo builds against instead of being a hand-maintained list. Members that matter to layout are
overridden explicitly; everything else answers as a no-op.

`tick()` fires `TimeChanged` repeatedly without advancing `getCurrentTime()`, so the label's text
stays the same across ticks. That is deliberate: it isolates size changes a component causes by
measuring itself from size changes that longer text would legitimately cause.

Import `test` from `./harness`, not from `@playwright/test`. The harness wraps it in a fixture that
fails a test on any uncaught exception in the page, so a stub that has drifted out of sync with the
player API shows up as a failure instead of as a half-built DOM that quietly measures equal.

## The invariants

| Suite                                               | Asserts                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------ |
| `control bar geometry is stable under time updates` | no control bar descendant changes width when only the clock moves        |
| `control bar rows contain their children`           | no horizontal flex row's children occupy more than the row's content box |

Both run across all four environments: live/VOD × host page with and without a global
`box-sizing: border-box` reset.

The two are complements. Stability alone is satisfied by a layout that is broken and stays broken;
containment alone is satisfied by a layout that is wrong from the first frame and never settles.

## Writing new tests

The rules are in `AGENTS.md` under "Layout And Sizing Tests". The two that matter most:

> Never assert absolute pixel values. Compare a measurement to another measurement.

`expect(width).toBe(73)` will pass on your machine and fail in CI, because fonts differ. Assert
that something did not change, did not grow, or fits inside its parent.

> Make an empty measurement a failure, not a pass.

A helper that returns `{}` or `[]` when its selector matches nothing turns "nothing is wrong" and
"nothing was measured" into the same green result. `controlBarWidths` and `controlBarFlexRows`
throw when the control bar is missing, and each test asserts it measured something.

Before you trust a new test, break the thing it guards and watch it fail. For the existing suite
that means deleting `box-sizing: border-box` from
`src/scss/components/labels/_playback-time-label.scss`, rebuilding with `npm run test:browser`, and
confirming that exactly one of the eight tests goes red:

```
✘ control bar geometry is stable under time updates › live, host page with no CSS reset
```

The other seven stay green, and that is the point of the matrix: a host-page reset masks the bug,
VOD never had it, and the row-containment invariant is a different question that this particular
regression does not violate.
