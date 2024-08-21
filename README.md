# Bitmovin Player UI [![npm version](https://badge.fury.io/js/bitmovin-player-ui.svg)](https://badge.fury.io/js/bitmovin-player-ui) [![Build Status](https://app.travis-ci.com/bitmovin/bitmovin-player-ui.svg?branch=develop)](https://app.travis-ci.com/bitmovin/bitmovin-player-ui)

This repository contains the Bitmovin Player UI framework.
It is designed as a flexible and modularized layer on the player API, enabling customers and users of the player to easily customize the UI to their needs in design, structure, and functionality. It makes it extremely easy and straightforward to add additional control components and we encourage our users to proactively contribute to our codebase.

Read more about the Framework, its usage and customization possibilities in our [developer documentation](https://developer.bitmovin.com/playback/docs/bitmovin-player-ui).

## Installation

The UI framework is also available through the following distribution channels:

### CDN

The UI framework and default skin bundled with the latest player release are always available via CDN. This is the recommended way if you just want to work with the predefined UI components. All components will be available in the `bitmovin.playerui` namespace.

 * JavaScript library: `//cdn.bitmovin.com/player/web/8/bitmovinplayer-ui.js` 
 * CSS default skin: `//cdn.bitmovin.com/player/web/8/bitmovinplayer-ui.css`

### NPM

The UI framework is also available in the NPM repository and comes with all source and distributable files, JavaScript modules and TypeScript type definitions.

 * `npm install bitmovin-player-ui`


## Getting Started with Development

 0. Clone Git repository
 1. Install node.js
 2. Install Gulp: `npm install --global gulp-cli`
 3. Install required npm packages: `npm install`
 4. Run Gulp tasks (`gulp --tasks`)
  * `gulp` to build project into `dist` directory
  * `gulp watch` to develop and rebuild changed files automatically
  * `gulp serve` to open test page in browser, build and reload changed files automatically
  * `gulp lint` to lint TypeScript and SASS files
  * `gulp build-prod` to build project with minified files into `dist` directory
  
To take a look at the project, run `gulp serve`. For changes, check our [CHANGELOG](CHANGELOG.md). This UI framework version is for player v8. The UI framework for player v7 can be found in the `support/v2.x` branch.

## UI Playground

The UI playground can be launched with `gulp serve` and opens a page in a local browser window. On this page, you can switch between different sources and UI styles, trigger API actions and observe events.

This page uses BrowserSync to sync the state across multiple tabs and browsers and recompiles and reloads automatically files automatically when any `.scss` or `.ts` files are modified. It makes a helpful tool for developing and testing the UI.

## Contributing

Pull requests are welcome! Please check the [contribution guidelines](CONTRIBUTING.md).
