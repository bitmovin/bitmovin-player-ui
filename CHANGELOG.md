# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) 
and this project adheres to [Semantic Versioning](http://semver.org/).

## [develop]

### Changed
- Consistent UI's prepared state detection by only looking at the player's ready state

## [2.12.1]

### Fixed
- Flickering heights of `SeekBar` and `VolumeSlider` bar indicators
- "Concurrent" modification of event handlers in `EventDispatcher` when a handler is unsubscribed by a handler

## [2.12.0]

### Changed
- Execute volume control availability test on dummy media element to prevent unexpected interference with muted autoplay

### Fixed
- Positioning of `SeekBar` markers was broken due to style changes in 2.11.0

## [2.11.0]

### Added
- Update `SeekBar` playback position of live streams with DVR window while playback is paused

### Changed
- Switch off live edge indicator in `PlaybackTimeLabel` when a live stream is paused

### Fixed
- Stop `SeekBar` smooth playback position updates on `ON_PLAYBACK_FINISHED`
- Centered `SeekBar` and `VolumeSlider` drag handles and make sure that all layers of the underlying bar have the same height

## [2.10.5]

### Changed
- `PlaybackToggleButton` now also listens to `ON_SOURCE_LOADED` and `ON_SOURCE_UNLOADED` to properly update the playback state when the source changes
- Update package dependencies
- Apply CEA-608 style to subtitles before they are added to the DOM to avoid "style flickering"

### Fixed
- Unnecessary line breaks in CEA-608 texts

## [2.10.4]

### Changed
- Remove `nowrap` from CEA-608 style to correctly render multiline cues
- `PlaybackToggleButton` now also listens to `ON_PLAYING` in addition to `ON_PLAY`

## [2.10.3]

### Fixed
- Handling of whitespaces in CEA-608 texts

## [2.10.2]

### Changed
- Rewritten CEA-608 text layouting
- Greatly simplified CEA-608 CSS style (`.{prefix}-ui-subtitle-overlay.{prefix}-cea608`)
- Calculate CEA-608 font size only with active CEA-608 cues

### Fixed
- Overlapping CEA-608 texts with large player aspect ratios

## [2.10.1]

### Changed
- Removed `VolumeControlButton`'s `VolumeSlider` slide-in animation in the legacy skin to fix the slider knob at 100% bug

### Fixed
- Vertical `VolumeSlider` knob in legacy skin was not visible when set to a low volume 
- Legacy skin's `VolumeSlider` knob was always rendered at 100% when appearing after being hidden
- Avoid `ItemSelectionList` DOM recreation on item selection to avoid unexpected events (e.g. `mouseenter`)

## [2.10.0]

### Added
- Update `AudioQualitySelectBox`/`VideoQualitySelectBox` entries when the period of a source changes

### Changed
- Export bundled UI (`bitmovinplayer-ui.js`) as UMD module (instead of global module)

### Fixed
- Fix `Uncaught TypeError` when `require`ing UI before player
- Don't write UI into global namespace (`bitmovin.playerui`) when loaded as module with `require`

## [2.9.0]

### Added
- Support CEA-608 subtitle positioning
- Added `ui` issuer parameter to all applicable player API calls (seek, timeshift, mute, unmute, setVolume)

### Changed
- Unified player API issuer parameter to always be `ui` instead of `ui-{componentName}`

### Fixed
- Select correct audio track after updating the items in `AudioTrackSelectBox`

## [2.8.3]

### Changed
- Use new quality change API in `AudioQualitySelectBox` and `VideoQualitySelectBox` for player >= 7.3.1 (selection is now synced with player-API `set[Audio|Video]Quality` calls)

## [2.8.2]

Release of this version went wrong and it was unpublished from NPM.

### Fixed
- Fix `animate-slide-in-from-bottom` SCSS mixin (fixes missing `VolumeSlider` slide-in animation of `VolumeControlButton` in the legacy skin)
- Fire `ON_READY` event if UI is loaded after player is ready to initialize all components correctly

## [2.8.1]

### Fixed
- Early quality selection in `AudioQualitySelectBox`/`VideoQualitySelectBox` before `ON_READY` broke players <= 7.2.5

## [2.8.0]

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

## [2.7.1]

### Changed
- Throttled high-frequency API calls to the player from the `VolumeSlider` and `SeekBarLabel`

## [2.7.0]

### Added
- Add support for FCC compliant closed captions. Adds options on how captions are displayed, and a SubtitleSettingsPanel with the possibility to update the settings while playing the video.
- Add UI version property to global namespace (`bitmovin.playerui.version`)
- Add `UIConfig#container` config property to specify a custom place in the DOM where the UI will be put into. Can be used to place it somewhere else beside the default player figure.

## [2.6.0]

### Added
- Add an option to keep the UI always visible by setting the `UIContainerConfig#hideTimeout` to -1

### Changed
- Thumbnail size is no longer determined by the physical image size and can now be arbitrarily set by CSS

## [2.5.1]

No functional changes. Improves player API declarations, code linting configuration, and adds [contribution guidelines](CONTRIBUTING.md).

## [2.5.0]

### Added
- Add `UIConditionContext#adClientType` to be able to switch to different UI variants for different ad types
- Add `UIConditionContext#isPlaying` and resolve UI variants on `ON_PLAY` and `ON_PAUSED` to be able to switch between different UI variants for playing and paused states

### Changed
- NPM entry point changed from browserified standalone distributable file to CommonJS module (NPM package can now be used with Node and Browserify out-of-the-box)
- Deprecated `UIConditionContext#isAdWithUI`, use `adClientType` instead (`isAdWithUI` equals `context.adClientType === 'vast'`)

### Fixed
- Stop rendering loop of the `ErrorMessageOverlay` background canvas when UI is released
- Fix wrapped control bar in modern skin on iOS 8.2

## [2.4.0]

### Changed
- Resolve UI variants on `ON_READY`
- Improved UI variant switching by detecting the end of an ad when loading a new source during ad playback

### Fixed
- Fix subtitle line breaking

## [2.3.0]

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

## [2.2.0]

### Added
- Add `Container#removeComponents()` to remove all child components of a container
- Display multiple subtitle cues in parallel in `SubtitleOverlay`
- Add `getText()` method, `isEmpty()` method, and `onTextChanged` event to `Label`
- Add `TitleBarConfig#keepHiddenWithoutMetadata` to keep `TitleBar` hidden if metadata labels are empty

### Changed
- Do not display `TitleBar` in Cast UI when it does not contain any metadata (title/description)

### Fixed
- Clear `SubtitleOverlay` when playback is finished

## [2.1.1]

### Fixed
- Update playback position / volume indicator position in `SeekBar`/`VolumeSlider` when component is shown

## [2.1.0]

### Added
- Add `remote-control` marker class to `UIContainer` that is applied during an active remote control session (e.g. Cast session)
- Display play/pause button in smallscreen UI during an active remote control session (e.g. Cast session)

### Changed
- Adjust `CastStatusOverlay` font size and remove Cast icon (makes place for the playback toggle) in smallscreen UI
- Move `PlaybackToggleOverlay` over `CastStatusOverlay` in smallscreen UI to enable playback toggling

### Fixed
- Fix hiding of `HugePlaybackToggleButton` during Cast session initialization

## [2.0.4]

### Added
- Add `ErrorMessageOverlayConfig#messages` to translate and customize error messages in the `ErrorMessageOverlay`

## [2.0.3]

No functional changes. Fixes typo in the changelog.

## [2.0.2]

No functional changes. Adds a `prepublish` script to the NPM package so an incomplete version like `2.0.0` cannot happen to be published again.

## [2.0.1]

No functional changes. Fixes an incomplete NPM package published for `2.0.0`, which has been unpublished.

## [2.0.0]

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

## [1.0.1] - 2017-02-10
### Fixed
- Fix thumbnail preview on the seekbar label

## 1.0.0 - 2017-02-03
- First release

[develop]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.12.1...develop
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
