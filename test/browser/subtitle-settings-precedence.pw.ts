import type { VTTProperties, VTTRegionProperties } from 'bitmovin-player/types/subtitles/vtt/API';
import { SubtitleSettings, expect, mountUi, test } from './harness';
import { computedStyles, inlineStyle } from './helpers/styles';

// The player resolves cue-embedded styling (WebVTT cue classes and `STYLE` blocks, TTML inline
// styles) onto the elements it renders inside the subtitle label, as inline styles. That places it
// on different elements from the ones the settings rules target, and above them in the cascade.
const CUE_HTML =
  '<span id="cue-outer" style="color:#aaaaaa;font-family:Georgia;font-style:normal;font-weight:400;' +
  'font-variant:normal;text-shadow:none;font-size:9px">' +
  '<span id="cue-inner" style="background-color:#0000ff;color:#00ff00">- The most memorable,</span>' +
  '</span>';

const OUTER = '#cue-outer';
const INNER = '#cue-inner';

test('cue-embedded styling survives when no subtitle setting is chosen', async ({ page }) => {
  const ui = await mountUi(page);

  await ui.player.enterCue({ html: CUE_HTML });

  expect(await computedStyles(page, OUTER, ['color', 'font-family', 'font-size'])).toEqual([
    'rgb(170, 170, 170)',
    'Georgia',
    '9px',
  ]);
  expect(await computedStyles(page, INNER, ['color', 'background-color'])).toEqual([
    'rgb(0, 255, 0)',
    'rgb(0, 0, 255)',
  ]);
});

interface PrecedenceScenario {
  name: string;
  settings: SubtitleSettings;
  property: string;
  expected: string;
}

const scenarios: PrecedenceScenario[] = [
  {
    name: 'font color',
    settings: { fontColor: 'white', fontOpacity: '100' },
    property: 'color',
    expected: 'rgb(255, 255, 255)',
  },
  {
    name: 'background color',
    settings: { backgroundColor: 'black', backgroundOpacity: '100' },
    property: 'background-color',
    expected: 'rgba(0, 0, 0, 0)',
  },
  {
    name: 'font family',
    settings: { fontFamily: 'monospacedserif' },
    property: 'font-family',
    expected: '"Courier New", Courier, "Nimbus Mono L", "Cutive Mono", monospace',
  },
  {
    name: 'font style',
    settings: { fontStyle: 'italic' },
    property: 'font-style',
    expected: 'italic',
  },
  {
    name: 'font style bold',
    settings: { fontStyle: 'bold' },
    property: 'font-weight',
    expected: '700',
  },
  {
    name: 'small capital font family',
    settings: { fontFamily: 'smallcapital' },
    property: 'font-variant',
    expected: 'small-caps',
  },
  {
    name: 'character edge',
    settings: { characterEdge: 'uniform', characterEdgeColor: 'black' },
    property: 'text-shadow',
    expected:
      'rgb(0, 0, 0) -2px 0px 1px, rgb(0, 0, 0) 2px 0px 1px, rgb(0, 0, 0) 0px -2px 1px, rgb(0, 0, 0) 0px 2px 1px, ' +
      'rgb(0, 0, 0) -1px 1px 1px, rgb(0, 0, 0) 1px 1px 1px, rgb(0, 0, 0) 1px -1px 1px, rgb(0, 0, 0) 1px 1px 1px',
  },
];

// The background is cleared rather than repeated, so that nesting cannot stack its alpha. Every
// other setting reaches the descendants as the value chosen for the label.
for (const scenario of scenarios) {
  test(`a ${scenario.name} setting outranks the same property set inside the cue`, async ({ page }) => {
    const ui = await mountUi(page);
    await ui.applySubtitleSettings(scenario.settings);

    await ui.player.enterCue({ html: CUE_HTML });

    expect(await computedStyles(page, OUTER, [scenario.property])).toEqual([scenario.expected]);
    expect(await computedStyles(page, INNER, [scenario.property])).toEqual([scenario.expected]);
  });
}

// A TTML cue without a region arrives as its `p` element. The inline label's background does not
// cover that block, so the paragraph has to carry the chosen color itself.
test('a background color setting paints behind a cue paragraph', async ({ page }) => {
  const ui = await mountUi(page);
  await ui.applySubtitleSettings({ backgroundColor: 'black', backgroundOpacity: '100' });

  await ui.player.enterCue({
    html: '<p id="cue-paragraph" style="background-color:#0000ff">- The most memorable,</p>',
  });

  expect(await computedStyles(page, '#cue-paragraph', ['background-color'])).toEqual(['rgb(0, 0, 0)']);
});

const VTT_CUE: VTTProperties = {
  vertical: '',
  line: 'auto',
  lineAlign: 'start',
  snapToLines: true,
  size: 100,
  align: 'center',
  position: 'auto',
  positionAlign: 'auto',
};

