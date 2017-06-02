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
import {SubtitlePanelCloser} from '../subtitlesettingtoggle'
import {Component, ComponentConfig} from '../component'

// Helper function since the subtitle option panel should not change
let GetSubtitleSettingList = (overlay: SubtitleOverlay): Component<ComponentConfig>[] => {
    return [
        new SettingsPanelItem('Font', new FontColorSelectBox({}, overlay)),
        new SettingsPanelItem('Font opacity', new FontOpacitySelectBox({}, overlay)),
        new SettingsPanelItem('Background', new BackgroundColorSelectBox({}, overlay)),
        new SettingsPanelItem('Background', new BackgroundOpacitySelectBox({}, overlay)),
        new SettingsPanelItem('Window', new WindowColorSelectBox({}, overlay)),
        new SettingsPanelItem('Window', new WindowOpacitySelectBox({}, overlay)),
        new SettingsPanelItem('Font', new FontFamillySelectBox({}, overlay)),
        new SettingsPanelItem('Font size', new FontSizeSelectBox({}, overlay)),
        new SettingsPanelItem('Edge', new CharacterEdgeSelectBox({}, overlay)),
        new SubtitlePanelCloser()
    ]
};

export default GetSubtitleSettingList
