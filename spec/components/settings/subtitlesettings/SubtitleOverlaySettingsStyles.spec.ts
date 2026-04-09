import fs = require('fs');
import path = require('path');

describe('Subtitle overlay settings styles', () => {
  const stylesPath = path.resolve(
    __dirname,
    '../../../../src/scss/components/settings/subtitlesettings/_subtitle-overlay-settings.scss',
  );
  const styles = fs.readFileSync(stylesPath, 'utf8');

  it('keeps WebVTT background color on a different visual layer than window color', () => {
    expect(styles).toContain(
      '.#{$prefix}-subtitle-region-container:not(.#{$prefix}-subtitle-vtt-region-container):not(.#{$prefix}-subtitle-vtt-cue-container)',
    );
    expect(styles).toContain('.#{$prefix}-subtitle-region-container.#{$prefix}-subtitle-vtt-region-container');
    expect(styles).toContain('.#{$prefix}-subtitle-region-container.#{$prefix}-subtitle-vtt-cue-container');
    expect(styles).toContain('.#{$prefix}-ui-label-text');
  });
});
