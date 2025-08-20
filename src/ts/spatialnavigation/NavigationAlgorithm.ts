import { AnyComponent, Direction, Focusable } from './types';
import { FocusableContainer } from './FocusableContainer';
import { toHtmlElement } from './helper/toHtmlElement';

interface Vector {
  x: number;
  y: number;
}

/**
 * Calculates the length of a vector.
 *
 * @param vector The vector to calculate the length of
 */
function length(vector: Vector): number {
  return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
}

/**
 * Normalizes the given vector.
 *
 * @param vector The vector to normalize
 */
function normalize(vector: Vector): Vector {
  const len = length(vector);

  return {
    x: vector.x / len,
    y: vector.y / len,
  };
}

/**
 * Calculates the dot product between 2 vectors.
 *
 * @param a The first vector
 * @param b The second vector
 */
function dotProduct(a: Vector, b: Vector): number {
  return a.x * b.x + a.y * b.y;
}

/**
 * Calculates the distance between the 2 points pointed to by the provided vectors.
 *
 * @param a The first vector
 * @param b The second vector
 */
function distance(a: Vector, b: Vector): number {
  return length({
    x: b.x - a.x,
    y: b.y - a.y,
  });
}

/**
 * Returns a vector that corresponds to the center of the provided element.
 *
 * @param element The element to get the center of
 */
function getElementVector(element: HTMLElement): Vector {
  const boundingRect = getBoundingRectFromElement(element);

  return {
    x: boundingRect.x + boundingRect.width / 2,
    y: boundingRect.y + boundingRect.height / 2,
  };
}

/**
 * Returns the angle in degrees between the unit vector pointing in the given {Direction} and the unit vector that
 * points from the current element to another element.
 *
 * @param a The vector of the current element
 * @param b The vector of the other element
 * @param direction The direction to move along
 */
function calculateAngle(a: Vector, b: Vector, direction: Direction): number {
  const directionVector = {
    x: (direction === Direction.LEFT ? -1 : direction === Direction.RIGHT ? 1 : 0),
    y: (direction === Direction.UP ? -1 : direction === Direction.DOWN ? 1 : 0),
  };

  const elementVector = normalize({
    x: b.x - a.x,
    y: b.y - a.y,
  });

  const angleCos = dotProduct(directionVector, elementVector) / (length(directionVector) * length(elementVector));

  return Math.acos(angleCos) * 180 / Math.PI;
}

/**
 * Returns the best matching element to the current element when trying to navigate in the provided direction. Returns
 * undefined, if there is not element in the given direction.
 *
 * @param activeComponent The currently selected element
 * @param components The list of all elements that can be navigated to
 * @param direction The direction in which to navigate
 */
export function getComponentInDirection(
  activeComponent: AnyComponent,
  components: Focusable[],
  direction: Direction,
): Focusable | undefined {
  if (!activeComponent) return undefined;

  // We use a cutoff angle of 89 degrees to avoid selecting elements that are in a square angle to the current element.
  const cutoffAngle = 89;
  const activeElement = toHtmlElement(activeComponent);
  const activeElemVector = getElementVector(activeElement);

  const availableElements = components
    // Convert components to HTML elements
    .map(component => {
      if (component instanceof FocusableContainer) {
        // Use the whole container's HTML element if it is a FocusableContainer
        return { component, element: toHtmlElement(component.container) }
      } else {
        return { component, element: toHtmlElement(component) }
      }
    })
    // don't take the current element into account
    .filter(({ component }) => component !== activeComponent)
    // get the angle between, and distance to any other element from the current element
    .map(({ element, component }) => {
      const elementVector = getElementVector(element);
      const dist = distance(activeElemVector, elementVector);
      const angle = calculateAngle(activeElemVector, elementVector, direction);

      return { angle, dist, element, component };
    })
    // filter out elements that are not in the given direction
    .filter(({ angle }) => angle < cutoffAngle);

  const zeroAngleElements = availableElements
    .filter(({ angle }) => angle === 0);

  let sortedElements: Focusable[];
  if (zeroAngleElements.length > 0) {
    sortedElements = zeroAngleElements
      // Favor elements that are in the exact direction of the current element and sort them by distance
      .sort(({ dist: distA }, { dist: distB }) => distA - distB)
      .map(({ component }) => component);
  } else {
    const nonZeroAngleElements = availableElements.filter(({ angle }) => angle !== 0);
    sortedElements = nonZeroAngleElements
      // Sort all non-zero elements by distance to the current element
      .sort(({ dist: distA }, { dist: distB }) => {
        return distA - distB;
      })
      .map(({ component }) => component);
  }

  return sortedElements.shift();
}

/**
 * Returns DOMRect like object containing horizontal X and vertical Y coordinates from and HTMLElement.
 * Handles use-cases for getBoundingClientRect when the return type can be either
 * a ClientRect or DOMRect object type.
 *
 * @param element The currently selected element
 */
export function getBoundingRectFromElement(element: HTMLElement) {
  const boundingRect = element.getBoundingClientRect();

  if (typeof boundingRect.x !== 'number' && typeof boundingRect.y !== 'number') {
    boundingRect.x = boundingRect.left;
    boundingRect.y = boundingRect.top;
  }

  return boundingRect;
}

