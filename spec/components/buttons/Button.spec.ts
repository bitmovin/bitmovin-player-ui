import { Button, ButtonConfig } from '../../../src/ts/components/buttons/Button';
import { ToggleButton, ToggleButtonConfig } from '../../../src/ts/components/buttons/ToggleButton';
import { i18n } from '../../../src/ts/localization/i18n';

// The DOM is deliberately not mocked: the subject is the rendered `aria-label` after a language change.

describe('Button', () => {
  let button: Button<ButtonConfig>;

  beforeEach(() => {
    i18n.setConfig({ language: 'en' });
  });

  afterEach(() => {
    button?.release();
    i18n.setConfig({ language: 'en' });
  });

  function renderedAriaLabel(component: Button<ButtonConfig>): string | null {
    return component.getDomElement().get(0).getAttribute('aria-label');
  }

  describe('accessible name on language change', () => {
    it.each([
      ['a localized aria label', { ariaLabel: i18n.getLocalizer('fullscreen') }, 'Fullscreen', 'Vollbild'],
      // The CSS prefix placeholder is only replaced in the build, but the visible text update selects by class name.
      ['a localized text', { text: i18n.getLocalizer('settings'), cssPrefix: 'bmpui' }, 'Settings', 'Einstellungen'],
      ['a plain string', { ariaLabel: 'Custom name' }, 'Custom name', 'Custom name'],
    ])('should render the accessible name of %s in the new language', (_, config, englishName, germanName) => {
      button = new Button(config);
      expect(renderedAriaLabel(button)).toBe(englishName);

      i18n.setLanguage('de');

      expect(renderedAriaLabel(button)).toBe(germanName);
    });

    it('should keep a plain string name that was set at runtime', () => {
      button = new Button({ ariaLabel: i18n.getLocalizer('fullscreen') });
      button.setAriaLabel('Runtime name');

      i18n.setLanguage('de');

      expect(renderedAriaLabel(button)).toBe('Runtime name');
    });

    it('should keep a name that was changed directly on the element', () => {
      button = new Button({ ariaLabel: i18n.getLocalizer('fullscreen') });
      button.getDomElement().attr('aria-label', 'Changed on the element');

      i18n.setLanguage('de');

      expect(renderedAriaLabel(button)).toBe('Changed on the element');
    });

    it('should not create the DOM element of a button that is not rendered yet', () => {
      button = new Button({ ariaLabel: i18n.getLocalizer('fullscreen') });

      i18n.setLanguage('de');

      expect(button.hasDomElement()).toBe(false);
    });

    it.each([
      ['on', 'Pauzeren'],
      ['off', 'Afspelen'],
    ])('should localize the name of the current %s state of a toggle button without changing it', (state, name) => {
      const toggleButton = new ToggleButton<ToggleButtonConfig>({
        onAriaLabel: i18n.getLocalizer('pause'),
        offAriaLabel: i18n.getLocalizer('play'),
      });
      button = toggleButton;
      toggleButton.on();
      if (state === 'off') {
        toggleButton.off();
      }

      i18n.setLanguage('nl');

      expect(renderedAriaLabel(toggleButton)).toBe(name);
      expect(toggleButton.isOn()).toBe(state === 'on');
    });
  });
});
