# AGENTS.md

## Scope

This is an open-source repo. Do not put private/internal issue IDs in branch names, PR titles, PR descriptions, changelog entries, or public comments.

## Engineering Judgment

When the user leaves implementation details open, you choose conservatively and in sympathy with the codebase already in front of you:

- Read the surrounding UI framework before changing it: component, manager, factory, SCSS, and spec patterns usually show where a change belongs.
- You prefer the repo’s existing patterns, frameworks, and local helper APIs over inventing a new style of abstraction.
- Use structured APIs, typed helpers, and existing parsers instead of ad hoc string manipulation when the repo or platform already provides them.
- Keep changes local unless shared behavior already exists or the same rule is repeated in more than one place.
- Add abstractions only when they remove real duplication, document a stable public surface, or match an established local pattern.
- Treat exported config, components, `UIFactory` layouts, `UIManager` APIs, and TypeDoc-visible types as public API.
- Let verification match risk: focused specs and targeted checks for local changes; browser and mobile SDK verification when behavior crosses UI or platform boundaries.

## Editing Guardrails

- You may be in a dirty git worktree, often with local demo changes. Preserve existing user changes and never revert them unless explicitly requested.
- If existing changes affect files you need to touch, read them carefully and work with them. Ask only when they make the task impossible to complete.
- Keep manual edits narrow and reviewable. Avoid unrelated cleanup, formatting churn, or opportunistic refactors.
- Add comments only for non-obvious behavior contracts, precedence, lifecycle, browser/platform quirks, or public API expectations.
- Avoid destructive Git commands such as `git reset --hard` or forced checkouts unless the user explicitly asks for them.

## UI Structure

- `UIFactory` is the composition layer. Default layouts, variant-specific layout wiring, and feature-to-component wiring should live there instead of making low-level components know about a specific feature.
- Keep `UIFactory` declarative. It should compose layouts and wire components together, not become the place for player-state business logic or event behavior.
- `UIManager` owns player/UI lifecycle and variant switching. `UIInstanceManager` owns the active UI instance. Keep variant resolution, active UI state, and cleanup concerns in those layers.
- Components should stay reusable. A component may depend on generic framework primitives such as `Component`, `Container`, `Button`, `Panel`, `SettingsPanel`, or `EventDispatcher`, but should not know about unrelated sibling features just to make one layout work.
- `Component` classes own DOM and component-local behavior. Shared state and cross-component coordination belong in manager/state layers, not in sibling components reaching into each other.
- Panel-like UI should use the existing page/item/container patterns. Build root pages explicitly; do not hide page creation or navigation structure in implicit wrapper logic.
- Interactive rows inside panels should have one clear focus target. If a row wraps a nested button/toggle/select control, make the row and nested control interaction explicit so click, keyboard, ARIA state, and spatial navigation do not fight each other.
- Document/root listeners must be tied to the active UI lifecycle and released again. Keep stable handler references, unsubscribe in `release()` or the matching inactive/source-unloaded path, and avoid global singleton UI state. This repo supports multiple UI instances, UI variants, and Shadow DOM.

## Player API And Mobile SDKs

