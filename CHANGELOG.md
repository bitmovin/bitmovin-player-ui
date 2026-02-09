# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

### Added

- Language localization for Portuguese

## [4.8.1] - 2026-02-09

### Fixed

- Time-related labels not properly updating the time format if the duration changes from below 1 hour to greater than 1 hour.
- Feedback loops by avoiding callbacks into the player when subtitle/audio selection is updated by player events.

## [4.8.0] - 2026-01-29

### Added

- Improvements to the clickable areas of the seek-bar

## [4.7.0] - 2026-01-28

### Added

- Language localization for French

## [4.6.1] - 2026-01-08

### Fixed

- Uncaught JS errors after destroying the player while a live source is loaded

## [4.6.0] - 2025-12-22

### Added

- `ShadowDomConfig` via `UIConfig.shadowDomConfig` to configure Shadow DOM rendering.
  - Set `uiConfig = { shadowDomConfig: true }` to enable rendering the UI in a Shadow DOM.

### Fixed

- The `TimelineMarkers` implementation was improved to fix the following problems:
  - Duplicate `TimelineMarkers` after resizing the window
  - `TimelineMarker`s no longer animate to its initial position after loading a Source
  - `TimelineMarker`s no longer move unexpected during time-shifting in a live stream

## [4.5.0] - 2025-12-10

### Added

- New possibility to easily change the color of icons.
  - Set a custom color to `$color-icon` and `$color-icon-highlight-ads` in `src/scss/_variables.scss` to define SVG icon colors at compile time

### Removed

- Button no longer calls stopPropagation on its click, focusin and focusout Events

### Fixed

- Type incompatibility warnings with Player version 8.235.0 and higher
- Ads UI variant not shown
- Missing exports of some components and configuration types

## [4.4.0] - 2025-11-27

### Fixed

- Incorrect sytnax of CSS `URL` functions, leading to problems with URLs containing special characters like `(` or `)`
- Removed `aria-label` from `Icon` and subsequently fixed duplication of `Button`'s aria-label being duplicated into (optional) Icon
- Incorrect CEA608 caption rendering
- Subtitle font size preference from local storage is not restored upon UI initialization

## [4.3.0] - 2025-11-05

### Added

- `SettingsPanelConfig.stateResetDelay` to define the delay after hiding the `SettingsPanel` before its internal state (active page, navigation stack and scroll position) is reset
- `SettingsPanel.hideAndReset()` to immediately hide the `SettingsPanel` and clear its internal state
- `UIContainerConfig.deferUiHideWhileSettingsOpen` to suspend the `UIContainer`'s hide timer while a `SettingsPanel` is open and resume it when the panel closes. Enabled by default

### Changed

- `SettingsPanel` now temporarily preserves and restores its navigation state and scroll position when it's hidden and shown again without an explicit reset
  - When reopened within the configured `stateResetDelay`, it automatically restores the last active page, navigation stack, and scroll position
  - The internal state is cleared only after the `stateResetDelay` period has elapsed or when `hideAndReset()` is called
- Increased the default auto-hide delay for `SettingsPanel` to provide a smoother experience while adjusting settings

### Fixed

- `SettingsPanel` automatically hiding in `modernSmallScreenUI`
- `AdMessageLabel` didn't show anything if a `LabelConfig.text` was configured

## [4.2.0] - 2025-10-15

### Added

- New Icons for `QuickSeekButton` matching our new icon design system
- Dedicated Icons for `QuickSeekButton` for intervals of 5, 10, 15, 20, 30 and 60 seconds

### Fixed

- `npm start` not working anymore
- Crash when using the Player Android SDK where `player.ads.isLinearAdActive` was invoked despite not being available on that platform

## [4.1.0] - 2025-10-06

### Added

- `UIFactory.buildSubtitleUI` to create a subtitle-only UI, without visible UI elements

### Fixed

- Missing exports in `main.ts`
- CSS prefix not correctly replaced in JS files during the build process

## [4.0.0] - 2025-09-26

### Added

- `Icon` component for generic icon rendering
- Dedicated `Icon` component to `Button` to allow separate styling for icons, text and backgrounds
  - `ButtonStyle` to have general button appearance customization
    - `ButtonStyle.Icon` to have an icon-only button
    - `ButtonStyle.Text` to have a text-only button
    - `ButtonStyle.TextWithLeadingIcon` to have a button with icon on the left side of the text
    - `ButtonStyle.TextWithTrailingIcon` to have a button with icon on the right side of the text
- Dedicated `Icon` component to `Label` to allow separate styling for icons, text and backgrounds
  - `LabelStyle` to have general label appearance customization
    - `LabelStyle.Text` to have a regular text-only label
    - `LabelStyle.TextWithLeadingIcon` to have a label with icon on the left side of the text
    - `LabelStyle.TextWithTrailingIcon` to have a label with icon on the right side of the text
- New touch interactions for touch input devices
  - The UI node hides/shows on single tap anywhere on empty space
  - Double-tap to skip forward/backward functionality
- Out-of-the box safe-area support to put the UI controls into the view port without risking them being cut off by the shape of a non‑rectangular display
- When navigating the UI either via the Keyboard or via Spatial Navigation, the `SettingsPanel` automatically focuses the first settings option
- `UIConditionContext.isTv` to include the TV UI variant by default
- A dedicated UIVariant when no Source is loaded to avoid showing UI elements with undefined values
- Prettier for automatic code formatting

### Changed

- Existing UI layouts and designs were updated to better fit modern Player UI experiences
  - The TV UI layout got a complete rework and now provides a cleaner and more modern look and feel
  - The design on TVs was updated to better feedback of the currently focused element and provides the same experience as on web browsers
  - The Small Screen UI layout was updated to better distribute the UI elements and provide a more balanced layout
  - The Ad UI was updated to take away less space on the screen
    - The seek bar is now always visible during ad playback indicating the ad progress
    - A new `AdCounterLabel` was added to indicate the current, and remaining, ad position within an ad break
- Default font size to `18px`
  - Change the default font size by overriding the `$font-size` SCSS variable in `_variables.scss`. All other sizes are calculated based on this variable to ensure a consistent sizing across the entire UI.
- Icon design system to have a modern and consistent look and feel
  - Icon size to `24x24px`
    - Change the default icon size by overriding the `$icon-size` SCSS variable in `_variables.scss`
- Updated `RecommendationOverlay` design and API
  - Reworked recommendation overlay design allowing displaying unlimited recommendations in a scrollable list
  - Updated the recommendation overlay API to provide more flexibility
    - Added support for `ExternalRecommendationLink` to point to external websites
      Example:
      ```javascript
      {
        // Can be part of the SourceConfig or UIConfig
        recommendations: [
          {
            title: 'Recommendation 2: The second best video',
            resource: {
              url: 'http://bitmovin.com',
              thumbnail: 'https://placehold.co/300x300/222/222',
            },
            duration: 64,
          },
        ];
      }
      ```
    - Added support for `SourceConfig` to directly load new content in the current player instance
      Example:
      ```javascript
      {
        // Can be part of the SourceConfig or UIConfig
        recommendations: [
          {
            title: 'Recommendation 2: The second best video',
            resource: {
              dash: 'YOUR_DASH_MANIFEST',
              // .. additional SourceConfig properties
              poster: 'YOUR_POSTER_URL',
            },
            duration: 64,
          },
        ];
      }
      ```
