import childProcess = require('child_process');
import path = require('path');

describe('PlaybackTimeLabel styles', () => {
  const sassExecutable = path.resolve(path.dirname(require.resolve('sass')), 'sass.js');
  const css = childProcess.execFileSync(
    process.execPath,
    [sassExecutable, '--no-source-map', path.resolve(process.cwd(), 'src/scss/bitmovinplayer-ui.scss')],
    { encoding: 'utf8' },
  );

  const getCssProperty = (selector: string, property: string): string => {
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const declarations = css.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))?.[1];
    const value = declarations?.match(new RegExp(`${property}:\\s*([^;]+);`))?.[1];

    if (value == null) {
      throw new Error(`Could not find ${property} for ${selector} in compiled CSS`);
    }

    return value;
  };

  it('renders a visible keyboard focus state for the live indicator', () => {
    expect(css).toMatch(/\.bmpui-ui-playbacktimelabel\.bmpui-ui-playbacktimelabel-live\.bmpui-focus-visible\s*\{/);
  });

  it('adds button-sized spacing around the live indicator', () => {
    expect(getCssProperty('.bmpui-ui-playbacktimelabel.bmpui-ui-playbacktimelabel-live', 'padding')).toBe(
      getCssProperty('.bmpui-ui-button', 'padding'),
    );
  });
});
