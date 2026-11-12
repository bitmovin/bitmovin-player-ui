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

test('a runtime localization config names the player, the seek bar and the volume slider in the new language', async ({
  page,
}) => {
  const ui = await mountUi(page, { live: false });
  const controlBar = page.locator('.bmpui-ui-controlbar');
  const seekBar = controlBar.getByRole('slider', { name: 'Video timeline', exact: true });
  const volumeSlider = controlBar.getByRole('slider', { name: 'Volume', exact: true });
  await expect(seekBar).toBeAttached();
  await expect(volumeSlider).toBeAttached();

  await ui.setLocalizationConfig({ language: 'de' });

  await expect(page.getByRole('region', { name: 'Videoplayer', exact: true })).toBeVisible();
  const germanSeekBar = controlBar.getByRole('slider', { name: 'Video-Timeline', exact: true });
  await expect(germanSeekBar, 'the seek bar name must be in the new language').toBeAttached();
  await expect(germanSeekBar, 'the seek bar value must be in the new language').toHaveAttribute(
    'aria-valuetext',
    '0 Sekunden aus 10 Minuten 0 Sekunden',
  );
  const germanVolumeSlider = controlBar.getByRole('slider', { name: 'Lautstärke', exact: true });
  await expect(germanVolumeSlider, 'the volume slider name must be in the new language').toBeAttached();
  await expect(germanVolumeSlider, 'the volume value must be in the new language').toHaveAttribute(
    'aria-valuetext',
    'Wert: 100',
  );
});

test('a runtime localization config names the live indicator in the new language', async ({ page }) => {
  const ui = await mountUi(page, { live: true });
  await expect(page.getByRole('button', { name: 'Live, jump to live edge', exact: true })).toBeVisible();

  await ui.setLocalizationConfig({ language: 'fr' });

  await expect(
    page.getByRole('button', { name: 'En direct, aller au direct', exact: true }),
    'the name must match the visible label in the new language',
  ).toHaveText('En direct');
});

test('a settings option chosen through the UI keeps its selection and focus when the UI language changes', async ({
  page,
}) => {
  const ui = await mountUi(page, { live: false });
  await page.locator('.bmpui-ui-controlbar').getByRole('button', { name: 'Settings', exact: true }).click();
  const settingsPanel = page.locator('.bmpui-ui-settings-panel:not(.bmpui-ui-listbox)');
  await settingsPanel.getByRole('menuitem', { name: 'Speed normal', exact: true }).click();
  const chosenOption = settingsPanel.getByRole('menuitem', { name: '1.5x', exact: true });
  await chosenOption.click();
  await expect(chosenOption).toHaveClass(/bmpui-selected/);
  await expect(chosenOption).toBeFocused();

  await ui.setLanguage('nl');

  await expect(
    settingsPanel.getByRole('menuitem', { name: 'normaal', exact: true }),
    'the options must be named in the new language',
  ).toBeVisible();
  await expect(chosenOption, 'the chosen option must stay selected').toHaveClass(/bmpui-selected/);
  await expect(chosenOption, 'the chosen option must keep the focus').toBeFocused();
  await expect(settingsPanel.getByRole('menuitem', { name: 'normaal', exact: true })).not.toHaveClass(/bmpui-selected/);
});

test('the context menu names its items in the new UI language', async ({ page }) => {
  const ui = await mountUi(page, { live: false });

  await ui.setLanguage('de');
  await page.locator('.bmpui-ui-uicontainer').click({ button: 'right' });

  await expect(page.getByRole('menuitem', { name: 'Player Insights anzeigen', exact: true })).toBeVisible();
});

test('the mounted UI keeps following language changes after the language-changed dispatcher was replaced', async ({
  page,
}) => {
  const ui = await mountUi(page, { live: false });
  const root = page.locator('.bmpui-ui-uicontainer');
  const controlBar = page.locator('.bmpui-ui-controlbar');

  await ui.setLocalizationConfig({ language: 'fr' }, true);
  await expect(root).toHaveAttribute('lang', 'fr');
  await expect(controlBar.getByRole('button', { name: 'Réglages', exact: true })).toBeVisible();

  await ui.setLanguage('nl');

  await expect(root, 'the root must follow a later language change').toHaveAttribute('lang', 'nl');
  await expect(
    controlBar.getByRole('button', { name: 'Instellingen', exact: true }),
    'mounted buttons must follow a later language change',
  ).toBeVisible();
  expect(await ui.languageChangesSeenByOwnDispatcher(), 'the integrator dispatcher must be notified').toEqual([
    'fr',
    'nl',
  ]);
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
