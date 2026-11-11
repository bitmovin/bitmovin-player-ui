import { expect, mountUi, test } from './harness';

/**
 * Screen readers pick their pronunciation from the `lang` attribute of the closest ancestor. The UI
 * therefore announces its own language on the root, while subtitle text announces the language of
 * its subtitle track. Which language an element ends up in is only observable in rendered markup.
 */

test('switching the UI language updates the root lang and the accessible names in that language', async ({ page }) => {
  const ui = await mountUi(page, { live: false });
  const root = page.locator('.bmpui-ui-uicontainer');
  await expect(root).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('region', { name: 'Video player', exact: true })).toBeVisible();

  await ui.setLanguage('fr');

  await expect(root, 'the root must announce the new UI language').toHaveAttribute('lang', 'fr');
  await expect(
    page.getByRole('region', { name: 'Lecteur vidéo', exact: true }),
    'the player name must be in the announced language',
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Barre de contrôle', exact: true }),
    'the control bar name must be in the announced language',
  ).toBeAttached();
});

test('a rendered cue takes the language of its subtitle track, not the UI language', async ({ page }) => {
  const ui = await mountUi(page, {
    live: false,
    subtitleTracks: [{ id: 'subtitle-es', label: 'Español', lang: 'es' }],
  });
  await ui.setLanguage('de');

  await ui.player.enterCue({ subtitleId: 'subtitle-es', text: 'Hola' });

  await expect(page.locator('.bmpui-ui-uicontainer')).toHaveAttribute('lang', 'de');
  await expect(page.locator('.bmpui-ui-subtitle-label', { hasText: 'Hola' })).toHaveAttribute('lang', 'es');
});

test('a cue of an unlisted track, such as a forced track, is marked as unknown language', async ({ page }) => {
  const ui = await mountUi(page, {
    live: false,
    subtitleTracks: [{ id: 'subtitle-de', label: 'Deutsch', lang: 'de' }],
  });
  await ui.setLanguage('de');

  await ui.player.enterCue({ subtitleId: 'forced-es', text: 'Hola' });

  await expect(
    page.locator('.bmpui-ui-subtitle-label', { hasText: 'Hola' }),
    'the cue must not inherit the UI language',
  ).toHaveAttribute('lang', '');
});

test('a localization config applied at runtime updates the mounted UI', async ({ page }) => {
  const ui = await mountUi(page, { live: false });

  await ui.setLocalizationConfig({ language: 'fr' });

  await expect(page.locator('.bmpui-ui-uicontainer')).toHaveAttribute('lang', 'fr');
  await expect(page.getByRole('region', { name: 'Lecteur vidéo', exact: true })).toBeVisible();
  await expect(
    page.locator('.bmpui-ui-controlbar').getByRole('button', { name: 'Réglages', exact: true }),
    'mounted buttons must take the new language',
  ).toBeVisible();
});

for (const initialState of ['on', 'off'] as const) {
  test(`buttons and a toggle in its ${initialState} state get accessible names in the new UI language`, async ({
    page,
  }) => {
    const ui = await mountUi(page, { live: false });
    const controlBar = page.locator('.bmpui-ui-controlbar');
    // The stub starts playing, so the playback toggle starts in its on state, named after its Pause action.
    if (initialState === 'off') {
      await controlBar.getByRole('button', { name: 'Pause', exact: true }).click();
    }

    await ui.setLanguage('nl');

    await expect(controlBar.getByRole('button', { name: 'Dempen', exact: true })).toBeVisible();
    await expect(controlBar.getByRole('button', { name: 'Instellingen', exact: true })).toBeVisible();
    const [currentName, otherName] = initialState === 'on' ? ['Pauzeren', 'Afspelen'] : ['Afspelen', 'Pauzeren'];
    const playbackToggle = controlBar.getByRole('button', { name: currentName, exact: true });
    await expect(playbackToggle, 'the toggle must keep its state and name it in the new language').toBeVisible();

    await playbackToggle.click();

    await expect(
      controlBar.getByRole('button', { name: otherName, exact: true }),
      'the toggled state must be named in the new language too',
    ).toBeVisible();
  });
}

test('an updated cue keeps the language of its subtitle track', async ({ page }) => {
  const ui = await mountUi(page, {
    live: false,
    subtitleTracks: [{ id: 'subtitle-es', label: 'Español', lang: 'es' }],
  });
  await ui.player.enterCue({ subtitleId: 'subtitle-es', text: 'Hola', html: 'Hola' });

  await ui.player.updateCue({ subtitleId: 'subtitle-es', text: 'Hola', html: 'Hola amigo' });

  const updatedCue = page.locator('.bmpui-ui-subtitle-label', { hasText: 'Hola amigo' });
  await expect(updatedCue).toHaveAttribute('lang', 'es');
  await expect(page.locator('.bmpui-ui-subtitle-label'), 'the update must replace the cue').toHaveCount(1);
});

test('a mounted cue keeps the language of its subtitle track when the UI language changes', async ({ page }) => {
  const ui = await mountUi(page, {
    live: false,
    subtitleTracks: [{ id: 'subtitle-es', label: 'Español', lang: 'es' }],
  });
  await ui.player.enterCue({ subtitleId: 'subtitle-es', text: 'Hola' });
  const cue = page.locator('.bmpui-ui-subtitle-label', { hasText: 'Hola' });
  await expect(cue).toHaveAttribute('lang', 'es');

  await ui.setLanguage('de');

  await expect(page.locator('.bmpui-ui-uicontainer')).toHaveAttribute('lang', 'de');
  await expect(cue, 'the cue language must not follow the UI language').toHaveAttribute('lang', 'es');
});
