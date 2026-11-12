import { Locator } from '@playwright/test';

/**
 * Records every non-empty text written into a live region from now on, whitespace-normalized.
 *
 * The regions are emptied and refilled for each announcement, and cleared again later, so their
 * current text cannot tell whether a message was announced once or twice. The writes can.
 *
 * Returns a function that reads the writes recorded so far.
 */
export async function recordLiveRegionWrites(region: Locator): Promise<() => Promise<string[]>> {
  const writes = await region.evaluateHandle(element => {
    const recorded: string[] = [];
    new MutationObserver(() => {
      const text = (element.textContent || '').replace(/\s+/g, ' ').trim();
      if (text !== '') {
        recorded.push(text);
      }
    }).observe(element, { childList: true, characterData: true, subtree: true });
    return recorded;
  });

  return () => writes.jsonValue();
}
