import {FontColorSelectBox} from './fontcolorselectbox'
import {FontOpacitySelectBox} from './fontopacityselectbox'
import {FontFamillySelectBox} from './fontfamillyselectbox'
import {FontSizeSelectBox} from './fontsizeselectbox'
import {BackgroundColorSelectBox} from './backgroundcolorselectbox'
import {BackgroundOpacitySelectBox} from './backgroundopacityselectbox'
import {WindowColorSelectBox} from './windowcolorselectbox'
import {WindowOpacitySelectBox} from './windowopacityselectbox'
import {CharacterEdgeSelectBox} from './characteredgeselectbox'
import {SettingsPanelItem} from '../settingspanel'
import {SubtitleOverlay} from '../subtitleoverlay'

let GetSubtitleOptionList = (overlay: SubtitleOverlay) => {
  let SubtitleOptionList = [
    new SettingsPanelItem('Font', new FontColorSelectBox({}, overlay)),
    new SettingsPanelItem('Font opacity', new FontOpacitySelectBox({}, overlay)),
    new SettingsPanelItem('Background', new BackgroundColorSelectBox({}, overlay)),
    new SettingsPanelItem('Background', new BackgroundOpacitySelectBox({}, overlay)),
    new SettingsPanelItem('Window', new WindowColorSelectBox({}, overlay)),
    new SettingsPanelItem('Window', new WindowOpacitySelectBox({}, overlay)),
    new SettingsPanelItem('Font', new FontFamillySelectBox({}, overlay)),
    new SettingsPanelItem('Font size', new FontSizeSelectBox({}, overlay)),
    new SettingsPanelItem('Edge', new CharacterEdgeSelectBox({}, overlay)),
  ]

  for (let option of SubtitleOptionList) {
    option.hide()
  }

  return SubtitleOptionList
}

export default GetSubtitleOptionList
