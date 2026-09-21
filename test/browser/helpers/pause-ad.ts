import { Page } from '@playwright/test';

/** A pause status control and the title-bar element it shares screen space with. */
export interface OverlappingPair {
  statusControl: string;
  titleBarContent: string;
}

/**
 * Pairs of pause status controls and title-bar content whose rendered boxes intersect.
 *
 * Compares leaf elements only. The title bar's wrappers are full-width by construction, so
 * including them would report an overlap for any status control at all.
 *
 * Throws when either side has nothing visible to compare, because an empty result is
 * indistinguishable from "nothing overlaps" and would make the assertion unable to fail.
 */
export async function pauseAdStatusTitleBarOverlaps(page: Page): Promise<OverlappingPair[]> {
  return page.evaluate(() => {
    const name = (element: Element) => element.classList[0] || element.tagName.toLowerCase();
    const laidOut = (element: Element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 ? rect : undefined;
    };

    const statusControls = Array.from(
      document.querySelectorAll('.bmpui-ui-pause-ad-status-badge, .bmpui-ui-button-pause-ad-dismiss'),
    )
      .map(element => ({ element, rect: laidOut(element) }))
      .filter((candidate): candidate is { element: Element; rect: DOMRect } => Boolean(candidate.rect));
    if (statusControls.length === 0) {
      throw new Error('no pause status control is laid out, so there is nothing to compare');
    }

    const titleBar = document.querySelector('.bmpui-ui-titlebar');
    if (!titleBar) {
      throw new Error('no .bmpui-ui-titlebar in the document');
    }
    const titleBarContent = Array.from(titleBar.querySelectorAll('*'))
      .filter(element => element.children.length === 0)
      .map(element => ({ element, rect: laidOut(element) }))
      .filter((candidate): candidate is { element: Element; rect: DOMRect } => Boolean(candidate.rect));
    if (titleBarContent.length === 0) {
      throw new Error('the title bar renders no content, so an overlap could not be detected');
    }

    const overlaps: { statusControl: string; titleBarContent: string }[] = [];
    statusControls.forEach(status => {
      titleBarContent.forEach(content => {
        const intersects =
          status.rect.left < content.rect.right &&
          content.rect.left < status.rect.right &&
          status.rect.top < content.rect.bottom &&
          content.rect.top < status.rect.bottom;
        if (intersects) {
          overlaps.push({ statusControl: name(status.element), titleBarContent: name(content.element) });
        }
      });
    });
    return overlaps;
  });
}
