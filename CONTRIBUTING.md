TypeScript Code Style
---------------------

 * Follow the `tslint` rules (`gulp lint-ts`)
 * Put single(!) blank lines between functions, classes, interfaces, etc...
 * Always add return values to functions (even if `void`)
 * No unused imports
 * Class functions should be `private` by default, `protected` or `public` only when explicitly necessary (e.g. they are actually used from somewhere else) or where it strongly makes sense
   * A public method makes sense if it relates to core functionality of a component, e.g. `getText()`/`setText(text)` on a `Label` (the label's purpose is to display text, so it makes sense to be accessible from outside)
   * A public method does not make sense if the function `doSomeMagicWhichNobodyUnderstands()` does specific things that are needed for the component to do what it does (e.g. `renderText()` in a label which should be implicitly called by `setText(text)` but never explicitly from outside)
 * Public functions should be documented with a description that explains *what* it does
 * Every code block that does not obviously explain itself should be commented with an explanation of *why* and *what* it does
 
SASS SCSS Code Style
--------------------

 * Follow the `sass-lint` rules (`gulp lint-sass`)
 * Browser specific hacks must be commented with an explanation *why* it is required and *what* it does

Component Architecture
----------------------

 * Components are named in *PascalCase* and should be suffixed with their parent component's name
   * Excluded from this rule are (a) direct children of base components (`Component`, `Container`) and (b) components with extremely specialized functionality that do not conceptually extend the base class
   * Examples:
     * `class CloseButton extends Button`
     * `class ToggleButton extends Button`
     * `class PlaybackToggleButton extends ToggleButton`
     * `class ButtonComponent extends Component` => `class Button extends Component` (exception (a))
     * `class ControlBarContainer extends Container` => `class ControlBar extends Container` (exception (a))
     * `class WatermarkClickOverlay extends ClickOverlay` => `class Watermark extends ClickOverlay` (exception (b))
 * Every component gets its own `.ts` and optionally `.scss` file named after the component in lowercase
   * Example: `class CloseButton` => `closebutton.ts`, `_closebutton.scss`
 * Components always have a configuration interface that is either inherited from the parent or specifically defined for the component
   * Specific config interfaces are named after the component plus `Config` suffix: `Button` => `ButtonConfig`
   * Inherited config interface: `PlaybackToggleButton` uses the parent's `PlaybackToggleButtonConfig`
   * Config objects are only used from configuration from the outside and default configuration within the constructor
   * Config objects must not be used to store internal state
 * Subcomponents can be defined in the same file as the main component
   * A component is a subcomponent of a main component if the main component requires the subcomponent to fulfil its purpose and if the subcomponent is only used by the main component and no other
   * Example: `SettingsPanel` (main component) consists of multiple `SettingsPanelItem` subcomponents
 * Components must not have any explicit relations with other components except generic framework components and subcomponents and must be useable independently of other components
   * Example: `SettingsPanel` can use the types `Button` (generic framework component) and `SettingsPanelItem` (subcomponent), but not `Watermark` (`SettingsPanel` would break if `Watermark` was removed)
 * Exported components must be registered into the global namespace in `main.ts` to make the accessible in JavaScript

Pull Requests
-------------

This project applies the GitFlow branching model. Please submit bugfix pull requests against the `master` branch if they concern the current release, else against the `develop` branch. Feature branches always go against the `develop` branch. 

Before creating a pull request, please
 * make sure all guidelines are followed
 * add an appropriate entry to the [CHANGELOG](CHANGELOG.md)
 * make sure that `gulp lint` is free of warnings and errors
 * make sure your branch is free of merge conflicts
 