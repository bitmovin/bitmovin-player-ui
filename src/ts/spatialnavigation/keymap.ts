import { Action, Direction, KeyMap } from './types';
import { BrowserUtils } from '../browserutils';

const TizenKeyMap = {
  isApplicable: () => BrowserUtils.isTizen,
  keyCodes: {
    // D-pad Up
    38: Direction.UP,
    // D-pad Down
    40: Direction.DOWN,
    // D-pad Left
    37: Direction.LEFT,
    // D-pad Right
    39: Direction.RIGHT,
    // D-pad OK
    13: Action.SELECT,
    // Back
    10009: Action.BACK,
  },
};

const WebOsKeyMap = {
  isApplicable: () => BrowserUtils.isWebOs,
  keyCodes: {
    // D-pad Up
    38: Direction.UP,
    // D-pad Down
    40: Direction.DOWN,
    // D-pad Left
    37: Direction.LEFT,
    // D-pad Right
    39: Direction.RIGHT,
    // D-pad OK
    13: Action.SELECT,
    // Back
    461: Action.BACK,
  },
};

const PlayStationKeyMap = {
  isApplicable: () => BrowserUtils.isPlayStation,
  keyCodes: {
    // D-pad Up
    38: Direction.UP,
    // D-pad Down
    40: Direction.DOWN,
    // D-pad Left
    37: Direction.LEFT,
    // D-pad Right
    39: Direction.RIGHT,
    // Cross
    13: Action.SELECT,
    // Circle
    27: Action.BACK,
  },
};

const AndroidKeyMap = {
  isApplicable: () => BrowserUtils.isAndroid,
  keyCodes: {
    // D-pad Up
    19: Direction.UP,
    // D-pad Down
    20: Direction.DOWN,
    // D-pad Left
    21: Direction.LEFT,
    // D-pad Right
    22: Direction.RIGHT,
    // D-pad Center
    23: Action.SELECT,
    // Enter
    66: Action.SELECT,
    // Back
    4: Action.BACK,
  },
};

const HisenseKeyMap = {
  isApplicable: () => BrowserUtils.isHisense,
  keyCodes: {
    // D-pad Up
    38: Direction.UP,
    // D-pad Down
    40: Direction.DOWN,
    // D-pad Left
    37: Direction.LEFT,
    // D-pad Right
    39: Direction.RIGHT,
    // OK
    13: Action.SELECT,
    // Back
    8: Action.BACK,
  },
};

// Default key map used on desktops
const DefaultKeyMap = {
  // Arrow Up
  38: Direction.UP,
  // Arrow Down
  40: Direction.DOWN,
  // Arrow Left
  37: Direction.LEFT,
  // Arrow Right
  39: Direction.RIGHT,
  // Enter
  13: Action.SELECT,
  // Escape
  27: Action.BACK,
};

export function getKeyMapForPlatform(): KeyMap {
  const applicableKeyMap = [
    WebOsKeyMap,
    TizenKeyMap,
    PlayStationKeyMap,
    HisenseKeyMap,
    AndroidKeyMap,
  ].find(keyMap => keyMap.isApplicable());

  if (applicableKeyMap) {
    return applicableKeyMap.keyCodes;
  } else {
    return DefaultKeyMap;
  }
}
