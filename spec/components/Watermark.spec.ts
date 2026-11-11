import { Watermark, WatermarkConfig } from '../../src/ts/components/Watermark';

describe('Watermark', () => {
  it.each`
    config                                               | expectedName
    ${{}}                                                | ${'Bitmovin website, opens in a new tab'}
    ${{ url: 'https://example.com' }}                    | ${'Link to Homepage'}
    ${{ url: 'https://example.com', ariaLabel: 'Home' }} | ${'Home'}
  `('should be named "$expectedName" for config $config', ({ config, expectedName }) => {
    const watermark = new Watermark(config as WatermarkConfig);

    expect(watermark.getDomElement().get(0).getAttribute('aria-label')).toBe(expectedName);
  });
});
