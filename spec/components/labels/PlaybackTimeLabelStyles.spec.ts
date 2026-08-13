import * as childProcess from 'child_process';
import * as path from 'path';

describe('PlaybackTimeLabel styles', () => {
  // Sass's filesystem access is incompatible with this repository's Jest runtime, so compile in a clean Node process.
  const css = childProcess.execFileSync(
    process.execPath,
    [
      '-e',
      "process.stdout.write(require('sass').compile(process.argv[1]).css)",
      path.resolve(process.cwd(), 'src/scss/bitmovinplayer-ui.scss'),
    ],
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

  // Without this the label gets wider on every time update and pushes the seek bar out of the
  // control bar. We set it ourselves so it does not depend on the page having a CSS reset.
  it('sizes the playback time label as a border box', () => {
    expect(getCssProperty('.bmpui-ui-playbacktimelabel', 'box-sizing')).toBe('border-box');
  });
});