- The player is the source of truth for playback state. UI code should observe the player and recompute from player APIs or events instead of inferring playback state from UI variant, controlbar state, or component internals.
- For runtime player enums, events, and classes, prefer the active `player.exports.*` surface so the UI uses the same player instance it is attached to. Type-only imports from `bitmovin-player` are common in this repo, but do not add runtime player imports that can duplicate player code in the UI bundle.
- Use the public [Player Web API reference](https://cdn.bitmovin.com/player/web/8/docs/index.html) as the first source of truth for `player.*` and `player.exports.*` behavior.
- This UI is also used by the Bitmovin Android and iOS SDKs. Browser automation cannot fully cover those WebView/native-bridge environments, so changes that touch player APIs, platform/browser APIs, input behavior, layout, or generated markup need manual mobile SDK verification.
- The UI is implemented against the Player Web API. Before using a new `player.*` or `player.exports.*` API, verify that the Android and iOS SDK bridges expose it and that return values, events, timing, error behavior, and `undefined`/`null` cases match the web player closely enough for the UI code.
- When code needs mobile-specific player behavior, model that boundary explicitly with `MobileV3PlayerAPI` and `isMobileV3PlayerAPI(...)`. Do not let mobile-only events or error shapes leak into the regular web-player path.
- Browser and platform APIs can depend on secure context, embedding, or WebView support. Feature-detect APIs such as clipboard access, handle rejected promises, and avoid assuming desktop Chrome behavior applies everywhere.

## Component Construction And Styling

- Follow the existing component layout: component classes under `src/ts/components/...`, matching SCSS partials under `src/scss/components/...` when styling is needed, and exports from `src/ts/main.ts` for public API.
- Reuse existing primitives before adding a new component family. The repo already has containers, buttons, panels, settings-panel items, context-menu items, overlays, list/select components, and spatial navigation helpers.
- Grep before adding helper code. Existing utilities such as `Timeout`, `Button`, `DismissClickOverlay`, `LiveStreamDetector`, `BrowserUtils`, `StorageUtils`, exported `version` should be reused instead of adding parallel implementations.
- Prefer repo constructor style: call `super(config)` first, then assign `this.config = this.mergeConfig(config, defaultConfig, this.config)` using an inline/default config object in the same format as nearby components.
- Config interfaces are for externally supplied config and constructor defaults. Do not use config objects to store internal runtime state.
- Config that affects constructor-time child wiring, defaults, or callbacks must be available before the child component is created; do not patch constructor-consumed config afterward.
- Constructor/config refactors need semantic checks, not only lint. Verify default merging, subclass/base precedence, wrapped callbacks/comparators, and externally supplied child components.
- For config-controlled behavior, keep `this.config` as the source of truth. Do not mirror config flags into private fields unless the field represents derived runtime state.
- Persistent or stored settings should reuse the same normalization and defaulting rules as user-driven changes. Older stored values can be partial, so initialization paths must handle missing companion values.
- Public components need the full public path: exported config interface, exported class with the right TypeDoc category, `src/ts/main.ts` export, and a `UIComponentConfigMap` entry when the component config should be overridable through `UIConfig.componentConfigOverrides`.
- Subcomponents can live in the same file when they only exist to serve that parent component. Split them out when they become reusable outside that parent.
- Keep shared styling ownership in the shared component or row that actually owns the visual behavior. Delete obsolete per-component styling once ownership moves.
- Use repo SCSS variables, mixins, and placeholders before adding local color, font, spacing, or button styling.
- Prefer small, local changes over broad refactors. The default layouts and shared component hierarchy are conflict-heavy, so refactor only when it removes real duplication or fixes a real ownership problem.

## Public API And Docs

- Treat exported components, config interfaces, `UIFactory` layouts, `UIManager` APIs, and TypeDoc-visible types as stable public API.
- Public runtime APIs that expose collections should not return mutable internal arrays. Return copies or readonly views, and document ordering, duplicate handling, and whether entries survive source changes.
- Prefer TypeDoc output that is readable for integrators over clever mapped types that only look good in source.
- Keep public config mapping types explicit when that produces clearer TypeDoc than a clever mapped type:

```ts
export interface UIComponentConfigMap {
  ToggleButton?: Partial<ToggleButtonConfig>;
  FullscreenToggleButton?: Partial<ToggleButtonConfig>;
  SeekBar?: Partial<SeekBarConfig>;
}
```

- When public config maps reference component exports, keep the map, `src/ts/main.ts`, and the guard spec aligned.
- If an API depends on runtime class names, verify production/minified output. Exported TypeScript names and runtime constructor names are not the same guarantee.
- Update the changelog under `[Unreleased]` for public behavior or API changes. Use the existing Keep a Changelog subsections such as `Added`, `Changed`, `Deprecated`, `Removed`, or `Fixed`, and write bullets from the integrator/user-facing effect instead of internal implementation details.

## Commits And PRs

- Prefer single-purpose PRs. Only stack PRs when there is a real dependency between the changes.
- Keep commits scoped to one concern when a change naturally splits into independent parts, for example API surface, styling, tests, and changelog.
- Commit messages should describe the code or behavior change, not the review process that led to it.
- Normal feature PRs target `develop`. For stacked work, target the immediate dependency branch so the PR diff stays focused.
- Always preserve `.github/PULL_REQUEST_TEMPLATE.md`. Fill in the description and keep the required `CHANGELOG` checklist item instead of replacing the template with free-form text.
- Add or update the `[Unreleased]` changelog entry before opening a PR for public behavior, API, docs, or UI changes.

## Verification

- Use targeted checks while iterating:
  - `npx jest <spec> --runInBand`
  - `npm run test:browser` for layout/sizing behavior (see below)
  - `npm run lint-ts`
  - `npm run lint-sass`
  - `npx tsc --noEmit`
  - `npm run docs` for public TypeDoc changes
  - `npm run build` or `npm run build:prod` for bundle/runtime-sensitive changes
- For UI behavior, verify in the demo/browser when layout, wrapping, pointer behavior, Shadow DOM, or generated markup matters. Use Chrome MCP/browser tooling when available; if no browser tool is installed, call that out and ask for it before claiming visual verification.
- For Android or iOS SDK impact, record what was manually checked. If mobile SDK verification was needed but not possible in the current environment, say that explicitly and do not treat browser checks as equivalent.
- Treat `npm run docs` by exit code; TypeDoc warnings can be acceptable when the command exits `0`.
- For merge conflicts, confirm real unresolved conflicts with `git ls-files -u`; text searches for conflict markers can hit false positives in this repo.

## Layout And Sizing Tests

Jest runs in jsdom, which does no layout: `offsetWidth`, `getBoundingClientRect()` and friends are
always `0` there. A Jest spec can never catch a sizing bug. Layout belongs in `test/browser/`
(Playwright, run with `npm run test:browser`), which drives the built bundle in a real browser
against a stub player.

Rules that keep these tests from becoming flaky. Follow them or the suite gets disabled:

- **Never assert absolute pixel values.** Fonts render differently across operating systems, so
  `expect(width).toBe(73)` passes locally and fails in CI. Assert relationships instead: unchanged
  between two measurements, never grew, fits inside the parent, one element wider than another.
- **Compare a measurement to another measurement**, taken in the same browser in the same run.
  That is what makes the assertion portable.
- **No sleeping and no retries.** Time only moves when the test fires an event, so there is nothing
  to wait for. `retries` is deliberately `0`: a retry hides flakiness instead of surfacing it.
- **No real streams, no CDN, no video decode.** Those are the actual sources of flake in player
  testing. The stub player in `test/browser/harness.ts` replaces all of it.
- **Measure the elements that can actually change.** Container rows are full-width by construction,
  so comparing only those passes no matter how badly the controls inside them resize. Walk
  descendants, and when checking that children fit a row, find the flex container that actually
  distributes the space rather than the wrapper around it.
- **An empty measurement must fail, not pass.** A helper that returns `{}` or `[]` when its selector
  matches nothing makes "nothing is wrong" indistinguishable from "nothing was measured". Throw when
  the subject is missing, and assert that each test measured something.
- **Import `test` from `test/browser/harness.ts`**, not from `@playwright/test`. It fails a test on
  any uncaught page error, so a stub player that has drifted from the real API surfaces as a failure
  instead of as a half-built DOM whose two snapshots compare equal.
- **Prove a new test can fail.** Break the thing it guards, watch it go red, then fix it again. A
  layout assertion that was never seen failing is usually asserting nothing.
- **Cover both host-page worlds** when a change touches sizing: with and without a global
  `box-sizing: border-box` reset. Most real pages have one, our demo page has one via Bootstrap,
  and plenty of customer pages do not. `mountUi(page, { hostReset })` switches between them.
