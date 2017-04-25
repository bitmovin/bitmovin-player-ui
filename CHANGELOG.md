# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) 
and this project adheres to [Semantic Versioning](http://semver.org/).

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

[2.0.3]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.0.2...v2.0.3
[2.0.2]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/bitmovin/bitmovin-player-ui/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/bitmovin/bitmovin-player-ui/compare/v1.0.1...v2.0.0
[1.0.1]: https://github.com/bitmovin/bitmovin-player-ui/compare/v1.0.0...v1.0.1