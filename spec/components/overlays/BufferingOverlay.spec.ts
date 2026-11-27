import { BufferingOverlay } from '../../../src/ts/components/overlays/BufferingOverlay';

describe('BufferingOverlay', () => {
  it('should hide the decorative indicator dots from assistive technologies', () => {
    const indicators = new BufferingOverlay()['indicators'];

    expect(indicators).toHaveLength(3);
    indicators.forEach(indicator => {
      const element = indicator.getDomElement().get(0);

      expect(element.getAttribute('aria-hidden')).toBe('true');
      expect(element.hasAttribute('role')).toBe(false);
    });
  });
});
