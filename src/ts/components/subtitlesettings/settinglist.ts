import {SubtitleSettingConfig} from './subtitlesetting';
import {FontColorSelectBox} from './fontcolorselectbox';
import {FontOpacitySelectBox} from './fontopacityselectbox';
import {FontFamilySelectBox} from './fontfamilyselectbox';
import {FontSizeSelectBox} from './fontsizeselectbox';
import {BackgroundColorSelectBox} from './backgroundcolorselectbox';
import {BackgroundOpacitySelectBox} from './backgroundopacityselectbox';
import {WindowColorSelectBox} from './windowcolorselectbox';
import {WindowOpacitySelectBox} from './windowopacityselectbox';
import {CharacterEdgeSelectBox} from './characteredgeselectbox';
import {SettingsPanelItem} from '../settingspanel';
import {SubtitleOverlay} from '../subtitleoverlay';
import {SubtitlePanelCloser} from '../subtitlesettingtoggle';
import {Component, ComponentConfig} from '../component';

// Helper function since the subtitle option panel should not change
let GetSubtitleSettingList = (overlay: SubtitleOverlay): Component<ComponentConfig>[] => {
    return [
        new SettingsPanelItem('Font family', new FontFamilySelectBox({overlay: overlay})),
        new SettingsPanelItem('Font color', new FontColorSelectBox({overlay: overlay})),
        new SettingsPanelItem('Font size', new FontSizeSelectBox({overlay: overlay})),
        new SettingsPanelItem('Font opacity', new FontOpacitySelectBox({overlay: overlay})),
        new SettingsPanelItem('Character edge', new CharacterEdgeSelectBox({overlay: overlay})),
        new SettingsPanelItem('Background color', new BackgroundColorSelectBox({overlay: overlay})),
        new SettingsPanelItem('Background opacity', new BackgroundOpacitySelectBox({overlay: overlay})),
        new SettingsPanelItem('Window color', new WindowColorSelectBox({overlay: overlay})),
        new SettingsPanelItem('Window opacity', new WindowOpacitySelectBox({overlay: overlay})),
        new SubtitlePanelCloser()
    ]
};

export default GetSubtitleSettingList
