import type { SubtitleCueEvent } from 'bitmovin-player';

import { SubtitleOverlay } from '../../../src/ts/components/overlays/SubtitleOverlay';

const IMAGE_DATA = 'data:image/png;base64,iVBORw0KGgo=';

describe('SubtitleOverlay image cues', () => {
  it.each`
    text               | expectedAlt
    ${'Hello world'}   | ${'Hello world'}
    ${undefined}       | ${''}
    ${''}              | ${''}
    ${'"quoted" <b>&'} | ${'"quoted" <b>&'}
  `('should render the image with alt "$expectedAlt" when the cue text is "$text"', ({ text, expectedAlt }) => {
    const label = new SubtitleOverlay().generateLabel({
      start: 0,
      end: 1,
      image: IMAGE_DATA,
      text,
    } as SubtitleCueEvent);

    const container = document.createElement('div');
    container.innerHTML = String(label.getText());
    const images = container.querySelectorAll('img');

    expect(images).toHaveLength(1);
    expect(images[0].getAttribute('src')).toBe(IMAGE_DATA);
    expect(images[0].getAttribute('alt')).toBe(expectedAlt);
  });
});
