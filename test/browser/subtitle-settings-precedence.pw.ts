import type { VTTProperties, VTTRegionProperties } from 'bitmovin-player/types/subtitles/vtt/API';
import { SubtitleSettings, expect, mountUi, test } from './harness';
import { computedStyles } from './helpers/styles';

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
    name: 'cursive font family',
    settings: { fontFamily: 'cursive' },
    property: 'font-style',
    expected: 'italic',
  },
  {
    name: 'small capital font family',
    settings: { fontFamily: 'smallcapital' },
    property: 'font-variant',
    expected: 'small-caps',
  },
];

// Every setting reaches the descendants as the value chosen for the label.
for (const scenario of scenarios) {
  test(`a ${scenario.name} setting outranks the same property set inside the cue`, async ({ page }) => {
    const ui = await mountUi(page);
    await ui.applySubtitleSettings(scenario.settings);

    await ui.player.enterCue({ html: CUE_HTML });

    expect(await computedStyles(page, OUTER, [scenario.property])).toEqual([scenario.expected]);
    expect(await computedStyles(page, INNER, [scenario.property])).toEqual([scenario.expected]);
  });
}

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

// A WebVTT cue's window is the label outside a region and the region container inside one, both
// separate from the label's text element that takes the background.
for (const { placement, vtt, windowElement } of [
  { placement: 'outside a region', vtt: VTT_CUE, windowElement: '.bmpui-ui-subtitle-label' },
  {
    placement: 'inside a region',
    vtt: { ...VTT_CUE, region: VTT_REGION },
    windowElement: '.bmpui-subtitle-vtt-region-container',
  },
]) {
  test(`window and background color land on separate elements of a WebVTT cue ${placement}`, async ({ page }) => {
    const ui = await mountUi(page);
    await ui.applySubtitleSettings({
      windowColor: 'black',
      windowOpacity: '100',
      backgroundColor: 'white',
      backgroundOpacity: '100',
    });

    await ui.player.enterCue({ html: CUE_HTML, vtt });

    expect(await computedStyles(page, windowElement, ['background-color'])).toEqual(['rgb(0, 0, 0)']);
    expect(await computedStyles(page, '.bmpui-ui-label-text', ['background-color'])).toEqual(['rgb(255, 255, 255)']);
  });
}
