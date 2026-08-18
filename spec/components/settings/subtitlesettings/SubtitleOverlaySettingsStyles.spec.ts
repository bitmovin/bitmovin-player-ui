import childProcess = require('child_process');
import fs = require('fs');
import path = require('path');

const stylesPath = path.resolve(
  process.cwd(),
  'src/scss/components/settings/subtitlesettings/_subtitle-overlay-settings.scss',
);

/**
 * Compiles the subtitle settings stylesheet and returns the generated CSS.
 *
 * Sass runs in a child process because its file system access is incompatible with the
 * globals Jest installs in the test realm.
 */
function compileStyles(): string {
  const sassCli = path.resolve(process.cwd(), 'node_modules/sass/sass.js');

  return childProcess.execFileSync(process.execPath, [sassCli, '--no-source-map', stylesPath], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
}

describe('Subtitle overlay settings styles', () => {
  const styles = fs.readFileSync(stylesPath, 'utf8');
  const stylesWithoutWhitespace = styles.replace(/\s/g, '');

  it('keeps WebVTT background color on a different visual layer than window color', () => {
    expect(stylesWithoutWhitespace).toContain(
      '.#{$prefix}-subtitle-region-container:not(.#{$prefix}-subtitle-vtt-region-container):not(.#{$prefix}-subtitle-vtt-cue-container)',
    );
    expect(styles).toContain('.#{$prefix}-subtitle-region-container.#{$prefix}-subtitle-vtt-region-container');
    expect(styles).toContain('.#{$prefix}-subtitle-region-container.#{$prefix}-subtitle-vtt-cue-container');
    expect(styles).toContain('.#{$prefix}-ui-label-text');
  });
});

describe('Subtitle overlay settings style precedence', () => {
  const css = compileStyles();

  /**
   * Returns the declaration block of every rule whose selector contains the token.
   */
  function declarationsForSelector(token: string): string[] {
    const rules = css.match(new RegExp(`[^{}]*${token}[^{}]*\\{[^}]*\\}`, 'g')) ?? [];

    return rules.map(rule =>
      rule
        .slice(rule.indexOf('{') + 1, rule.lastIndexOf('}'))
        .replace(/\s+/g, ' ')
        .trim(),
    );
  }

  it('marks the subtitle background important so it wins over a background set inside the cue', () => {
    const declarations = declarationsForSelector('bmpui-bgcolor-black75');

    expect(declarations.length).toBeGreaterThan(0);
    expect(declarations.every(declaration => declaration.includes('!important'))).toBe(true);
  });

  it('clears a background set on cue descendants so it cannot cover the subtitle background', () => {
    const cueDescendantRules = css.match(
      /\.bmpui-bgcolor-black75[^{}]*\*\s*\{\s*background-color:\s*initial\s*!important;?\s*\}/g,
    );

    expect(cueDescendantRules).not.toBeNull();
  });

  /**
   * Returns the declaration block of the rule that targets the label itself, as opposed to
   * the one targeting its cue descendants.
   */
  function declarationsForLabel(settingClass: string): string {
    const rule = css.match(new RegExp(`\\.${settingClass}[^{}]*\\.bmpui-ui-subtitle-label\\s*\\{([^}]*)\\}`));

    return rule === null ? '' : rule[1].replace(/\s+/g, ' ').trim();
  }

  it('marks the font color important on the label', () => {
    const declarations = declarationsForLabel('bmpui-fontcolor-white100');

    expect(declarations).toContain('color: white !important');
    expect(declarations).toContain('-webkit-text-fill-color: white !important');
  });

  // Every property a setting applies has to be inherited by nested cue elements, because
  // the player renders cue-embedded styling as inline styles on those elements.
  const inheritedProperties = [
    { name: 'font color', settingClass: 'bmpui-fontcolor-white100', property: 'color' },
    { name: 'font color fill', settingClass: 'bmpui-fontcolor-white100', property: '-webkit-text-fill-color' },
    { name: 'italic font style', settingClass: 'bmpui-fontstyle-italic', property: 'font-style' },
    { name: 'bold font style', settingClass: 'bmpui-fontstyle-bold', property: 'font-weight' },
    { name: 'font family', settingClass: 'bmpui-fontfamily-monospacedserif', property: 'font-family' },
    { name: 'small capital font family', settingClass: 'bmpui-fontfamily-smallcapital', property: 'font-variant' },
    { name: 'character edge', settingClass: 'bmpui-characteredge-uniform-black', property: 'text-shadow' },
    { name: 'font size', settingClass: 'bmpui-fontsize-150', property: 'font-size' },
  ];

  it.each(inheritedProperties)('makes cue descendants inherit the $name setting', ({ settingClass, property }) => {
    const descendantRule = new RegExp(
      `\\.${settingClass}[^{}]*\\.bmpui-ui-subtitle-label \\*\\s*\\{[^}]*${property}:\\s*inherit\\s*!important`,
    );

    expect(css).toMatch(descendantRule);
  });

  it('generates a fully transparent step for the subtitle background and the window', () => {
    const background = declarationsForLabel('bmpui-bgcolor-black0');
    const window = declarationsForSelector('bmpui-windowcolor-black0');

    expect(background).toContain('background-color: rgba(0, 0, 0, 0) !important');
    expect(window.length).toBeGreaterThan(0);
  });

  it('clears cue descendants for the fully transparent step, so it can remove a background set by the cue', () => {
    const cueDescendantRules = css.match(
      /\.bmpui-bgcolor-black0[^{}]*\*\s*\{\s*background-color:\s*initial\s*!important;?\s*\}/g,
    );

    expect(cueDescendantRules).not.toBeNull();
  });

  it('offers no fully transparent font color, matching the select box options', () => {
    const fontColor = declarationsForSelector('bmpui-fontcolor-white0');

    expect(fontColor).toHaveLength(0);
  });

  it('leaves the font size on the label unimportant so the CEA-608 grid size stays authoritative', () => {
    const declarations = declarationsForLabel('bmpui-fontsize-150');

    expect(declarations).toBe('font-size: 1.5em;');
  });
});
