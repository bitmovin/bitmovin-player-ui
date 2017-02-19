# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) 
and this project adheres to [Semantic Versioning](http://semver.org/).

## Unreleased
### Added
- Add `AirPlayToggleButton` for AirPlay support on MacOS and iOS (player 7.1+)
- Add `PictureInPictureToggleButton` for picture-in-picture support on MacOS and iOS (player 7.1+)
- Add dynamic switching between different UIs based on various context properties (screen size, ads, mobile, fullscreen)
  - Add new `UIManager` constructor `(player: Player, uiVariants: UIVariant[], config?: UIConfig)` for dynamic switching
  - Add new `UIManager` constructor `(player: Player, ui: UIContainer, config?: UIConfig)` for simple cases with only one UI instance
  - Automatically display smallscreen UI on mobile devices in default modern UI
- Read metadata (title/description) from player source config if metadata in UIConfig is empty
- Refresh metadata when a new source is loaded into the player
- Add `release()` method to components to release resources and dependencies created during `configure(...)`
- Add `onConfigured` event to `UIManager` which gets fired once UI is ready (configured and added to DOM)
- Detect illegal circular references in UI component tree and throw error
- Add `VolumeSliderConfig#hideIfVolumeControlProhibited` flag to automatically hide the volume slider on platforms which prohibit programmatic volume control (currently only iOS)
- Add mouse hover-state to `Component`
  - `isHovered()` returns the current hover-state
  `onHoverChanged` event with `ComponentHoverChangedEventArgs` is fired when the hover state changes
- Add `Spacer` component that just takes up space

### Changed
- Update Cast support for new Cast implementation in player 7.1
- Permanently display UI during a Cast session
- No more use of the player's global namespace
- Hide error overlay when a new source is loaded
- Do not attempt to show/hide components if they are already in the target state
- Display stop icon instead of pause icon on the `PlaybackToggleButton` for live streams without timeshift
- UI is no longer hidden while a control in the controlbar is hovered

### Removed
- Remove play/pause icon animations in Cast receiver UI due to low rendering performance on Chromecast devices
- Remove Cast workarounds/hacks required for old Cast implementation in player 7.0
- Remove seek-before-play workaround (now directly supported by player 7.1)

### Fixed
- Fix seekbar position indicator when seeking before playback
- Fix unloading/releasing of UI
- Fix wrong volume slider / seekbar positioning on UI startup
- Fix missing component exports to global JS namespace
- Fix timeshift support on live streams where timeshifting is not available from the beginning

### Deprecated
- Deprecated `UIManager` constructor `(player: Player, playerUi: UIContainer, adsUi: UIContainer, config?: UIConfig)`, use new constructor with `UIVariant[]` instead (will be removed with player 8.0 release)

## [1.0.1] - 2017-02-10
### Fixed
- Fix thumbnail preview on the seekbar label

## 1.0.0 - 2017-02-03
- First release

[1.0.1]: https://github.com/bitmovin/bitmovin-player-ui/compare/v1.0.0...v1.0.1