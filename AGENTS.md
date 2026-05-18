# AGENTS.md

Project conventions for AI agents (and humans) working on `bitmovin-player-ui`.
These are not abstract style rules — every item below has bitten a recent PR.

`CONTRIBUTING.md` covers code-style basics. This file covers the things
maintainers keep repeating in reviews because they aren't written down
anywhere.

---

## 1. Grep before you implement — the project already has what you need

Before reaching for a primitive (timer, button, click-outside, live detection,
storage, version string, …), check whether the project already has a utility
for it. Adding a parallel implementation is the #1 source of review churn.

Known utilities you should default to:

- **`src/ts/utils/Timeout.ts`** — use this, **not** `setInterval`/`setTimeout`
  directly. It integrates with the component lifecycle.
- **`src/ts/components/buttons/Button.ts`** (`Button<ButtonConfig>`,
  `ButtonStyle`) — for clickable actions. Do **not** build buttons out of raw
  `DOM('button', …)`. Buttons expose `onClick.subscribe`, `setText`,
  localization, and styling for free.
- **`src/ts/components/overlays/DismissClickOverlay.ts`** — for panels/menus
  that need to dismiss on outside click. Don't add document-level
  `mousedown`/`contextmenu` listeners yourself.
- **`src/ts/utils/PlayerUtils.ts` → `LiveStreamDetector`** — for "is this
  source live?" checks if you care about live↔VOD transitions during
  playback. For a one-shot check, `player.isLive()` is enough.
- **`src/ts/utils/BrowserUtils.ts`** — `isMobile`, `isIOS`, … Don't infer
  touch capability from the active UI variant (small-screen UI runs on
  desktop too).
- **`src/ts/utils/StorageUtils.ts`** — wraps `localStorage` and honours
  `UIConfig.disableStorageApi`. Persistent state **must** route through this.
- **Version string**: import `version` from `src/ts/main.ts`. Do not declare
  another `'{{VERSION}}'` constant; the build replaces it in one place.
- **`SeekBar.keyStepIncrements`** — keyboard seek/step deltas already live
  here. Fold new step-related options into this; don't add a parallel flag.

If you genuinely need something that doesn't exist: still grep first, then
add it under `src/ts/utils/` (not inline in a component), and reuse it.

---

## 2. Player ↔ UI boundary

### 2.1 Use `player.exports.*` — never import from player modules directly

`PlayerEvent`, `LinearAd`, the player enums and types must come from
`player.exports`, not from `bitmovin-player` directly. Direct imports bundle
the whole player into the UI build and produce duplicated player code at
runtime. The same rule applies to imports of UI internals: don't import from
`main.ts` inside `src/ts/*` — it causes circular bundles.

### 2.2 The Player is the source of truth

The UI **observes** the player; it does not maintain its own model of player
state.

- ✅ `player.isLive()`, `player.isPaused()`, `player.getCurrentTime()`,
  `player.getDuration()`, `player.getSource()` …
- ❌ Inferring live from `seekBarType`, UI variant, controlbar state, etc.

If you have UI state that depends on the player, subscribe to player events
and recompute — don't fork the source of truth.

### 2.3 Trust internal APIs — no defensive `try/catch` / `safe()` wrappers

The Player API is internal. Wrapping every `player.x()` call in `try/catch`
(or a `safe()` helper) signals "I don't know which of these are available
when," which is the wrong mental model — they all are. It also hides real
bugs.

