import type { PlayerAPI } from 'bitmovin-player';

import { MockHelper } from '../../../helper/MockHelper';
import type { UIInstanceManager } from '../../../../src/ts/UIManager';
import type { SubtitleOverlay } from '../../../../src/ts/components/overlays/SubtitleOverlay';
import type { SubtitleSettingsManager } from '../../../../src/ts/utils/SubtitleSettingsManager';
import {
  SubtitleSettingSelectBox,
  SubtitleSettingSelectBoxConfig,
} from '../../../../src/ts/components/settings/subtitlesettings/SubtitleSettingSelectBox';
import { FontSizeSelectBox } from '../../../../src/ts/components/settings/subtitlesettings/FontSizeSelectBox';
import { FontStyleSelectBox } from '../../../../src/ts/components/settings/subtitlesettings/FontStyleSelectBox';
import { FontFamilySelectBox } from '../../../../src/ts/components/settings/subtitlesettings/FontFamilySelectBox';
import { FontColorSelectBox } from '../../../../src/ts/components/settings/subtitlesettings/FontColorSelectBox';
import { FontOpacitySelectBox } from '../../../../src/ts/components/settings/subtitlesettings/FontOpacitySelectBox';
import { CharacterEdgeSelectBox } from '../../../../src/ts/components/settings/subtitlesettings/CharacterEdgeSelectBox';
import { CharacterEdgeColorSelectBox } from '../../../../src/ts/components/settings/subtitlesettings/CharacterEdgeColorSelectBox';
import { BackgroundColorSelectBox } from '../../../../src/ts/components/settings/subtitlesettings/BackgroundColorSelectBox';
import { BackgroundOpacitySelectBox } from '../../../../src/ts/components/settings/subtitlesettings/BackgroundOpacitySelectBox';
import { WindowColorSelectBox } from '../../../../src/ts/components/settings/subtitlesettings/WindowColorSelectBox';
import { WindowOpacitySelectBox } from '../../../../src/ts/components/settings/subtitlesettings/WindowOpacitySelectBox';
import type { DOM } from '../../../../src/ts/DOM';

type BoxCtor = new (config: SubtitleSettingSelectBoxConfig) => SubtitleSettingSelectBox;

interface BoxCase {
  name: string;
  Box: BoxCtor;
  setPersisted: (sm: SubtitleSettingsManager) => void;
  /** null = paired box that does not drive its own overlay class */
  expectedClassSuffix: string | null;
}

const cases: BoxCase[] = [
  {
    name: 'FontSizeSelectBox',
    Box: FontSizeSelectBox,
    setPersisted: sm => {
      sm.fontSize.value = '400';
    },
    expectedClassSuffix: '-fontsize-400',
  },
  {
    name: 'FontStyleSelectBox',
    Box: FontStyleSelectBox,
    setPersisted: sm => {
      sm.fontStyle.value = 'italic';
    },
    expectedClassSuffix: '-fontstyle-italic',
  },
  {
    name: 'FontFamilySelectBox',
    Box: FontFamilySelectBox,
    setPersisted: sm => {
      sm.fontFamily.value = 'monospacedserif';
    },
    expectedClassSuffix: '-fontfamily-monospacedserif',
  },
  {
    name: 'FontColorSelectBox',
    Box: FontColorSelectBox,
    setPersisted: sm => {
      sm.fontColor.value = 'green';
      sm.fontOpacity.value = '100';
    },
    expectedClassSuffix: '-fontcolor-green100',
  },
  {
    name: 'FontOpacitySelectBox',
    Box: FontOpacitySelectBox,
    setPersisted: sm => {
      sm.fontOpacity.value = '75';
    },
    expectedClassSuffix: null,
  },
  {
    name: 'CharacterEdgeSelectBox',
    Box: CharacterEdgeSelectBox,
    setPersisted: sm => {
      sm.characterEdge.value = 'raised';
      sm.characterEdgeColor.value = 'white';
    },
    expectedClassSuffix: '-characteredge-raised-white',
  },
  {
    name: 'CharacterEdgeColorSelectBox',
    Box: CharacterEdgeColorSelectBox,
    setPersisted: sm => {
      sm.characterEdgeColor.value = 'red';
    },
    expectedClassSuffix: null,
  },
  {
    name: 'BackgroundColorSelectBox',
    Box: BackgroundColorSelectBox,
    setPersisted: sm => {
      sm.backgroundColor.value = 'black';
      sm.backgroundOpacity.value = '50';
    },
    expectedClassSuffix: '-bgcolor-black50',
  },
  {
    name: 'BackgroundOpacitySelectBox',
    Box: BackgroundOpacitySelectBox,
    setPersisted: sm => {
      sm.backgroundOpacity.value = '25';
    },
    expectedClassSuffix: null,
  },
  {
    name: 'WindowColorSelectBox',
    Box: WindowColorSelectBox,
    setPersisted: sm => {
      sm.windowColor.value = 'blue';
      sm.windowOpacity.value = '100';
    },
    expectedClassSuffix: '-windowcolor-blue100',
  },
  {
    name: 'WindowOpacitySelectBox',
    Box: WindowOpacitySelectBox,
    setPersisted: sm => {
      sm.windowOpacity.value = '50';
    },
    expectedClassSuffix: null,
  },
];

describe('subtitle setting select boxes persisted values', () => {
  let playerMock: PlayerAPI;
  let uiManagerMock: UIInstanceManager;
  let settingsManager: SubtitleSettingsManager;
  let overlayDom: jest.Mocked<DOM>;
  let overlay: SubtitleOverlay;
  let addClassSpy: jest.SpyInstance;

  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiManagerMock = MockHelper.getUiInstanceManagerMock();
    settingsManager = uiManagerMock.getSubtitleSettingsManager();
    overlayDom = MockHelper.generateDOMMock();
    addClassSpy = jest.spyOn(overlayDom, 'addClass');
    overlay = {
      getDomElement: () => overlayDom,
      filterFontSizeOptions: () => true,
    } as unknown as SubtitleOverlay;
  });

  it.each(cases)(
    '$name applies its persisted value to the overlay on configure',
    ({ Box, setPersisted, expectedClassSuffix }) => {
      setPersisted(settingsManager);

      new Box({ overlay }).configure(playerMock, uiManagerMock);

      if (expectedClassSuffix === null) {
        // Paired box: it has no overlay class of its own; its value participates
        // via the partner color/edge box's combined class, not via this one.
        expect(addClassSpy).not.toHaveBeenCalled();
      } else {
        expect(addClassSpy).toHaveBeenCalledWith(expect.stringContaining(expectedClassSuffix));
      }
    },
  );

  it.each(cases)('$name does not touch the overlay when no value is persisted', ({ Box }) => {
    new Box({ overlay }).configure(playerMock, uiManagerMock);

    expect(addClassSpy).not.toHaveBeenCalled();
  });
});
