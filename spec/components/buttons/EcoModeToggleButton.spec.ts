import { EcoModeToggleButton } from '../../../src/ts/components/buttons/EcoModeToggleButton';

describe('EcoModeToggleButton', () => {
  it('should use the localized title as accessible name instead of the vocabulary key', () => {
    const ecoModeToggleButton = new EcoModeToggleButton();

    expect(ecoModeToggleButton.getDomElement().get(0).getAttribute('aria-label')).toBe('Eco Mode');
  });
});
