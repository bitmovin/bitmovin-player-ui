import { UIUtils } from './UIUtils';

/**
 * Legacy `KeyboardEvent.key` values that older engines (e.g. Safari before 10.1, Edge before 79) report instead of
 * the standard ones.
 */
const LEGACY_KEYS: { [legacyKey: string]: string } = {
  Esc: 'Escape',
  Up: 'ArrowUp',
  Down: 'ArrowDown',
  Left: 'ArrowLeft',
  Right: 'ArrowRight',
};

/**
 * Returns the standard `KeyboardEvent.key` value of a keyboard event, also on engines that do not report it.
 *
 * Old engines the UI supports (e.g. webOS 3, Tizen 2.4 and 3.0, Safari before 10.1, PlayStation 4) either leave
 * `key` unset or report legacy values such as `Esc` or `Up`. Legacy values are mapped to their standard ones, and
 * without a `key` the value is derived from the deprecated `keyCode` for the keys the UI handles this way (Tab,
 * Escape, Home, End and the arrow keys). Any other `key` is returned as is.
 *
 * @param event the keyboard event
 * @returns the standard key value, or the event's own `key` if it cannot be determined
 */
export function getKeyboardEventKey(event: KeyboardEvent): string {
  const key = event.key;
  if (key && key !== 'Unidentified') {
    return LEGACY_KEYS[key] || key;
  }

  switch (event.keyCode || event.which) {
    case UIUtils.KeyCode.Tab:
      return 'Tab';
    case UIUtils.KeyCode.Escape:
      return 'Escape';
    case UIUtils.KeyCode.Home:
      return 'Home';
    case UIUtils.KeyCode.End:
      return 'End';
    case UIUtils.KeyCode.LeftArrow:
      return 'ArrowLeft';
    case UIUtils.KeyCode.UpArrow:
      return 'ArrowUp';
    case UIUtils.KeyCode.RightArrow:
      return 'ArrowRight';
    case UIUtils.KeyCode.DownArrow:
      return 'ArrowDown';
    default:
      return key;
  }
}
