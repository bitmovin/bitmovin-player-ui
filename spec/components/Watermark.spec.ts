import { Watermark, WatermarkConfig } from '../../src/ts/components/Watermark';

const BITMOVIN_NAME = 'Bitmovin website, opens in a new tab';
const GENERIC_NAME = 'Link to Homepage';

describe('Watermark', () => {
  it.each`
    config                                               | expectedName
    ${{}}                                                | ${BITMOVIN_NAME}
    ${{ url: 'https://example.com' }}                    | ${GENERIC_NAME}
    ${{ url: 'https://example.com', ariaLabel: 'Home' }} | ${'Home'}
  `('should be named "$expectedName" for config $config', ({ config, expectedName }) => {
    const watermark = createWatermark(config);

    expect(getName(watermark)).toBe(expectedName);
  });

  it.each`
    config                                  | url                            | expectedName
    ${{}}                                   | ${'https://customer.example/'} | ${GENERIC_NAME}
    ${{ url: 'https://customer.example/' }} | ${'http://bitmovin.com'}       | ${BITMOVIN_NAME}
    ${{ ariaLabel: 'Home' }}                | ${'https://customer.example/'} | ${'Home'}
  `('should be named "$expectedName" after setUrl("$url") for config $config', ({ config, url, expectedName }) => {
    const watermark = createWatermark(config);

    watermark.setUrl(url);

    expect(getName(watermark)).toBe(expectedName);
  });

  function createWatermark(config: WatermarkConfig): Watermark {
    const watermark = new Watermark(config);
    watermark.initialize();
    return watermark;
  }

  function getName(watermark: Watermark): string {
    return watermark.getDomElement().get(0).getAttribute('aria-label');
  }
});
