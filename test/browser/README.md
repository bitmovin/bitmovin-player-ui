# Browser layout tests

```bash
npm run test:browser        # builds, then runs Playwright
npx playwright test         # if dist/ is already current
```

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
which is why the suite runs in about a second and produces identical numbers every time.

The stub takes its API surface from the real `Player.prototype`, so it tracks the player version
the repo builds against instead of being a hand-maintained list. Members that matter to layout are
overridden explicitly; everything else answers as a no-op.

## Writing new tests

The rules are in `AGENTS.md` under "Layout And Sizing Tests". The one that matters most:

> Never assert absolute pixel values. Compare a measurement to another measurement.

`expect(width).toBe(73)` will pass on your machine and fail in CI, because fonts differ. Assert
that something did not change, did not grow, or fits inside its parent.

Before you trust a new test, break the thing it guards and watch it fail. For the existing suite
that means deleting `box-sizing: border-box` from `_playback-time-label.scss`, rebuilding, and
confirming that exactly one test goes red: `live, host page with no CSS reset`. The other three
stay green, because a host-page reset masks the bug and VOD never had it.
