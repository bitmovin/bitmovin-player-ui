import {Label} from '../label';
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
import {Component, ComponentConfig} from '../component';

// Helper function since the subtitle option panel should not change
let GetSubtitleSettingList = (overlay: SubtitleOverlay): Component<ComponentConfig>[] => {
    return [
        new SettingsPanelItem(new FontFamilySelectBox({overlay: overlay}), {components: [new Label({text: 'Font family'})]}),
        new SettingsPanelItem(new FontColorSelectBox({overlay: overlay}), {components: [new Label({text: 'Font color'})]}),
        new SettingsPanelItem(new FontSizeSelectBox({overlay: overlay}), {components: [new Label({text: 'Font size'})]}),
        new SettingsPanelItem(new FontOpacitySelectBox({overlay: overlay}), {components: [new Label({text: 'Font opacity'})]}),
        new SettingsPanelItem(new CharacterEdgeSelectBox({overlay: overlay}), {components: [new Label({text: 'Character edge'})]}),
        new SettingsPanelItem(new BackgroundColorSelectBox({overlay: overlay}), {components: [new Label({text: 'Background color'})]}),
        new SettingsPanelItem(new BackgroundOpacitySelectBox({overlay: overlay}), {components: [new Label({text: 'Background opacity'})]}),
        new SettingsPanelItem(new WindowColorSelectBox({overlay: overlay}), {components: [new Label({text: 'Window color'})]}),
        new SettingsPanelItem(new WindowOpacitySelectBox({overlay: overlay}), {components: [new Label({text: 'Window opacity'})]}),
    ];
};

export default GetSubtitleSettingList;
