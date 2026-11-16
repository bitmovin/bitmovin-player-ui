import { getKeyboardEventKey } from '../../src/ts/utils/getKeyboardEventKey';

const createKeyboardEvent = (key: string | undefined, keyCode: number): KeyboardEvent => {
  const event = new KeyboardEvent('keydown', { keyCode } as KeyboardEventInit);
  // jsdom defaults `key` to an empty string, while old engines leave it undefined
  Object.defineProperty(event, 'key', { value: key });
  return event;
};

describe('getKeyboardEventKey', () => {
  it.each([
    ['Tab', 9],
    ['Escape', 27],
    ['Home', 36],
    ['End', 35],
    ['ArrowLeft', 37],
    ['ArrowUp', 38],
    ['ArrowRight', 39],
    ['ArrowDown', 40],
  ])('should return %p for keyCode %p when the event has no key', (expectedKey, keyCode) => {
    expect(getKeyboardEventKey(createKeyboardEvent(undefined, keyCode))).toBe(expectedKey);
    expect(getKeyboardEventKey(createKeyboardEvent('', keyCode))).toBe(expectedKey);
    expect(getKeyboardEventKey(createKeyboardEvent('Unidentified', keyCode))).toBe(expectedKey);
  });

  it('should fall back to which when the event has neither key nor keyCode', () => {
    const event = createKeyboardEvent(undefined, 0);
    Object.defineProperty(event, 'which', { value: 27 });

    expect(getKeyboardEventKey(event)).toBe('Escape');
  });

  it.each([
    ['Esc', 'Escape'],
    ['Up', 'ArrowUp'],
    ['Down', 'ArrowDown'],
    ['Left', 'ArrowLeft'],
    ['Right', 'ArrowRight'],
  ])('should map the legacy key %p to %p', (legacyKey, expectedKey) => {
    expect(getKeyboardEventKey(createKeyboardEvent(legacyKey, 0))).toBe(expectedKey);
  });

  it.each([
    ['Escape', 27],
    ['ArrowUp', 38],
    ['Enter', 13],
    ['a', 65],
    [' ', 32],
  ])('should return the standard key %p unchanged', (key, keyCode) => {
    expect(getKeyboardEventKey(createKeyboardEvent(key, keyCode))).toBe(key);
  });

  it('should prefer the key over a keyCode that maps to a different key', () => {
    expect(getKeyboardEventKey(createKeyboardEvent('GamepadDPadUp', 38))).toBe('GamepadDPadUp');
  });

  it.each([undefined, ''])('should return the key %p for keyCodes it does not map', key => {
    expect(getKeyboardEventKey(createKeyboardEvent(key, 13))).toBe(key);
  });
});
