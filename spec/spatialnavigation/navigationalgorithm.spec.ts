import { getElementInDirection } from '../../src/ts/spatialnavigation/navigationalgorithm';
import { Direction } from '../../src/ts/spatialnavigation/spatialnavigation';

describe('getElementInDirection', () => {
  const currentHtmlElement = mockHtmlElement(100, 100, 100, 100); // center (150, 150)
  const nonOverlappingHtmlElements = [
    mockHtmlElement(40, 100, 100, 100), // left, non-overlapping
    mockHtmlElement(100, 40, 100, 100), // top. non-overlapping
    mockHtmlElement(160, 100, 100, 100), // right, non-overlapping
    mockHtmlElement(100, 160, 100, 100), // bottom, non-overlapping
  ];
  const overlappingHtmlElements = [
    mockHtmlElement(60, 100, 100, 100), // left, overlapping
    mockHtmlElement(100, 60, 100, 100), // top, overlapping
    mockHtmlElement(140, 100, 100, 100), // right, overlapping
    mockHtmlElement(100, 140, 100, 100), // bottom, overlapping
  ];

  describe('without other elements', () => {
    test.each`
      direction
      ${Direction.UP}
      ${Direction.RIGHT}
      ${Direction.DOWN}
      ${Direction.LEFT}
    `('should return undefined in case there is only a single element with direction=$direction', ({ direction }) => {
      const elementInDirection = getElementInDirection(currentHtmlElement, [], direction);

      expect(elementInDirection).not.toBeDefined();
    });
  });

  describe('with non-overlapping elements', () => {
    test.each`
      direction          | expectedElement
      ${Direction.LEFT}  | ${nonOverlappingHtmlElements[0]}
      ${Direction.UP}    | ${nonOverlappingHtmlElements[1]}
      ${Direction.RIGHT} | ${nonOverlappingHtmlElements[2]}
      ${Direction.DOWN}  | ${nonOverlappingHtmlElements[3]}
    `('should return $expectedElement with direction=$direction', ({ direction, expectedElement }) => {
      const elementInDirection = getElementInDirection(currentHtmlElement, nonOverlappingHtmlElements, direction);

      expect(elementInDirection).toEqual(expectedElement);
    });
  });

  describe('with overlapping elements', () => {
    test.each`
      direction          | expectedElement
      ${Direction.LEFT}  | ${overlappingHtmlElements[0]}
      ${Direction.UP}    | ${overlappingHtmlElements[1]}
      ${Direction.RIGHT} | ${overlappingHtmlElements[2]}
      ${Direction.DOWN}  | ${overlappingHtmlElements[3]}
    `('should return $expectedElement with direction=$direction', ({ direction, expectedElement }) => {
      const elementInDirection = getElementInDirection(currentHtmlElement, overlappingHtmlElements, direction);

      expect(elementInDirection).toEqual(expectedElement);
    });
  });

  it('should return null if there is no active element', () => {
    const elementInDirection = getElementInDirection(undefined as any, nonOverlappingHtmlElements, Direction.RIGHT);

    expect(elementInDirection).toEqual(null);
  });

  it('should return the closer element even if its angle is larger', () => {
    const mostInLineElement = mockHtmlElement(300, 100, 100, 100);
    const closestInLineElement = mockHtmlElement(200, 120, 100, 100);

    const elementInDirection = getElementInDirection(
      currentHtmlElement,
      [mostInLineElement, closestInLineElement],
      Direction.RIGHT,
    );

    expect(elementInDirection).toEqual(closestInLineElement);
  });

  it('should return undefined if there is no element element in the given direction', () => {
    const otherElements = [ mockHtmlElement(190, 200, 100, 100) ];

    const elementInDirection = getElementInDirection(currentHtmlElement, otherElements, Direction.RIGHT);

    expect(elementInDirection).toEqual(undefined);
  });
});

function mockHtmlElement(x: number, y: number, width: number, height: number): HTMLElement {
  return { getBoundingClientRect: () => ({ x, y, width, height }) } as unknown as HTMLElement;
}