- Updated `SettingsPanel` design for better navigation and extend functionality
  - The settings panel, per default, no longer uses system provided select boxes but custom design selection items.
    To enable this, we added:
    - `InteractiveSettingsPanelItem` which acts as a selection option within the `SettingsPanel`
    - `DynamicSettingsPanelItem` which allows dynamically navigating within the `SettingsPanel` to a new `SettingsPanelPage` without the need to predefine the page and its content
  - The previously used `SelectBox` components are still available and can be used by directly using them in combination with a `SettingsPanelItem` instead of the new `DynamicSettingsPanelItem` or `InteractiveSettingsPanelItem`
  - Added `SettingsPanelNavigationGroup` for spatial navigation support
- A `ListBox` now extends from `SettingsPanel` to inherit all the new features and design improvements from the `SettingsPanel`
- The Bitmovin Watermark is no longer visible by default
  - If you want to include your own watermark, you can replace the `logo.svg` file in the `src/assets` folder and enable the watermark in your `UIConfig` by setting `includeWatermark: true`
- Improved spatial navigation
  - Added `FocusableContainer` for grouping elements together to an either vertical or horizontal section
    - Navigating will prioritize elements within the same `FocusableContainer`
    - `FocusableContainer` can specify a priority element, which gets focused first when navigating into the container
  - Increased cutoff angle from 45° to 89° for improved out-of-the-box support for more layouts
  - Elements directly in the navigation direction are prioritized over diagonal elements even if they are closer
  - The `RecommendationOverlay` and the `SettingsPanel` now support spatial navigation
- Color Scheme Update
  - The UI now uses white elements as the accent color instead of our Bitmovin blue
  - To change the accent color, modify the `$color-highlight` variable in `_variables.scss`
- The UI Controls now immediately hide on mouse leave on web browsers by default
- Updated buffering indicator with updated design, animation and color
- The Small Screen UI is now used on web browsers when the document width is less than `800px`
- Renamed `$color-background-bars` to `$color-background-gradient-start`
- Folder Structure rework
  - The entire codebase has been reorganized from a flat structure to a hierarchical folder structure
  - Components are now grouped into folders based on their functionality or grouped by bigger features
- File Naming changes
  - All TypeScript files now use PascalCase instead of all lowercased
  - All SCSS files now use kebab-case instead of all lowercased
    - This includes the css-classes used as well
- Use `webpack` instead of `gulp` now as build tool

### Removed

- The terms `modern`, `skin` and `default` across the codebase
  - Our UI is now simply referred as the UI and not as `modernUI` or `defaultUI` anymore
  - The `UIFactory` still provides all the same builder methods, but without the `modern` or `default` prefix anymore
  - Affected APIs:
    - `UIFactory.buildModernUI`, `UIFactory.buildDefaultUI` -> `UIFactory.buildUI`
    - `UIFactory.buildModernSmallScreenUI`, `UIFactory.buildDefaultSmallScreenUI` -> `UIFactory.buildSmallScreenUI`
    - `UIFactory.buildModernTvUI`, `UIFactory.buildDefaultTvUI` -> `UIFactory.buildTvUI`
    - `UIFactory.buildModernCastReceiverUI`, `UIFactory.buildDefaultCastReceiverUI` -> `UIFactory.buildCastReceiverUI`
  - Affected CSS classes:
    - `ui-skin-ads` -> `ui-ads`
    - `ui-skin-smallscreen` -> `ui-smallscreen`
    - `ui-skin-cast-receiver` -> `ui-cast-receiver`
    - `ui-skin-tv` -> `ui-tv`

## [3.103.1] - 2025-10-07

### Changed

- Update our release automation to prepare for the upcoming v4 release

## [3.102.0] - 2025-08-14

### Changed

- Default font size for CEA captions is lowered, effectively making the previous 75% the new 100%.

### Fixed

- Long CEA captions are cut off when font size changed to greater than 100% via settings panel
- CEA caption font size is not changing when font size set to 75% via settings panel
- CEA caption positioning breaks when font size is changed via settings panel

## [3.101.0] - 2025-08-12

### Fixed

- Font size change in subtitle rendering options menu has no effect for CEA captions
- Subtitle font size changes for VTT/TTML subtitles when the subtitle rendering options menu is opened
- Subtitle font size preference from local storage is not restored upon UI initialization

## [3.100.0] - 2025-08-12

### Fixed

- CEA captions can overlap with player's control bar

## [3.99.0] - 2025-08-11

### Fixed

- Immediately update the playback position when seeking using a click

## [3.98.0] - 2025-06-13

### Fixed

- The `PlaybackTimeLabel`s time format was incorrectly displayed as `mm:ss` instead of `hh:mm:ss` when the duration is higher than 1 hour when transitioning from Live to VOD

## [3.97.0] - 2025-06-12

### Fixed

- The `PlaybackTimeLabel`s now immediately display the time instead of flickering `LIVE` for a short time when transitioning from Live to VOD

## [3.96.0] - 2025-05-16

### Changed

- Background of CEA captions now does not cover the subtitle window fully

## [3.95.0] - 2025-05-16

### Fixed

- Seeking with active CEA captions left an empty window behind

## [3.94.0] - 2025-05-15

### Fixed

- WebVTT doesn't render when region styles are present

## [3.93.0] - 2025-05-09

### Fixed

- CEA caption rendering broken if no user preference is present for subtitle font size

## [3.92.0] - 2025-04-23

### Added

- Ads UI variant to default TV UI

## [3.91.0] - 2025-04-10

### Added

- `aria-label` to `ErrorMessageOverlay`
- New `ariaFallbackMode` configuration option to `SeekBarConfig`, which updates the current playback position also in the `aria-label`. This can be used for devices which don't support the `aria-valuetext` attribute for `slider`s.

### Changed

- The `aria-pressed` attribute is only set on `ToggleButton`s instead of all buttons
- The `aria-pressed` attribute is not set if both, `onAriaLabel` and `offAriaLabel`, configuration properties are set for a specific component
- The `aria-label` for Quickseek buttons contain now also the number of seconds the button seeks

### Fixed

- Error message in `ErrorMessageOverlay` not read by Text-To-Speech engine on Tizen

## [3.90.0] - 2025-04-03

### Fixed

- Setting larger font size while using CEA-608 captions can shift some cues outside of visible area.

## [3.89.0] - 2025-03-24

### Added

- Changing font size now also takes an effect in CEA-608 captions with cap from 50% to 200%. Larger than default font size also disables the grid view.

## [3.88.0] - 2025-02-25

### Changed

- Chore: Skip releasing a new version when no changelog entry was added
- Chore: Fix release workflow
- Chore: Fix release workflow again
- Chore: Fix release condition

## [3.87.0] - 2025-02-20

### Fixed

- Setting font color in subtitle customization settings not working on Comcast X1 Set-Top Boxes and other older WebKit-based platforms

## [3.86.0] - 2025-02-20

### Changed

- Chore: Update github actions to v4

## [3.85.0] - 2025-01-16

### Changed

- Chore: Update assets to use Bitmovin CDN

## [3.84.0] - 2025-01-15

### Added

- Support for changing the font style of subtitles and closed captions
- Support for changing the edge color of characters of subtitles and closed captions

## [3.83.0] - 2025-01-14

## Fixed

- Exception when disabling smooth playback position updating by setting `SeekbarConfig.smoothPlaybackPositionUpdateIntervalMs` to `-1`

## [3.82.0] - 2025-01-13

### Added

- Chore: Pre-commit hook for linting TypeScript file changes

## [3.81.0] - 2025-01-10

### Fixed

- Positioning of CEA-608 caption cues when multiple cues are displayed on the same line

## [3.80.0] - 2025-01-08

### Fixed

- Unexpected styling for the initially displayed cue when enabling CEA-608 captions
- Vertical alignment of CEA-608 captions on small player sizes

## [3.79.0] - 2025-01-08

