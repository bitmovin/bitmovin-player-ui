import { SettingsPanelNavigationGroup } from '../../src/ts/spatialnavigation/SettingsPanelNavigationGroup';
import { SettingsPanel, SettingsPanelConfig } from '../../src/ts/components/settings/SettingsPanel';
import { SettingsPanelPage } from '../../src/ts/components/settings/SettingsPanelPage';
import { SettingsPanelItem, SettingsPanelItemConfig } from '../../src/ts/components/settings/SettingsPanelItem';
import { SettingsPanelSelectOption } from '../../src/ts/components/settings/SettingsPanelSelectOption';
import { SettingsPanelPageBackButton } from '../../src/ts/components/settings/SettingsPanelPageBackButton';
import { SelectBox } from '../../src/ts/components/settings/SelectBox';
import { Label, LabelConfig } from '../../src/ts/components/labels/Label';
import { Button, ButtonConfig } from '../../src/ts/components/buttons/Button';
import { MockHelper } from '../helper/MockHelper';

// Real components are used deliberately: which children count as navigation targets depends on their
// configured tabIndex and visibility.

describe('SettingsPanelNavigationGroup', () => {
  let settingsPanel: SettingsPanel<SettingsPanelConfig>;
  let page: SettingsPanelPage;

  const createGroup = (...items: SettingsPanelItem<SettingsPanelItemConfig>[]) => {
    // Configuring adds the setting components of the items as their children, like in a running UI.
    const playerMock = MockHelper.getPlayerMock();
    const uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
    items.forEach(item => item.configure(playerMock, uiInstanceManagerMock));
    page = new SettingsPanelPage({ components: items });
    settingsPanel = new SettingsPanel({ components: [page] });
    return new SettingsPanelNavigationGroup(settingsPanel);
  };

  const createSelectOption = (value: string) =>
    new SettingsPanelSelectOption({ label: value, settingComponent: new SelectBox(), settingsValue: value });

  describe('getComponents', () => {
    describe('when a title row only contains a label (e.g. a list box title)', () => {
      let titleLabel: Label<LabelConfig>;
      let firstOption: SettingsPanelSelectOption;
      let navigationGroup: SettingsPanelNavigationGroup;

      beforeEach(() => {
        titleLabel = new Label<LabelConfig>({ text: 'Subtitles' });
        firstOption = createSelectOption('off');
        navigationGroup = createGroup(
          new SettingsPanelItem({ label: titleLabel, isSetting: false }),
          firstOption,
          createSelectOption('en'),
        );
      });

      it('should not include the title label', () => {
        expect(navigationGroup.getComponents()).not.toContain(titleLabel);
      });

      it('should focus the first option first', () => {
        navigationGroup.focusFirstComponent();

        expect(navigationGroup.getActiveComponent()).toBe(firstOption);
      });
    });

    describe('when a title row contains a back button (e.g. a sub-page title)', () => {
      it('should include the back button and other focusable children', () => {
        const backButton = new SettingsPanelPageBackButton({
          text: 'Back',
          container: new SettingsPanel({ components: [new SettingsPanelPage({})] }),
        });
        const rightButton = new Button<ButtonConfig>({});
        const navigationGroup = createGroup(
          new SettingsPanelItem({ label: backButton, settingComponent: rightButton, isSetting: false }),
          createSelectOption('auto'),
        );

        const components = navigationGroup.getComponents();

        expect(components).toContain(backButton);
        expect(components).toContain(rightButton);
      });
    });

    describe('when a setting row contains a label and a setting component', () => {
      it('should include both, regardless of their tabIndex', () => {
        const label = new Label<LabelConfig>({ text: 'Quality' });
        const selectBox = new SelectBox();
        const navigationGroup = createGroup(new SettingsPanelItem({ label, settingComponent: selectBox }));

        const components = navigationGroup.getComponents();

        expect(components).toContain(label);
        expect(components).toContain(selectBox);
      });
    });
  });
});
