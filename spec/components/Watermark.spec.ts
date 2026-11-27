import { Watermark, WatermarkConfig } from '../../src/ts/components/Watermark';
import { defaultVocabularies, i18n } from '../../src/ts/localization/i18n';

const BITMOVIN_NAME = 'Bitmovin website, opens in a new tab';
const GENERIC_NAME = 'Link to Homepage';

describe('Watermark', () => {
  afterEach(() => {
    i18n.setConfig({ language: 'en', vocabularies: defaultVocabularies });
  });

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

  it('should keep a name set through setAriaLabel when the URL changes later', () => {
    const watermark = createWatermark({});

    watermark.setAriaLabel('Customer home page');
    watermark.setUrl('https://customer.example/');

    expect(getName(watermark)).toBe('Customer home page');
  });

  it('should name a watermark with a changed URL in the new UI language', () => {
    const watermark = createWatermark({});
    watermark.setUrl('https://customer.example/');

    i18n.setLanguage('de');

    expect(getName(watermark)).toBe(i18n.performLocalization(i18n.getLocalizer('watermarkLink')));
    expect(getName(watermark)).not.toBe(GENERIC_NAME);
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
