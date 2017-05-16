import {FontColorSelectBox} from './fontcolorselectbox'
import {FontOpacitySelectBox} from './fontopacityselectbox'
import {BackgroundColorSelectBox} from './backgroundcolorselectbox'
import {BackgroundOpacitySelectBox} from './backgroundopacityselectbox'
import {FontFamillySelectBox} from './fontfamillyselectbox'
import {CharacterEdgeSelectBox} from './characteredgeselectbox'
import {SettingsPanelItem} from '../settingspanel'
import {SubtitleOverlay} from '../subtitleoverlay'

let GetSubtitleOptionList = (overlay: SubtitleOverlay) => {
  let SubtitleOptionList = [
    new SettingsPanelItem('Font', new FontColorSelectBox({}, overlay)),
    new SettingsPanelItem('Font opacity', new FontOpacitySelectBox({}, overlay)),
    new SettingsPanelItem('Background', new BackgroundColorSelectBox({}, overlay)),
    new SettingsPanelItem('Background', new BackgroundOpacitySelectBox({}, overlay)),
    new SettingsPanelItem('Font', new FontFamillySelectBox({}, overlay)),
    new SettingsPanelItem('Edge', new CharacterEdgeSelectBox({}, overlay)),
  ]

  for (let option of SubtitleOptionList) {
    option.hide()
  }

  return SubtitleOptionList
}

export default GetSubtitleOptionList