const VTT_REGION: VTTRegionProperties = {
  id: 'region',
  width: 50,
  lines: 3,
  regionAnchorX: 0,
  regionAnchorY: 100,
  viewportAnchorX: 10,
  viewportAnchorY: 90,
  scroll: '',
};

// A WebVTT cue takes the chosen background on the label's text element instead of the label, in
// either kind of region container, so the cue's own backgrounds are cleared below that element.
for (const { placement, vtt } of [
  { placement: 'outside a region', vtt: VTT_CUE },
  { placement: 'inside a region', vtt: { ...VTT_CUE, region: VTT_REGION } },
]) {
  test(`a background color setting outranks the background set inside a WebVTT cue ${placement}`, async ({ page }) => {
    const ui = await mountUi(page);
    await ui.applySubtitleSettings({ backgroundColor: 'black', backgroundOpacity: '100' });

    await ui.player.enterCue({ html: CUE_HTML, vtt });

    expect(await computedStyles(page, '.bmpui-ui-label-text', ['background-color'])).toEqual(['rgb(0, 0, 0)']);
    expect(await computedStyles(page, INNER, ['background-color'])).toEqual(['rgba(0, 0, 0, 0)']);
  });
}

// A TTML cue's region styling lands on the region container, the box the window color colors.
test('a window color setting outranks the background set on the cue region', async ({ page }) => {
  const ui = await mountUi(page);
  await ui.applySubtitleSettings({ windowColor: 'black', windowOpacity: '100' });

  await ui.player.enterCue({
    text: 'In the authored region',
    region: 'authored',
    regionStyle: 'background-color:#0000ff',
  });

  expect(await computedStyles(page, '.bmpui-subtitle-position-authored', ['background-color'])).toEqual([
    'rgb(0, 0, 0)',
  ]);
});

// The window color sits behind the text, so the cue's own text background stays on top of it.
test('a window color setting keeps the background set inside the cue', async ({ page }) => {
  const ui = await mountUi(page);
  await ui.applySubtitleSettings({ windowColor: 'black', windowOpacity: '100' });

  await ui.player.enterCue({ html: CUE_HTML });

  expect(await computedStyles(page, '.bmpui-subtitle-position-default', ['background-color'])).toEqual([
    'rgb(0, 0, 0)',
  ]);
  expect(await computedStyles(page, INNER, ['background-color'])).toEqual(['rgb(0, 0, 255)']);
});

test('a font size setting outranks the size set inside the cue', async ({ page }) => {
  const ui = await mountUi(page);
  await ui.applySubtitleSettings({ fontSize: '150' });

  await ui.player.enterCue({ html: CUE_HTML });

  const [labelSize] = await computedStyles(page, '.bmpui-ui-subtitle-label', ['font-size']);
  expect(await computedStyles(page, OUTER, ['font-size'])).toEqual([labelSize]);
  expect(await computedStyles(page, INNER, ['font-size'])).toEqual([labelSize]);
});

// A TTML cue's region styling lands on the region container, which the label's size is relative to.
test('a font size setting outranks the size set on the cue region', async ({ page }) => {
  const ui = await mountUi(page);
  await ui.applySubtitleSettings({ fontSize: '150' });

  await ui.player.enterCue({ text: 'In the authored region', region: 'authored', regionStyle: 'font-size:40px' });
  await ui.player.enterCue({ text: 'In the default region' });

  const [defaultRegionSize] = await computedStyles(page, '.bmpui-subtitle-position-default .bmpui-ui-subtitle-label', [
    'font-size',
  ]);
  expect(
    await computedStyles(page, '.bmpui-subtitle-position-authored .bmpui-ui-subtitle-label', ['font-size']),
  ).toEqual([defaultRegionSize]);
});

test('the font size CEA-608 rendering applies to the label stays authoritative', async ({ page }) => {
  const ui = await mountUi(page);
  await ui.applySubtitleSettings({ fontSize: '150' });

  // The first CEA-608 cue is what switches the overlay into the grid rendering that measures the
  // row height, so the size below is only applied from the second cue onwards.
  await ui.player.enterCue({ html: '<span>first</span>', position: { row: 1, column: 0 } });
  await ui.player.enterCue({ html: CUE_HTML, position: { row: 2, column: 0 } });

  const gridSize = await inlineStyle(page, `.bmpui-ui-subtitle-label:has(${OUTER})`, 'font-size');
  expect(gridSize, 'a zero grid size would make the assertions below meaningless').not.toBe('0px');
  expect(await computedStyles(page, `.bmpui-ui-subtitle-label:has(${OUTER})`, ['font-size'])).toEqual([gridSize]);
  expect(await computedStyles(page, OUTER, ['font-size'])).toEqual([gridSize]);
  expect(await computedStyles(page, INNER, ['font-size'])).toEqual([gridSize]);
});
