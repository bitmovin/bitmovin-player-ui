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
import { Direction } from '../../src/ts/spatialnavigation/types';

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

  const createSelectOption = (value: string) => {
    // Like in a list box, the select box lists several choices. With fewer than two, the option hides itself and can't
    // take the focus.
    const selectBox = new SelectBox();
    selectBox.addItem('off', 'off');
    selectBox.addItem('en', 'English');
    return new SettingsPanelSelectOption({ label: value, settingComponent: selectBox, settingsValue: value });
  };

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

  describe('a native select box in a custom settings panel', () => {
    // A SelectBox keeps the default tabIndex of -1 in its config, but renders a native <select> that can take the focus
    const createSettingRow = (...values: string[]) => {
      const selectBox = new SelectBox();
      values.forEach(value => selectBox.addItem(value, value));
      const row = new SettingsPanelItem({
        label: new Label<LabelConfig>({ text: 'Quality' }),
        settingComponent: selectBox,
      });
      return { selectBox, row };
    };

    const layOutAt = (component: { getDomElement(): { get(index: number): HTMLElement } }, top: number) => {
      jest.spyOn(component.getDomElement().get(0), 'getBoundingClientRect').mockReturnValue({
        top,
        bottom: top + 50,
        left: 0,
        right: 200,
        width: 200,
        height: 50,
        x: 0,
        y: top,
      } as DOMRect);
    };

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should move the focus to a visible select box with the D-pad', () => {
      const backButton = new SettingsPanelPageBackButton({
        text: 'Back',
        container: new SettingsPanel({ components: [new SettingsPanelPage({})] }),
      });
      const { selectBox, row } = createSettingRow('auto', '1080p');
      const navigationGroup = createGroup(new SettingsPanelItem({ label: backButton, isSetting: false }), row);
      document.body.appendChild(settingsPanel.getDomElement().get(0));
      layOutAt(backButton, 0);
      layOutAt(selectBox, 100);
      navigationGroup.focusFirstComponent();
      expect(navigationGroup.getActiveComponent()).toBe(backButton);

      navigationGroup.handleNavigation(Direction.DOWN);

      expect(navigationGroup.getActiveComponent()).toBe(selectBox);
      expect(document.activeElement).toBe(selectBox.getDomElement().get(0));
    });

    it('should focus a visible select box first when the panel opens', () => {
      const { selectBox, row } = createSettingRow('auto', '1080p');
      const navigationGroup = createGroup(row);
      document.body.appendChild(settingsPanel.getDomElement().get(0));

      navigationGroup.enable();

      expect(navigationGroup.getActiveComponent()).toBe(selectBox);
      expect(document.activeElement).toBe(selectBox.getDomElement().get(0));
    });

    it('should not focus the select box of a row that hides itself because it offers no choice', () => {
      const { row } = createSettingRow('auto');
      const navigationGroup = createGroup(row);
      document.body.appendChild(settingsPanel.getDomElement().get(0));
      expect(row.isShown()).toBe(false);

      navigationGroup.enable();

      expect(navigationGroup.getActiveComponent()).toBeUndefined();
    });
  });
});
