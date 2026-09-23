import { Page } from '@playwright/test';

/**
 * Resolved values of the given properties on the element the selector matches.
 *
 * Throws when the selector matches nothing, so a scenario that renders no cue fails instead of
 * comparing two empty results and passing.
 */
export async function computedStyles(page: Page, selector: string, properties: string[]): Promise<string[]> {
  return page.evaluate(
    ({ target, names }) => {
      const element = document.querySelector(target);
      if (element === null) {
        throw new Error(`nothing matches ${target}, so there is no styling to measure`);
      }

      const resolved = getComputedStyle(element);
      return names.map(name => resolved.getPropertyValue(name));
    },
    { target: selector, names: properties },
  );
}

/**
 * Inline value of a property, as opposed to the value the cascade resolves for it.
 *
 * Throws when the selector matches nothing, or when the element carries no inline value, so an
 * assertion cannot pass against an element the player never styled.
 */
export async function inlineStyle(page: Page, selector: string, property: string): Promise<string> {
  return page.evaluate(
    ({ target, name }) => {
      const element = document.querySelector<HTMLElement>(target);
      if (element === null) {
        throw new Error(`nothing matches ${target}, so there is no inline styling to read`);
      }

      const value = element.style.getPropertyValue(name);
      if (value === '') {
        throw new Error(`${target} carries no inline ${name}`);
      }
      return value;
    },
    { target: selector, name: property },
  );
}