- ❌ `try { player.getCurrentTime() } catch { … }` for routine calls.
- ❌ A generic `safe(() => player.xxx())` helper.
- ✅ Only validate at true system boundaries (user input, external APIs,
  `localStorage` in private mode → that's what `StorageUtils` is for).

If a specific Player API can legitimately throw, document the *specific*
reason with a comment, not a generic try/catch.

---

## 3. Component design

### 3.1 `Component` is for things with UI

A `Component` represents a DOM element. If your class has no DOM output, it
is **not** a Component.

- ❌ `class FrameStepHandler extends Component` (no DOM).
- ✅ Put the behaviour on an existing component that owns the DOM (e.g.
  `SeekBar`), or extract a plain helper class under `src/ts/utils/`.

### 3.2 Shared state belongs on `UIManager`, not buried in a component

If a piece of state or coordination logic is read by multiple components
(volume controller, ad-break tracker, …), it lives on `UIManager` and
components subscribe to it. The owner pattern is already established —
`VolumeController` and `AdBreakTracker` are the references to copy.

Components must **never** `release()` shared state owned by `UIManager`;
they only unsubscribe their own listeners.

### 3.3 Subscribe and unsubscribe properly

Listener leaks are routine review findings. Every PR that subscribes to an
event must:

1. Capture the handler as a **stable reference** (instance method or
   constructor-bound arrow), not an inline lambda passed straight into
   `.subscribe(...)`.
2. Unsubscribe in `release()` using the same reference.
3. For listeners that should disappear when the source changes (typical for
   live-only or ad-only behaviour), tear down on `SourceUnloaded` and rebuild
   on `SourceLoaded`.

Inline lambdas can never be unsubscribed and break subclass overrides.

### 3.4 Question new state; prefer derived values

Before adding a class field (cache, flag, snapshot), ask:

- Can this be computed from player state on demand?
- Can it be derived from an existing event payload?
- Is the cache invalidation going to be harder than the computation?

New state is reviewer-flagged hard. "Lazily compute from the player" is the
default answer; introduce state only when you have a specific performance or
correctness reason and can justify it.

### 3.5 Don't reparent components

Reparenting into `<body>` or `document.fullscreenElement` to "keep visible"
is brittle (CSS scoping, event propagation, fullscreen handoff, inert
tracking). The always-visible pattern is **don't include
`@include hidden-animated;`** in the component's SCSS — see how `Watermark`
is done.

Fullscreen handoff goes through player events, not DOM moves.

---

## 4. Layout & integration

### 4.1 No business logic in `UIFactory`

`UIFactory` composes layouts. Customers fork these layouts to build their
own UIs. Anything in `UIFactory` that *does* something (subscribes to events,
calls `.hide()` on a sibling, …) silently breaks when a customer reassembles
the same components in their own layout.

- ❌ `someButton.onClick.subscribe(() => settingsPanel.hide())` in
  `UIFactory`.
- ✅ The button takes the panel via config and closes it from its own
  `configure()` — see existing settings components (`SettingsPanelItem`
  knows the panel it lives in).

Treat `UIFactory.ts` as a manifest of which components go where, not a
controller.

### 4.2 Strict comparison for config defaults

When a config flag is optional, gate behaviour on the exact value, not on
"defined-ness":

- ❌ `if (config.ecoMode != undefined) showToggle()` — shows the toggle when
  the user explicitly opted out with `ecoMode: false`.
- ✅ `if (config.ecoMode === true) showToggle()` or
  `config.ecoMode !== false` depending on which default you intend.

### 4.3 Touch ≠ small-screen

- Small-screen UI variant (`smallScreen`) runs on desktop browsers in narrow
  windows. It is not a proxy for "touch device."
- For touch-specific routing (e.g. "right-click isn't reachable, so surface
  this in the settings panel"), use `BrowserUtils.isMobile`.

---

## 5. User-facing

### 5.1 Localize all user-facing strings

Every visible string goes through `i18n.getLocalizer('your.key')`. Add the
key to `src/ts/localization/languages/en.json` and to the `Vocabulary`
interface in `src/ts/localization/i18n.ts`. Non-English vocabularies fall
back to English via `I18n#initializeVocabulary` — you don't have to translate,
but you do have to add the key.

Exception: developer-facing diagnostic labels in an opt-in "stats for nerds"
overlay are fine in English. Anything an end user could see needs a key.

### 5.2 iOS reality check (and drop legacy workarounds while you're there)

The UI ships to iOS. Before you call something done:

- **Edge-swipe**: full-width drag handles near the screen edge conflict with
  Safari's swipe-back gesture. Don't drag overlays from the screen edge.
- **Text selection**: we disable `user-select` on iOS. Don't claim "text is
  selectable" without scoping it.
- **VoiceOver**: avoid duplicate ARIA wiring — `aria-label` + `aria-labelledby`
  on the same control causes VoiceOver to read the name twice.
- **`prefers-reduced-motion`**: blanket-disabling animations breaks panels
  whose open/close logic depends on transition-end events firing. Use
  `animation-duration: 0.01ms`, not `none`.
- **Autoplay**: muted-only on iOS, and only after a user gesture in some
  contexts. Test "click play" → "feature works" on iOS Safari, not just
  desktop Chrome.

Inverse pattern, equally important: **when you're in code with a legacy
mobile workaround** (300ms touch delay, old iOS focus hack, etc.), check
whether it still applies. The project actively prunes obsolete guards; don't
preserve them out of caution.

If you can't test on iOS, say so explicitly and scope claims as "Web only"
rather than implying cross-platform support.

---

## 6. APIs & backwards compatibility

### 6.1 Don't enable new behaviour by default if it changes the world

A new opt-in flag (`enableX: boolean`, default `false`) is safe. A new flag
that defaults to `true` and *changes existing playback / UI state* is
dangerous: it breaks Bitmovin's own automated tests, breaks customers who
already built a parallel implementation, and surprises end users.

- ✅ "Resume from last position" defaulting to `true` is fine — it adds an
  optional banner; existing customers see only a banner they can dismiss.
- ❌ Persisting `playbackSpeed` across all videos by default is not fine —
  it silently changes what every customer's user sees.

When unsure, default to `false`. If the feature fundamentally needs end-user
consent, surface a toggle in the UI, not just a config flag.

### 6.2 Public API contract changes need explicit handling

Changing a public function's return type, an event payload, a config field's
shape, or a callback signature is a **breaking change**. Mitigations:

- Keep the old shape supported (`boolean | void` instead of just `boolean`,
  `string | LocalizableText` instead of replacing `string` with
  `LocalizableText`).
- If you can't keep back-compat, call it out in the PR description and add a
  CHANGELOG entry under `### Changed` with a brief migration note.

### 6.3 "Should this be in the Player, not the UI?"

Before adding a feature, ask whether it belongs in the Player SDK so it works
without the default UI:

- Debug info / stats — Player should expose the data.
- Persisted prefs (volume / mute / playback speed) — Player should persist.
- Deep-linking via `?t=` URL parameters — Player should honour these so
  customers using their own UI also get them.

These belong here only when there's a deliberate reason ("integrators using
their own UI have to wire it themselves") that you state in the PR. Otherwise,
push the feature down to the Player team and build only the UI affordance.

---

## 7. Anti-patterns

### 7.1 No bandaid timers / fallbacks for symptoms

When something doesn't work the way you expect:

- ❌ Adding a timeout, a retry, or a "just in case" fallback to mask the
  symptom.
- ✅ Tracing back to the root call site and fixing the actual condition
  (or removing the obsolete check that's causing the problem).

If you find yourself writing `setTimeout(() => this.thing(), 100)` to "wait
for X to be ready," stop. The reviewer will ask why X isn't already ready,
and the answer is usually that an earlier check is wrong.

### 7.2 Naming consistency

Project-wide terms are picked deliberately. When you introduce a new
identifier, scan for existing terminology before choosing yours:

- One concept → one name. If sibling code uses `cea608`, don't write
  `cea_608` or `CEA608` in your new symbol.
- Avoid vague names like `init`, `update`, `handle`, `next` standing alone.
  `updatePushupForPlayerHeight` should be
  `updateCea608PushupFromPlayerHeight`; `next` should be `playerStatsHtml`.
- API surface (config fields, event names, public methods) is reviewed
  especially hard — `defaultUi` vs `mainUi` vs `buildUI` consistency matters
  to integrators.

---

## 8. CHANGELOG hygiene

The CHANGELOG is the public-facing release note, not a commit log.

- **Never edit existing entries.** Touching prior bullets causes merge
  conflicts with every other in-flight PR. Add new entries only.
- **Right section**:
  - `### Added` for new features (including formerly-missing capabilities
    like `prefers-reduced-motion` support).
  - `### Fixed` for bug fixes — regressions or wrong behaviour in existing
    features.
  - `### Changed` for behaviour changes to existing features.
  - If a change is test-only, an `### Internal` section is acceptable for
    those.
  - A feature that "worked as designed but now works differently" is not a
    Fix — it's Changed (or Added if it's brand-new capability).
- **Describe UX impact, not the internal change.** "Migrated XYZ to use ABC
  internally" tells the reader nothing. What does it mean for the integrator
  or the end user?
- **Scope claims correctly**:
  - Platform axis: web-only features (`Dropped frames`, native fullscreen)
    say so — `Dropped frames (Web player only)`.
  - Layer axis: "the player" / "the application" / "the UI" are three
    different things. Don't say "reach the player" when you mean the host
    application.
- **One bullet per feature, high-level prose.** No implementation details,
  no per-locale-key enumeration.
- **Don't claim things you haven't verified on every platform.** If the iOS
  WebView disables a thing you're describing, scope or remove the claim.

Pre-PR self-check: does each CHANGELOG line read like something you'd put in
a "What's new" announcement, or does it read like a code comment? If the
latter, trim it.

---

## 9. PR shape

- **Keep PRs single-purpose.** "Add resume banner" and "add a localStorage
  toggle in the demo page" are two PRs (or at least clearly separated
  commits).
- **Don't stack PRs on each other unless necessary.** If #B depends on #A,
  base #B on `develop` and accept a small future conflict over leaving a
  large unfocused diff for the reviewer.
- **If a PR review identifies that the feature belongs in the Player, stop.**
  Reply with the rationale; don't pile more UI commits on top.

---

## 10. Quick pre-commit checklist for agents

Before you say "done":

- [ ] Grep'd for an existing utility before adding a new one (§1).
- [ ] Player types/events imported via `player.exports.*`, not from
      `bitmovin-player` (§2.1).
- [ ] Player state read from `player.*`, not inferred from UI state (§2.2).
- [ ] No `try/catch` around internal Player calls (§2.3).
- [ ] No new `Component` subclass without DOM (§3.1).
- [ ] Shared state lives on `UIManager`, not buried in a component (§3.2).
- [ ] Every `.subscribe(...)` has a matching unsubscribe in `release()`,
      with a stable handler reference (§3.3).
- [ ] No new class field that could be a derived value (§3.4).
- [ ] No reparenting; use the `hidden-animated`-omitted pattern (§3.5).
- [ ] `UIFactory` is a manifest only, no event wiring (§4.1).
- [ ] Config-default guards use `=== true` / `!== false`, not
      `!= undefined` (§4.2).
- [ ] Touch routing uses `BrowserUtils.isMobile`, not UI variant (§4.3).
- [ ] All user-facing strings localized (§5.1).
- [ ] iOS implications considered; obsolete iOS workarounds removed, not
      preserved (§5.2).
- [ ] New `default: true` flag justified or downgraded to `false` (§6.1).
- [ ] Breaking public-API change either kept back-compat or called out in
      CHANGELOG + PR description (§6.2).
- [ ] If feature might belong in the Player SDK, that decision is stated in
      the PR description (§6.3).
- [ ] No bandaid `setTimeout` / retry to mask a missing precondition (§7.1).
- [ ] New identifiers match project terminology; no vague `init`/`next`
      names on the public surface (§7.2).
- [ ] CHANGELOG entry added at the **end** of the right section, no existing
      lines touched, UX-impact wording, no implementation details, no
      locale-key enumeration (§8).
- [ ] `npm run lint` clean, `npx tsc --noEmit` clean, `npx jest` green.
