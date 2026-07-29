import childProcess = require('child_process');
import path = require('path');

describe('PlaybackTimeLabel styles', () => {
  it('renders a visible keyboard focus state for the live indicator', () => {
    const css = childProcess.execFileSync(
      path.resolve(process.cwd(), 'node_modules/.bin/sass'),
      ['--no-source-map', path.resolve(process.cwd(), 'src/scss/bitmovinplayer-ui.scss')],
      { encoding: 'utf8' },
    );

    expect(css).toMatch(/\.bmpui-ui-playbacktimelabel\.bmpui-ui-playbacktimelabel-live\.bmpui-focus-visible\s*\{/);
  });
});
