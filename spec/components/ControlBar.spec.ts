import { ControlBar } from '../../src/ts/components/ControlBar';
import { i18n } from '../../src/ts/localization/i18n';
import { MockHelper } from '../helper/MockHelper';

describe('ControlBar', () => {
  let controlBar: ControlBar;

  beforeEach(() => {
    i18n.setConfig({ language: 'en' });
    controlBar = new ControlBar({ components: [] });
  });

  afterEach(() => {
    controlBar.release();
    i18n.setConfig({ language: 'en' });
    jest.restoreAllMocks();
  });

  it.each([
    ['de', 'Videoplayer Kontrollen'],
    ['fr', 'Barre de contrôle'],
  ])('should update its aria-label when the UI language changes to %p', (language, expectedAriaLabel) => {
    const domMock = MockHelper.generateDOMMock();
    jest.spyOn(controlBar, 'hasDomElement').mockReturnValue(true);
    jest.spyOn(controlBar, 'getDomElement').mockReturnValue(domMock);

    i18n.setLanguage(language);

    expect(domMock.attr).toHaveBeenCalledWith('aria-label', expectedAriaLabel);
  });

  it('should not create its DOM element when the UI language changes before it is rendered', () => {
    const getDomElementSpy = jest.spyOn(controlBar, 'getDomElement');

    i18n.setLanguage('de');

    expect(getDomElementSpy).not.toHaveBeenCalled();
  });
});
