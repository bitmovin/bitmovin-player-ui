# Bitmovin Player UI
The Bitmovin Adaptive Streaming Player UI

Read more about the usage, as well as other important information on Bitmovin's Adaptive Streaming Player itself at https://bitmovin.com/ and https://bitmovin.com/player-documentation/.

## Getting Started

 1. Install node.js
 2. Install Gulp: `npm install --global gulp-cli`
 3. Install required npm packages: `npm install`
 4. Run Gulp tasks (`gulp --tasks`)
  * `gulp` to build project into `dist` directory
  * `gulp watch` to develop and rebuild changed files automatically
  * `gulp serve` to open test page in browser, build and reload changed files automatically
  * `gulp lint` to lint TypeScript and SASS files
  * `gulp build-prod` to build project with minified files into `dist` directory
  
To just take a look at the project, also run `gulp serve`.

## Introduction

This repository contains the Bitmovin Player UI framework introduced with the 7.0 release. 
It is designed as a flexible and modularized layer on the player API that replaces the old integrated monolithic UI, enabling customers and users of the player to easily customize the UI to their needs in design, structure, and functionality. It makes it extremely easy and straightforward to add additional control components and we encourage our users to proactively contribute to our codebase.

The framework basically consists of a `UIManager` that handles initialization and destruction of the UI, and components extending the `Component` base class. Components provide specific functionality (e.g. `PlaybackToggleButton`, `ControlBar`, `SeekBar`, `SubtitleOverlay`) and usually consist of two files, a TypeScript `.ts` file containing control code and API interaction with the player, and a SASS `.scss` file containing the visual style.

A UI is defined by a tree of components, making up the UI *structure*, and their visuals styles, making up the UI *skin*. The root of the structure always starts with a `UIContainer` (or a subclass, e.g. `CastUIContainer`), which is a subclass of `Container` and can contain other components, like any other components extending this class (usually layout components, e.g. `ControlBar`). Components that do not extend the `Container` cannot contain other components and therefore make up the leaves of the UI tree.

## Using a custom UI

To use the player with a custom UI, you need to deactivate the built-in UI and attach your own
UI with the `UIManager`. Also make sure to include your skin styles.

```js
// Player config according to https://bitmovin.com/player-documentation/player-configuration/
var config = {
    key: 'YOUR KEY HERE',
    source: {
      ...
    },
    style: {
        ux: false // disables the built-in UI
    }
};

bitmovin.player('player-id').setup(config).then(function (player) {
  // Setup UI structure
  var myCustomUiStructure = new UIContainer({
    components: [
      // other UI components
    ]
  });

  var myCustomUiManager = new bitmovin.playerui.UIManager(player, ui, null);
});
```
