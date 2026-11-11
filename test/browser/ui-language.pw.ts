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
