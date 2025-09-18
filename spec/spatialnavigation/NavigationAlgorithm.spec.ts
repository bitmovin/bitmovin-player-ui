import { getComponentInDirection } from '../../src/ts/spatialnavigation/NavigationAlgorithm';
import { Direction } from '../../src/ts/spatialnavigation/types';
import { createComponentMock } from '../helper/mockComponent';

describe('getElementInDirection', () => {
  const currentComponent = createComponentMock(mockHtmlElement(100, 100, 100, 100)); // center (150, 150)
  const nonOverlappingComponents = [
    createComponentMock(mockHtmlElement(40, 100, 100, 100)), // left, non-overlapping
    createComponentMock(mockHtmlElement(100, 40, 100, 100)), // top. non-overlapping
    createComponentMock(mockHtmlElement(160, 100, 100, 100)), // right, non-overlapping
    createComponentMock(mockHtmlElement(100, 160, 100, 100)), // bottom, non-overlapping
  ];
  const overlappingComponents = [
    createComponentMock(mockHtmlElement(60, 100, 100, 100)), // left, overlapping
    createComponentMock(mockHtmlElement(100, 60, 100, 100)), // top, overlapping
    createComponentMock(mockHtmlElement(140, 100, 100, 100)), // right, overlapping
    createComponentMock(mockHtmlElement(100, 140, 100, 100)), // bottom, overlapping
  ];

  describe('without other components', () => {
    test.each`
      direction
      ${Direction.UP}
      ${Direction.RIGHT}
      ${Direction.DOWN}
      ${Direction.LEFT}
    `('should return undefined in case there is only a single element with direction=$direction', ({ direction }) => {
      const elementInDirection = getComponentInDirection(currentComponent, [], direction);

      expect(elementInDirection).not.toBeDefined();
    });
  });

  describe('with non-overlapping components', () => {
    test.each`
      direction          | expectedComponent
      ${Direction.LEFT}  | ${nonOverlappingComponents[0]}
      ${Direction.UP}    | ${nonOverlappingComponents[1]}
      ${Direction.RIGHT} | ${nonOverlappingComponents[2]}
      ${Direction.DOWN}  | ${nonOverlappingComponents[3]}
    `('should return $expectedComponent with direction=$direction', ({ direction, expectedComponent }) => {
      const elementInDirection = getComponentInDirection(currentComponent, nonOverlappingComponents, direction);

      expect(elementInDirection).toEqual(expectedComponent);
    });
  });

  describe('with overlapping components', () => {
    test.each`
      direction          | expectedComponent
      ${Direction.LEFT}  | ${overlappingComponents[0]}
      ${Direction.UP}    | ${overlappingComponents[1]}
      ${Direction.RIGHT} | ${overlappingComponents[2]}
      ${Direction.DOWN}  | ${overlappingComponents[3]}
    `('should return $expectedComponent with direction=$direction', ({ direction, expectedComponent }) => {
      const elementInDirection = getComponentInDirection(currentComponent, overlappingComponents, direction);

      expect(elementInDirection).toEqual(expectedComponent);
    });
  });

  it('should return null if there is no active component', () => {
    const elementInDirection = getComponentInDirection(undefined as any, nonOverlappingComponents, Direction.RIGHT);

    expect(elementInDirection).toEqual(undefined);
  });

  describe('with a component with an angle of 0', () => {
    it('should return the component with angle 0 even if its distance is larger', () => {
      const mostInLineComponent = createComponentMock(mockHtmlElement(300, 100, 100, 100));
      const closestInLineComponent = createComponentMock(mockHtmlElement(200, 120, 100, 100));

      const elementInDirection = getComponentInDirection(
        currentComponent,
        [mostInLineComponent, closestInLineComponent],
        Direction.RIGHT,
      );

      expect(elementInDirection).toEqual(mostInLineComponent);
    });
  });
  describe('without a component with an angle of 0', () => {
    it('should return the closer component even if its angle is larger', () => {
      const mostInLineComponent = createComponentMock(mockHtmlElement(300, 110, 100, 100));
      const closestInLineComponent = createComponentMock(mockHtmlElement(200, 120, 100, 100));

      const elementInDirection = getComponentInDirection(
        currentComponent,
        [mostInLineComponent, closestInLineComponent],
        Direction.RIGHT,
      );

      expect(elementInDirection).toEqual(closestInLineComponent);
    });
  });

  it('should return undefined if there is no component in the given direction', () => {
    const otherComponents = [ createComponentMock(mockHtmlElement(50, 200, 100, 100)) ];

    const elementInDirection = getComponentInDirection(currentComponent, otherComponents, Direction.RIGHT);

    expect(elementInDirection).toEqual(undefined);
  });
});

function mockHtmlElement(x: number, y: number, width: number, height: number): HTMLElement {
  return { getBoundingClientRect: () => ({ x, y, width, height }) } as unknown as HTMLElement;
}
