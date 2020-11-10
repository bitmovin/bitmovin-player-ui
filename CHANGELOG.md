# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) 
and this project adheres to [Semantic Versioning](http://semver.org/).

## [3.19.0]

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