### Fixed

- CEA-608 caption window covering almost the entire video area

### Changed

- Create separate region components for each CEA-608 row

## [3.78.0] - 2025-01-08

### Changed

- Chore: Switch from `tslint` to `eslint` for linting

## [3.77.0] - 2025-01-03

### Changed

- Chore: Update to Node v22

## [3.76.0] - 2024-12-20

### Fixed

- Seek preview thumbnails exceeding the UI dimensions when default size is increased

## [3.75.0] - 2024-11-19

### Fixed

- Potential performance impact caused by forced layout reflows

## [3.74.0] - 2024-10-24

### Changed

- Dpad keymap for Android devices

## [3.73.0] - 2024-09-06

### Added

- `Component` now has a `ViewMode` that can either be `Persistent` or `Temporary`

### Fixed

- `selectbox` dropdown not closing in Safari when the UI is hidden

### Changed

- `selectbox` now sets its `ViewMode` to `Persistent` whenever and as long as the select-dropdown is shown
- `uicontainer` and `settingspanel` will no longer auto-hide if there are any components that are in the `Persistent` view mode

## [3.72.0] - 2024-08-30

### Added

- Dutch (nl) subtitles

## [3.71.0] - 2024-08-28

### Added

- Link to API docs in README

## [3.70.0] - 2024-08-21

### Added

- Support for a new placeholder `{adBreakRemainingTime}` in [AdMessageLabel](https://cdn.bitmovin.com/player/ui/3/docs/classes/AdMessageLabel.html) that displays the remaining time in an ad break. [Documentation](https://cdn.bitmovin.com/player/ui/3/docs/functions/StringUtils.replaceAdMessagePlaceholders.html) on usage.

## [3.69.0] - 2024-08-14

### Added

- API doc generation and publishing. The API doc from the UI can be found [here](https://cdn.bitmovin.com/player/ui/3/docs/index.html)

## [3.67.0] - 2024-07-03

### Added

- Missing changelog entries of `3.65.0` and `3.66.0` release versions

## [3.66.0] - 2024-07-01

### Changed

- Playground demo page to include checkbox to enable/disbale ads
- Store basic configuration of playground demo page in localStorage

## [3.65.0] - 2024-06-24

### Added

- Eco Mode toggle button

## [3.64.0] - 2024-05-28

### Added

- `Component` instances are now assigned to their `HTMLElements` for easier accessing

### Fixed

- Two touch interactions needed to skip an ad or open the click through link

## [3.63.0] - 2024-05-17

### Added

- `QuickSeekButton` control bar component for jumping +/- a configurable number of seconds (10 second default)

## [3.62.0] - 2024-05-06

### Fixed

- No subtitle is shown when switching between different tracks

## [3.61.0] - 2024-04-23

### Fixed

- `ControlBar` not auto-hiding when `UIConfig.disableAutoHideWhenHovered` is set to `true` on some touch screen devices

## [3.60.0] - 2024-04-16

### Added

- Type export for `UIVariant` interface

## [3.59.0] - 2024-04-12

### Added

- `UIContainerConfig.hideImmediatelyOnMouseLeave` to immediately hide the UI when mouse leaves it

### Fixed

- Triggering UI release after merging a PR from a fork

## [3.58.0] - 2024-04-08

### Added

- `UIConfig#seekbarSnappingEnabled` config option to enable/disable the play head snapping to markers on the seek bar when seeking near them. Default is `true`.

## [3.57.0] - 2024-03-28

### Added

- `disableStorageApi` config option

### Fixed

- Subtitle settings not being retained when the UI variant switches

## [3.56.0] - 2024-03-26

### Changed

- `localStorage` availability check to not create a test-entry anymore

## [3.55.0] - 2024-03-21

### Added

- Automatically add compare link in changelog file in relase workflow

### Fixed

- Missing compare link in the changelog file

## [3.54.0] - 2024-02-01

### Fixed

- FCC subtitle settings menu showing two options with the same value
- Invalid release workflow file

## [3.53.0] - 2024-01-03

### Added

- Automate release on every PR merge to develop

## [3.52.2] - 2023-11-23

### Fixed

- Potential name clashing in CSS animations due to missing `bmpui` prefix

## [3.52.1] - 2023-11-13

### Fixed

- Crash when receiving a `SourceLoaded` event during scrubbing

## [3.52.0] - 2023-09-25

### Fixed

- When having a spatial navigation and using a mouselike device, components will lose focus when the mouse leaves the hovered component. Spatial navigation will continue at the last active component when using arrow keys again.

## [3.51.0] - 2023-09-18

### Changed

- On seek/timeshift operations the UI will only remove subtitle cues which do not enclose the seek target instead of removing all.

## [3.50.0] - 2023-07-24

### Fixed

- Settings panel does not close on single tap on mobile devices
- Restoring volume on unmute not working when volume was changed through the player API
- Gulp `watch` task not working

## [3.49.0] - 2023-07-17

### Added

- `onActiveUiChanged` event on the `UIManager` that is dispatched when the UI manager switches to a different UI variant
- Readonly `currentUi` field on the `UIManager` that exposes the active `UIInstanceManager`

## [3.48.0] - 2023-07-03

### Fixed

- When more than one UI with spatial navigation is managed by the UI manager, all UIs would handle key events, instead of only the active one.

## [3.47.0] - 2023-05-17

### Changed

- Updated package dependencies.

## [3.46.0] - 2023-03-22

### Added

- Config option `forceSubtitlesIntoViewContainer` to handle overflowing subtitle labels

## [3.45.0] - 2023-03-06

### Added

- Scrubbing during a FaceTime call automatically creates a SharePlay suspension to not synchronize scrubbing to other participants.

## [3.44.0] - 2023-02-13

### Fixed

- Circular dependency in the import of `AudioTrackListBox` between `main.ts` and `uifactory.ts`

## [3.43.0] - 2023-02-06

### Added

- `UIConfig.enterFullscreenOnInitialPlayback` to enter fullscreen when clicking `PlaybackToggleButton` or `HugePlaybackToggleButton` to initiate the initial playback

## [3.42.0] - 2023-01-30

### Added

- Language localization for Spanish

## [3.41.0] - 2023-01-12

### Added

- Export Localization and SpatialNavigation to use in external UI configuration

## [3.40.0] - 2022-12-20

### Added

- Support for spatial navigation
- SmartTV UI via `UIFactory.buildDefaultTvUI`

### Changed

- Node.js from 10 to 16
- Typescript from ^3.9.6 to 4.3

## [3.39.0] - 2022-12-01

### Added

- `display` method on `ErrorMessageOverlay` to enable usage for application errors without a player error
- Replay button which can be used within the controlbar and works also during playback

### Fixed

- Unnecessary DOM element creation on release

## [3.38.0] - 2022-08-30

### Fixed

- Duration format not getting updated from `mm:ss` to `hh:mm:ss`

## [3.37.0] - 2022-04-12

### Fixed

- Incorrect line alignment for subtitle cues from WebVTT tracks.
- Incorrect edges of reference for vertical writing cues in block positioning from WebVTT tracks.
- An empty line is added in vertical subtitle cues.

## [3.36.0] - 2022-03-15

### Added

- Seek preview is now configurable via `UIConfig.enableSeekPreview` or `SeekBarConfig.enableSeekPreview`

## [3.35.0] - 2022-03-01

### Fixed

- npm install failure on node 16

## [3.34.0] - 2022-02-16

### Fixed

- Incorrect aria-label on playbackbutton toggle

## [3.33.0] - 2022-02-01

### Added

- Support for providing custom `aria-label` when `ListBox` is used.

### Fixed

- Updating the markers on live streams causing unhandled exception after player is destroyed.

## [3.32.0] - 2021-12-21

### Fixed

- The scrubber could jump to an old position during a seek operation when it was dragged.
- The Seekbar scrubber could jump to an old position on touch devices when the buffer updates during a seek operation.

## [3.31.0] - 2021-10-12

### Added

- Style reset for subtitle overlay element to prevent undesired CSS rules collisions.

## [3.30.0] - 2021-09-14

### Added

- Sort `AudioTracks` inside the `AudioTrackSelectBox` and the `AudioTrackListBox` by their identifier.

## [3.29.0] - 2021-08-19

### Fixed

- An empty line being added to subtitle boxes when VTT positioning attributes are present.

## [3.28.1] - 2021-06-25

### Fixed

- Broken build for previous release `3.28.0`

## [3.28.0] - 2021-06-22 [YANKED]

### Fixed

- VTT cue positioning when position alignment is `end` or `right`

## [3.27.0] - 2021-04-11

### Added

- Support for `CueUpdate` events that were introduced in player v8.60.0

### Fixed

- Ad times (`remainingTime`, `playedTime` and `adDuration`) are not correctly rounded

## [3.26.0] - 2021-03-30

### Fixed

- `TouchEvent` error in seekbar controls when using the mouse on a touchscreen Windows device and IE/UWP

## [3.25.0] - 2021-03-16

### Added

- Build step to publish releases to npm via CI
- Support for Mobile V3 `PlayerError` and `SourceError` events

### Fixed

- Controls' focus highlighting is shown in case of non-keyboard interaction on some browsers/platforms

## [3.24.0] - 2021-02-16

### Added

- Support for `PlaylistTransition` event which is only present on Mobile V3

## [3.23.0] - 2021-01-14

### Changed

- Default error message for code `1105` now uses the term "allowlist"

## [3.22.0] - 2020-12-22

### Added

- `UIConfig#disableAutoHideWhenHovered` config property to disable auto hiding of UI when an element in `ControlBar` is currently hovered

### Changed

- Exported builder method for `modernUI`

## [3.21.0] - 2020-12-03

### Added

- `'type' : 'button'` to buttons to prevent submitting forms

## [3.20.0] - 2020-11-25

### Fixed

- Wrapping possibly not enumerable properties of player object, like getters and setters

## [3.19.0] - 2020-11-10

### Fixed

- Subtitles not displayed in IE/tizen 2016 when no regions are present

## [3.18.0] - 2020-10-27

### Fixed

- Live-indicator stays active after stalling in live streams

## [3.17.0] - 2020-08-18

### Fixed

- Subtitle positioning when small screen UI is used and vtt properties are present
- `SettingsPanel` goes blank sometimes when switching browser tab/window

## [3.16.0] - 2020-07-30

### Added

- Support for `images` on `TimelineMarkers`

### Changed

- Changed `TimelineMarkers` rendering from using no `offset` and `css-border` to `width` and `translateX` properties.

### Fixed

- Inconsistent `PlaybackToggleButton` state after transitioning between multiple `AdBreak`s for the same position using `BitmovinAdvertisingModule`

## [3.15.0] - 2020-07-23

### Added

- Listen to `ViewModeAvailabilityChanged` event and toggle visibility of `FullscreenToggleButton` and `PictureInPictureToggleButton` accordingly
- Support `TimelineMarkers` in live streams

### Changed

- TypeScript update to 3.9.6

### Fixed

- Dead documentation link in README.md
- `FullscreenToggleButton` being visible although `ViewMode.Fullscreen` is not available
- Vertical text alignment in the `MetadataLabel` for the `MetadataLabelContent.Title` in the `SmallScreenUI`

## [3.14.0]

### Added

- Seekbar snapping range is now configurable

## [3.13.0]

### Fixed

- Subtitles partially hidden by player controls

## [3.12.0]

### Added

- TTML `displayAlign = after` styling case

### Fixed

- TTML subtitles region alignment

## [3.11.0]

### Fixed

- Position alignment for VTT subtitles
- Default selection not highlighted in AudioTrackListBox and SubtitleListBox
- Clear subtitles list when source is unloaded

## [3.10.0]

### Added

- Support for regions in VTT subtitles

### Fixed

- UI hiding when actively using seek or volume slider
- Empty background boxes with TTML subtitles on Chromecast

## [3.9.2]

### Added

- Web Content Accessibility (WCAG) 2.0
- Keyboard controls for sliders when focused

### Fixed

- `onActive` and `onInactive` not fired for root `SettingsPanelPage` when `SettingsPanel` was configured with `hideDelay` of `-1`
- Automatic opening of the first select box when the `SettingsPanel` becomes visible on iOS devices

## [3.9.1]

### Fixed

- UI flickering back and forth on live streams after ads
- Build errors when using the npm package
- Outdated live asset sample

## [3.9.0]

### Added

- Localization
- `DurationChanged` event support

## [3.8.1]

### Changed

- Hide UI even a element in `ControlBar` is currently hovered

### Fixed

- Do not hide `SettingsPanel` in `modernSmallScreenUI` automatically

## [3.8.0]

### Added

- Support for regions in TTML subtitles

## [3.7.0]

### Added

- Thumbnail preview support for live streams

### Changed

- UI no longer hides in `Prepared`, `Paused` or `Finished` state

## [3.6.1]

### Fixed

- Ads UI not being hidden when the Player is unloaded during ad playback

## [3.6.0]

### Added

- `PlaybackTimeLabelMode.RemainingTime` to display the remaining time of the content

### Changed

- Improved documentation about time / number formats which can be used in `AdMessageLabel` placeholders
- TypeScript update to 3.4.5
- Improved generic type inheritance of `Component` `Config`s ([#74](https://github.com/bitmovin/bitmovin-player-ui/issues/74))

### Fixed

- Incorrect calculation of `SettingsPanelPage` dimensions in transition animation
- Navigation for more than two `SettingsPanelPage`s

## [3.5.0]

### Added

- Support for player instances which inherits from the `BitmovinPlayer`

### Changed

- `ListBox` no longer recreates itself after the list was updated

### Fixed

- UI not hiding after selecting an item within a `ListBox`

## [3.4.6]

### Fixed

- Allow npm package to be imported in server side app without `navigator` error

## [3.4.5]

### Fixed

- Wrong state for live indicator when a `startTime` value is provided within the `SourceConfig` of the player

## [3.4.4]

### Fixed

- Crash of `UIContainer.release` when initialized with `hideDelay: -1`

## [3.4.3]

### Fixed

- AirPlay icon does not change into active state

## [3.4.2]

### Changed

- Dispatch last event of a rate-limited event sequence to `Event.subscribeRateLimited` listeners

### Fixed

- Inaccurate time within `SeekBarLabel` on seek preview

## [3.4.1]

### Added

- `simple.html` to test plain UI CSS without Bootstrap

### Fixed

- Stopping timeshift offset updater of `SeekBar` when player is destroyed
- `box-sizing` style of `SeekBar` and `SeekBarLabel`

## [3.4.0]

### Added

- `UIContainerConfig.userInteractionEventSource` to allow tracking of user interaction events (which toggle the visibility of certain components like the `ControlBar`) on a custom element

### Changed

- Avoid unnecessary updating of hidden `AdSkipButton`
- Upgrade to Gulp 4 ([#208](https://github.com/bitmovin/bitmovin-player-ui/issues/208))

## [3.3.1]

### Changed

- Default UI does not show any UI variant during an ad without UI requirement

## [3.3.0]

### Added

- Support for `VideoQualityAdded`, `VideoQualityRemoved`, `AudioQualityAdded`, `AudioQualityRemoved` events in `AudioQualitySelectBox` / `VideoQualitySelectBox`

### Changed

- Updated advertising UI support for player 8.1

## [3.2.0]

### Added

- CSS selectors for all `SelectBox` components
- `VolumeController` to control and manage volume and mute state by multiple `Component`s in a single place
- `disable()` / `enable()` functionality to `Component`s
- Preventing click event on a disabled `Button`
- Advertising UI support
- `UIConditionContext.adRequiresUi` to distinguish if the current ad requires an external UI

### Changed

- `UIConfig.playbackSpeedSelectionEnabled` is now `true` by default (as it was before v2.17.0)

### Removed

- Deprecated `UIConditionContext#adClientType` as it's no longer supported by player v8

### Fixed

- Handling of `null` keys in `SelectBox` (fixes subtitle deselection in IE11)
- Unintended start of playback while scrubbing on seekbar
- `VolumeToggleButton` interfered player API `setVolume`/`mute`/`unmute` calls

## [3.1.0]

### Added

- Customization of output naming via CLI parameters (see `outputnames` in `gulpfile.js`)

### Changed

- Improved `Button` hit-boxes by changing margins to paddings
- `Seekbar`/`VolumeSlider` position markers changed from SVG to pure CSS to improve vertical alignment with bar
- `Timeout` rewritten for better efficiency

### Fixed

- Uncaught `PlayerAPINotAvailableError` in `SeekBar` position updater when player is destroyed
- Unresponsive UI when a user canceled connection establishment to a Cast receiver
- Avoid unnecessary animation when `BufferingOverlay` is hidden
- Avoid unnecessary DOM modification when the text of a `Label` does not change
- Positioning of `SettingsPanelPageOpenButton` in some browsers
- `Timeout` could not be cleared from within the timeout callback function

## [3.0.1]

### Fixed

- Positioning of `SeekBar`/`VolumeSlider` markers improved
- Crash of `UIManager.release` when player instance was already destroyed

## [3.0.0]

Major release for Bitmovin Player 8, mainly adjusted to the changed player API. For player 7, please use UI v2.x.

### Added

- Support for image subtitles
- Paging support for `SettingsPanel` via `SettingsPanelPage` to enable navigation to sub-settings ([#119](https://github.com/bitmovin/bitmovin-player-ui/issues/119))
- Default `ErrorMessageTranslator` with english error messages for the `ErrorMessageOverlay`
- `UIConfig.errorMessages` to allow customization of error messages via custom `ErrorMessageTranslator` | `ErrorMessageMap`

### Changed

- `play` and `pause` calls during seeking now have the issuer `ui-seek` instead of `ui`
- Extracted/renamed `UIManager.Factory` to `UIFactory`
- Moved `UIConfig`, `TimelineMarker`, and `UIRecommendationConfig` from `uimanager.ts` to `uiconfig.ts`
- Replaced local player type definitions with type definitions from the [bitmovin-player NPM package](https://www.npmjs.com/package/bitmovin-player)

### Removed

- Everything deprecated in 2.x
- Player v7 feature detections and compatibility fallbacks
- `SubtitleSettingsPanel` in favour of `SubtitleSettingsPanelPage` to use with the new navigation feature of `SettingsPanel`
- Player v6 legacy skin (`skin-legacy`) and its UI variants
- Disabled the ads UI variants because there is no ads module in player v8 yet that requires a UI (ads UI will be reintroduced with an upcoming release)

### Fixed

- Type definitions are now generated correctly and referenced from `package.json`
- Update timeline markers when loading a new source
- Flickering playback position indicator when switching to a live-stream

## [2.18.0] (2018-08-08)

### Added

- UI element `ListBox` to display multiple selectable items ([#121](https://github.com/bitmovin/bitmovin-player-ui/issues/121))
- Icon for subtitles
- Icon for audio tracks
- Demo section within the UI variants in the playground
- Demo with separate `SettingsPanel`s for subtitles and audio tracks
- `UIContainerConfig.hidePlayerStateExceptions` option to configure player states in which the controls will not be hidden

### Changed

- SmallScreenUI: Move `RecommendationOverlay` behind `TitleBar` to avoid hidden `FullscreenToggleButton` in replay screen and prevent smartphone users from exiting fullscreen
- SmallScreenUI: Do not hide controls in replay screen

## [2.17.1] (2018-08-01)

### Fixed

- Rendering of single-image thumbnails
- Local storage detection in Firefox

## [2.17.0] (2018-07-10)

### Added

- `AirPlayToggleButton` to `modernSmallScreenUI` for MacOS devices
- `PictureInPictureToggleButton` to `modernSmallScreenUI` for MacOS devices
- `UIConfig.playbackSpeedSelectionEnabled` option to show/hide `PlaybackSpeedSelectBox` within the `SettingsPanel`

### Changed

- `PlaybackSpeedSelectBox` is no longer visible within the `SettingsPanel` by default

### Fixed

- Apply the IE/Firefox workaround of v2.16.0 to hide the hovered dropdown panel of a `SelectBox` also when the UI hides

## [2.16.0] (2018-06-27)

### Added

- Revert state of `PlaybackToggleButton` to paused if a play attempt is rejected (`ON_WARNING 5008`; e.g. in case of autoplay)
- `UIManager` API to dynamically manage `SeekBar` markers: `getTimelineMarkers`, `addTimelineMarker`, `removeTimelineMarker` ([#103](https://github.com/bitmovin/bitmovin-player-ui/issues/103))
- Interval marking with added property `TimelineMarker.duration` ([#103](https://github.com/bitmovin/bitmovin-player-ui/issues/103))
- Custom CSS classes on markers in `SeekBar` and `SeekBarLabel` through `TimelineMarker.cssClasses` ([#103](https://github.com/bitmovin/bitmovin-player-ui/issues/103))
- `ListSelectorConfig.filter` to filter items of auto-populated `SelectBox` implementations, e.g. `SubtitleSelectBox` ([#117](https://github.com/bitmovin/bitmovin-player-ui/pull/117))
- `ListSelectorConfig.translator` to translate item labels of auto-populated `SelectBox` implementations, e.g. `SubtitleSelectBox` ([#117](https://github.com/bitmovin/bitmovin-player-ui/pull/117))

### Changed

- Animate `HugePlaybackToggleButton` only on state changes (not when UI is initially loaded)
- Hide `HugePlaybackToggleButton` play animation when `config.playback.autoplay` is enabled or the player is already playing
- Consolidated configuration management of `UIConfig` from components into `UIManager`
- Configuration from the player source now takes precedence over the configuration passed into the `UIManager`

### Fixed

- IE & Firefox could leave the dropdown panel of an active/hovered `SelectBox` floating after the parent container (e.g. `SettingsPanel`) was hidden

## [2.15.0] (2018-06-08)

### Added

- `UIManager` API to switch UI variants: `UIConfig.autoUiVariantResolve`, `onUiVariantResolve` event, `getUiVariants`, `resolveUiVariant`, `switchToUiVariant` ([#102](https://github.com/bitmovin/bitmovin-player-ui/pull/102))

## [2.14.0] (2018-05-02)

License change from LGPLv3 to MIT.

### Added

- Subscribe to the `ON_PLAYBACK_SPEED_CHANGED` event to display the correct speed in the `PlaybackSpeedSelectBox`
- Prefer `on`/`off` over `addEventHandler`/`removeEventHandler` with player version 7.8+ to avoid deprecation log messages
- `data-bmpui-volume-level-tens` attribute on `VolumeToggleButton` for more granular styling of the volume icon
- `onClass`/`offClass` configuration properties in `ToggleButtonConfig` to allow customizing the state marker CSS class names

### Changed

- Removed `bmpui-low` marker class from `VolumeToggleButton` (replaced by `data-bmpui-volume-level-tens` attribute)
- Renamed `VolumeToggleButton` mute state marker CSS class names from `off`/`on` to `unmuted`/`muted`
- Change `VolumeToggleButton` into mute state when the player volume is set to `0` (avoids transitions from zero volume to muted)
- Set player volume to `10` when the player is unmuted and the volume is below `10` (avoids transitions from muted to zero volume)
- Removed volume level animation from `VolumeSlider`

### Fixed

- Initialize `ToggleButton` state at UI configuration
- `SettingsPanel` attempted to check `isActive` on non-`SettingsPanelItem` components (e.g. `CloseButton`)
- User interaction passthrough from `HugePlaybackToggleButton` to player when autoplay is blocked
- `SeekBar` bar levels and scrubber positioning in Android 4.4 WebView

## [2.13.0] (2018-03-15)

### Changed

- Consistent UI's prepared state detection by only looking at the player's ready state

## [2.12.1] (2018-02-21)

### Fixed

- Flickering heights of `SeekBar` and `VolumeSlider` bar indicators
- "Concurrent" modification of event handlers in `EventDispatcher` when a handler is unsubscribed by a handler

## [2.12.0] (2018-01-22)

### Changed

- Execute volume control availability test on dummy media element to prevent unexpected interference with muted autoplay

### Fixed

- Positioning of `SeekBar` markers was broken due to style changes in 2.11.0

## [2.11.0] (2017-12-22)

### Added

- Update `SeekBar` playback position of live streams with DVR window while playback is paused

### Changed

- Switch off live edge indicator in `PlaybackTimeLabel` when a live stream is paused

### Fixed

- Stop `SeekBar` smooth playback position updates on `ON_PLAYBACK_FINISHED`
- Centered `SeekBar` and `VolumeSlider` drag handles and make sure that all layers of the underlying bar have the same height

## [2.10.5] (2017-11-20)

### Changed

- `PlaybackToggleButton` now also listens to `ON_SOURCE_LOADED` and `ON_SOURCE_UNLOADED` to properly update the playback state when the source changes
- Update package dependencies
- Apply CEA-608 style to subtitles before they are added to the DOM to avoid "style flickering"

### Fixed

- Unnecessary line breaks in CEA-608 texts

## [2.10.4] (2017-10-30)

### Changed

- Remove `nowrap` from CEA-608 style to correctly render multiline cues
- `PlaybackToggleButton` now also listens to `ON_PLAYING` in addition to `ON_PLAY`

## [2.10.3] (2017-10-20)

### Fixed

- Handling of whitespaces in CEA-608 texts

## [2.10.2] (2017-10-19)

### Changed

- Rewritten CEA-608 text layouting
- Greatly simplified CEA-608 CSS style (`.{prefix}-ui-subtitle-overlay.{prefix}-cea608`)
- Calculate CEA-608 font size only with active CEA-608 cues

### Fixed

- Overlapping CEA-608 texts with large player aspect ratios

## [2.10.1] (2017-10-13)

### Changed

- Removed `VolumeControlButton`'s `VolumeSlider` slide-in animation in the legacy skin to fix the slider knob at 100% bug

### Fixed

- Vertical `VolumeSlider` knob in legacy skin was not visible when set to a low volume
- Legacy skin's `VolumeSlider` knob was always rendered at 100% when appearing after being hidden
- Avoid `ItemSelectionList` DOM recreation on item selection to avoid unexpected events (e.g. `mouseenter`)

## [2.10.0] (2017-09-14)

### Added

- Update `AudioQualitySelectBox`/`VideoQualitySelectBox` entries when the period of a source changes

### Changed

- Export bundled UI (`bitmovinplayer-ui.js`) as UMD module (instead of global module)

### Fixed

- Fix `Uncaught TypeError` when `require`ing UI before player
- Don't write UI into global namespace (`bitmovin.playerui`) when loaded as module with `require`

## [2.9.0] (2017-08-24)

### Added

- Support CEA-608 subtitle positioning
- Added `ui` issuer parameter to all applicable player API calls (seek, timeshift, mute, unmute, setVolume)

### Changed

- Unified player API issuer parameter to always be `ui` instead of `ui-{componentName}`

### Fixed

- Select correct audio track after updating the items in `AudioTrackSelectBox`

## [2.8.3] (2017-08-01)

### Changed

- Use new quality change API in `AudioQualitySelectBox` and `VideoQualitySelectBox` for player >= 7.3.1 (selection is now synced with player-API `set[Audio|Video]Quality` calls)

## [2.8.2] (2017-08-01)

Release of this version went wrong and it was unpublished from NPM.

### Fixed

- Fix `animate-slide-in-from-bottom` SCSS mixin (fixes missing `VolumeSlider` slide-in animation of `VolumeControlButton` in the legacy skin)
- Fire `ON_READY` event if UI is loaded after player is ready to initialize all components correctly

## [2.8.1] (2017-07-26)

### Fixed

- Early quality selection in `AudioQualitySelectBox`/`VideoQualitySelectBox` before `ON_READY` broke players <= 7.2.5

## [2.8.0] (2017-07-25)

### Added

- Adds a `VolumeToggleButton` to the small screen UI

### Changed

- Moved all subtitle styling to CSS (default subtitle style is not overwritten any longer)

### Fixed

- Fix clearing of container components with `Container#removeComponents` (fixes sticky/duplicate subtitle issue)
- Fix updating container components with `Container#updateComponents` (fixes empty subtitles in IE11)
- Fix handling of duplicate subtitle cues (same text at same time) in `SubtitleOverlay` (fixes another sticky subtitle issue)
- Fix clearing of recommendations in `RecommendationOverlay` (fixes duplicate recommendations issue)
- Reset selected value in `ListSelector` when the items are cleared
- Updating selected value in `PlaybackSpeedSelectBox` when player is ready
- Fix video quality options for progressive streams (removed 'auto' option, preferred quality preselected)

## [2.7.1] (2017-07-06)

### Changed

- Throttled high-frequency API calls to the player from the `VolumeSlider` and `SeekBarLabel`

## [2.7.0] (2017-06-28)

### Added

- Add support for FCC compliant closed captions. Adds options on how captions are displayed, and a SubtitleSettingsPanel with the possibility to update the settings while playing the video.
- Add UI version property to global namespace (`bitmovin.playerui.version`)
- Add `UIConfig#container` config property to specify a custom place in the DOM where the UI will be put into. Can be used to place it somewhere else beside the default player figure.

## [2.6.0] (2017-06-27)

### Added

- Add an option to keep the UI always visible by setting the `UIContainerConfig#hideTimeout` to -1

### Changed

- Thumbnail size is no longer determined by the physical image size and can now be arbitrarily set by CSS

## [2.5.1] (2017-06-26)

No functional changes. Improves player API declarations, code linting configuration, and adds [contribution guidelines](CONTRIBUTING.md).

## [2.5.0] (2017-06-13)

### Added

- Add `UIConditionContext#adClientType` to be able to switch to different UI variants for different ad types
- Add `UIConditionContext#isPlaying` and resolve UI variants on `ON_PLAY` and `ON_PAUSED` to be able to switch between different UI variants for playing and paused states

### Changed

- NPM entry point changed from browserified standalone distributable file to CommonJS module (NPM package can now be used with Node and Browserify out-of-the-box)
- Deprecated `UIConditionContext#isAdWithUI`, use `adClientType` instead (`isAdWithUI` equals `context.adClientType === 'vast'`)

### Fixed

- Stop rendering loop of the `ErrorMessageOverlay` background canvas when UI is released
- Fix wrapped control bar in modern skin on iOS 8.2

## [2.4.0] (2017-06-08)

### Changed

- Resolve UI variants on `ON_READY`
- Improved UI variant switching by detecting the end of an ad when loading a new source during ad playback

### Fixed

- Fix subtitle line breaking

## [2.3.0] (2017-06-01)

UI does not crash any more when used with player 7.0, all other restrictions explained in [2.0.0](#200) still apply.

### Added

- Display subtitles in `SubtitleOverlay` with HTML markup if available instead of the plain text
- Update `AudioTrackSelectionBox` on new `ON_AUDIO_ADDED`/`ON_AUDIO_REMOVED` events in player 7.1.4 / 7.2.0

### Changed

- Detect live streams and time shift availability when configuring dependent components (`PlaybackTimeLabel`, `PlaybackToggleButton`, `SeekBar`) to adjust their mode independently from the player state changes
- Skip configuration of `PictureInPictureToggleButton` and `AirPlayToggleButton` and hide the components if functionality is not supported (when used with player 7.0)

### Fixed

- Fix settings panel closing when an option select box is open
- Fix crash of Gulp `serve` task on HTML file changes
- Fix `SeekBar` in legacy skin did not hide on `hide()`
- Fix missing audio track selection box in Safari with player 7.1.2 and 7.1.3
- Fix error in `SubtitleOverlay` when trying to remove an already cleared subtitle cue

## [2.2.0] (2017-05-05)

### Added

- Add `Container#removeComponents()` to remove all child components of a container
- Display multiple subtitle cues in parallel in `SubtitleOverlay`
- Add `getText()` method, `isEmpty()` method, and `onTextChanged` event to `Label`
- Add `TitleBarConfig#keepHiddenWithoutMetadata` to keep `TitleBar` hidden if metadata labels are empty

### Changed

- Do not display `TitleBar` in Cast UI when it does not contain any metadata (title/description)

### Fixed

- Clear `SubtitleOverlay` when playback is finished

## [2.1.1] (2017-05-03)

### Fixed

- Update playback position / volume indicator position in `SeekBar`/`VolumeSlider` when component is shown

## [2.1.0] (2017-05-02)

### Added

- Add `remote-control` marker class to `UIContainer` that is applied during an active remote control session (e.g. Cast session)
- Display play/pause button in smallscreen UI during an active remote control session (e.g. Cast session)

### Changed

- Adjust `CastStatusOverlay` font size and remove Cast icon (makes place for the playback toggle) in smallscreen UI
- Move `PlaybackToggleOverlay` over `CastStatusOverlay` in smallscreen UI to enable playback toggling

### Fixed

- Fix hiding of `HugePlaybackToggleButton` during Cast session initialization

## [2.0.4] (2017-04-28)

### Added

- Add `ErrorMessageOverlayConfig#messages` to translate and customize error messages in the `ErrorMessageOverlay`

## [2.0.3] (2017-04-25)

No functional changes. Fixes typo in the changelog.

## [2.0.2] (2017-04-25)

No functional changes. Adds a `prepublish` script to the NPM package so an incomplete version like `2.0.0` cannot happen to be published again.

## [2.0.1] (2017-04-24)

No functional changes. Fixes an incomplete NPM package published for `2.0.0`, which has been unpublished.

## [2.0.0] (2017-04-24)

Version 2.0 of the UI framework is built for player 7.1. If absolutely necessary, it can still be used with player 7.0, but certain restriction apply: Casting will not work correctly due to API improvements and a removed workaround, new components based on added API calls will fail (`AirPlayToggleButton`, `PictureInPictureToggleButton`) and need to be removed from the default UI, seeking before playback won't work due to a removed workaround, and audio/video quality changes through the API won't be picked up by the select boxes due to misnamed events.

### Added

- Add `AirPlayToggleButton` for AirPlay support on MacOS and iOS (player 7.1+)
- Add `PictureInPictureToggleButton` for picture-in-picture support on MacOS and iOS (player 7.1+)
- Add dynamic switching between different UIs based on various context properties (screen size, ads, mobile, fullscreen)
  - Add new `UIManager` constructor `(player: Player, uiVariants: UIVariant[], config?: UIConfig)` for dynamic switching
  - Add new `UIManager` constructor `(player: Player, ui: UIContainer, config?: UIConfig)` for simple cases with only one UI instance
  - Automatically display smallscreen UI on mobile devices in default modern UI
- Read metadata (title/description) from player source config if metadata in `UIConfig` is empty
- Refresh metadata when a new source is loaded into the player
- Add `release()` method to components to release resources and dependencies created during `configure(...)`
- Add `onConfigured` event to `UIManager` which gets fired once UI is ready (configured and added to DOM)
- Detect illegal circular references in UI component tree and throw error
- Add `VolumeSliderConfig#hideIfVolumeControlProhibited` flag to automatically hide the volume slider on platforms which prohibit programmatic volume control (currently only iOS)
- Add mouse hover-state to `Component`
  - `isHovered()` returns the current hover-state
  - `onHoverChanged` event with `ComponentHoverChangedEventArgs` is fired when the hover state changes
- Add `Spacer` component that just takes up space
- Read timeline markers from player source config (`source.markers`) if `UIConfig` does not contain markers
- Refresh timeline markers when a source is loaded/unloaded
- Read recommendations from player source config (`source.recommendations`) if `UIConfig` does not contain recommendations
- Refresh `RecommendationOverlay` when a source is loaded/unloaded
- Clear `MetadataLabel` when source is unloaded
- Add `SeekBarConfig#smoothPlaybackPositionUpdateIntervalMs` to configure or disable smooth playback position updates on the `SeekBar`
- Delay displaying of the `BufferingOverlay` by 1 second to bypass short stalls without the distraction of the overlay (configurable with `BufferingOverlayConfig#showDelayMs`)

### Changed

- Update Cast support for new Cast implementation in player 7.1
- Permanently display UI during a Cast session
- No more use of the player's global namespace
- Hide `ErrorOverlay` when a new source is loaded
- Hide `BufferingOverlay` when source is unloaded
- Do not attempt to show/hide components if they are already in the target state
- Display stop icon instead of pause icon on the `PlaybackToggleButton` for live streams without timeshift
- UI is no longer hidden while a control in the controlbar is hovered
- Instead of requiring two touches to start playback, the first touch now reveals UI and triggers playback at the same time (`UIContainer` with `HugePlaybackToggleButton`)
- Decreased `HugePlaybackButton`, `ErrorMessageOverlay` `BufferingOverlay`, and `SubtitleOverlay` font size in smallscreen UI
- Hide `RecommendationOverlay` when source is unloaded
- Listen to `ON_[AUDIO|VIDEO]_DOWNLOAD_QUALITY_CHANGE` events instead of `*_CHANGED` in `AudioQualitySelectBox`/`VideoQualitySelectBox` (download events were broken/misnamed in player 7.0)

### Removed

- Remove all transitions and animations from Cast receiver UI due to low rendering performance on Chromecast devices
- Remove Cast workarounds/hacks required for old Cast implementation in player 7.0
- Remove seek-before-play workaround (now directly supported by player 7.1)
- Remove `UIManager` constructor `(player: Player, playerUi: UIContainer, adsUi: UIContainer, config?: UIConfig)`, use new constructor with `UIVariant[]` instead
- Disable smooth seekbar update in Cast receiver UI for increased Chromecast performance

### Fixed

- Fix seekbar position indicator when seeking before playback
- Fix unloading/releasing of UI
- Fix wrong volume slider / seekbar positioning on UI startup and after loading a source
- Fix missing component exports to global JS namespace
- Fix timeshift support on live streams where timeshifting is not available from the beginning
- Fix wrongly detected live state of HLS streams in Chrome on Android
- Fix seekbar position update when player is already playing at UI initialization (e.g. when autoplay is enabled)
- Fix wrong `UIContainer` playback state class when creating UI in other states than idle and prepared
- Correctly initialize `VolumeToggleButton` low/high volume icon state

## [1.0.1] (2017-02-10)

### Fixed

- Fix thumbnail preview on the seekbar label

## 1.0.0 (2017-02-03)

- First release

[3.102.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.101.0...v3.102.0
[3.101.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.100.0...v3.101.0
[3.100.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.99.0...v3.100.0
[3.99.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.98.0...v3.99.0
[3.98.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.97.0...v3.98.0
[3.97.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.96.0...v3.97.0
[3.96.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.95.0...v3.96.0
[3.95.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.94.0...v3.95.0
[3.94.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.93.0...v3.94.0
[3.93.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.92.0...v3.93.0
[3.92.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.91.0...v3.92.0
[3.91.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.90.0...v3.91.0
[3.90.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.89.0...v3.90.0
[3.89.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.88.0...v3.89.0
[3.88.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.87.0...v3.88.0
[3.87.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.86.0...v3.87.0
[3.86.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.85.0...v3.86.0
[3.85.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.84.0...v3.85.0
[3.84.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.83.0...v3.84.0
[3.83.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.82.0...v3.83.0
[3.82.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.81.0...v3.82.0
[3.81.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.80.0...v3.81.0
[3.80.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.79.0...v3.80.0
[3.79.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.78.0...v3.79.0
[3.78.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.77.0...v3.78.0
[3.77.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.76.0...v3.77.0
[3.76.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.75.0...v3.76.0
[3.75.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.74.0...v3.75.0
[3.74.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.73.0...v3.74.0
[3.73.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.72.0...v3.73.0
[3.72.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.71.0...v3.72.0
[3.71.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.70.0...v3.71.0
[3.70.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.69.0...v3.70.0
[3.69.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.67.0...v3.69.0
[3.68.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.67.0...v3.68.0
[3.67.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.66.0...v3.67.0
[3.66.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.65.0...v3.66.0
[3.65.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.64.0...v3.65.0
[3.64.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.63.0...v3.64.0
[3.63.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.62.0...v3.63.0
[3.62.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.61.0...v3.62.0
[3.61.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.60.0...v3.61.0
[3.60.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.59.0...v3.60.0
[3.59.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.58.0...v3.59.0
[3.58.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.57.0...v3.58.0
[3.57.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.56.0...v3.57.0
[3.56.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.55.0...v3.56.0
[3.55.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.54.0...v3.55.0
[3.54.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.53.0...v3.54.0
[3.53.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.52.2...v3.53.0
[3.52.2]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.52.1...v3.52.2
[3.52.1]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.52.0...v3.52.1
[3.52.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.51.0...v3.52.0
[3.51.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.50.0...v3.51.0
[3.50.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.49.0...v3.50.0
[3.49.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.48.0...v3.49.0
[3.48.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.47.0...v3.48.0
[3.47.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.46.0...v3.47.0
[3.46.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.45.0...v3.46.0
[3.45.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.44.0...v3.45.0
[3.44.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.43.0...v3.44.0
[3.43.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.42.0...v3.43.0
[3.42.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.41.0...v3.42.0
[3.41.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.40.0...v3.41.0
[3.40.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.39.0...v3.40.0
[3.39.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.38.0...v3.39.0
[3.38.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.37.0...v3.38.0
[3.37.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.36.0...v3.37.0
[3.36.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.35.0...v3.36.0
[3.35.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.34.0...v3.35.0
[3.34.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.33.0...v3.34.0
[3.33.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.32.0...v3.33.0
[3.32.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.31.0...v3.32.0
[3.31.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.30.0...v3.31.0
[3.30.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.29.0...v3.30.0
[3.29.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.28.1...v3.29.0
[3.28.1]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.28.0...v3.28.1
[3.28.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.27.0...v3.28.0
[3.27.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.26.0...v3.27.0
[3.26.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.25.0...v3.26.0
[3.25.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.24.0...v3.25.0
[3.24.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.23.0...v3.24.0
[3.23.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.22.0...v3.23.0
[3.22.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.21.0...v3.22.0
[3.21.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.20.0...v3.21.0
[3.20.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.19.0...v3.20.0
[3.19.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.18.0...v3.19.0
[3.18.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.17.0...v3.18.0
[3.17.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.16.0...v3.17.0
[3.16.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.15.0...v3.16.0
[3.15.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.14.0...v3.15.0
[3.14.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.13.0...v3.14.0
[3.13.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.12.0...v3.13.0
[3.12.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.11.0...v3.12.0
[3.11.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.10.0...v3.11.0
[3.10.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.9.2...v3.10.0
[3.9.2]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.9.1...v3.9.2
[3.9.1]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.9.0...v3.9.1
[3.9.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.8.1...v3.9.0
[3.8.1]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.8.0...v3.8.1
[3.8.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.7.0...v3.8.0
[3.7.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.6.1...v3.7.0
[3.6.1]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.6.0...v3.6.1
[3.6.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.5.0...v3.6.0
[3.5.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.4.6...v3.5.0
[3.4.6]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.4.5...v3.4.6
[3.4.5]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.4.4...v3.4.5
[3.4.4]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.4.3...v3.4.4
[3.4.3]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.4.2...v3.4.3
[3.4.2]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.4.1...v3.4.2
[3.4.1]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.4.0...v3.4.1
[3.4.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.3.1...v3.4.0
[3.3.1]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.3.0...v3.3.1
[3.3.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.2.0...v3.3.0
[3.2.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.1.0...v3.2.0
[3.1.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.0.1...v3.1.0
[3.0.1]: https://github.com/bitmovin/bitmovin-player-ui/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.18.0...v3.0.0
[2.18.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.17.1...v2.18.0
[2.17.1]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.17.0...v2.17.1
[2.17.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.16.0...v2.17.0
[2.16.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.15.0...v2.16.0
[2.15.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.14.0...v2.15.0
[2.14.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.13.0...v2.14.0
[2.13.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.12.1...v2.13.0
[2.12.1]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.12.0...v2.12.1
[2.12.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.11.0...v2.12.0
[2.11.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.10.5...v2.11.0
[2.10.5]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.10.4...v2.10.5
[2.10.4]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.10.3...v2.10.4
[2.10.3]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.10.2...v2.10.3
[2.10.2]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.10.1...v2.10.2
[2.10.1]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.10.0...v2.10.1
[2.10.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.9.0...v2.10.0
[2.9.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.8.3...v2.9.0
[2.8.3]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.8.2...v2.8.3
[2.8.2]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.8.1...v2.8.2
[2.8.1]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.8.0...v2.8.1
[2.8.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.7.1...v2.8.0
[2.7.1]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.7.0...v2.7.1
[2.7.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.6.0...v2.7.0
[2.6.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.5.1...v2.6.0
[2.5.1]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.5.0...v2.5.1
[2.5.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.4.0...v2.5.0
[2.4.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.3.0...v2.4.0
[2.3.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.1.1...v2.2.0
[2.1.1]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.0.4...v2.1.0
[2.0.4]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.0.3...v2.0.4
[2.0.3]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.0.2...v2.0.3
[2.0.2]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v1.0.1...v2.0.0
[1.0.1]: https://github.com/bitmovin/bitmovin-player-ui/compare/v1.0.0...v1.0.1
