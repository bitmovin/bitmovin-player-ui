import { Direction } from './types';

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
  const boundingRect = element.getBoundingClientRect();

  return {
    x: boundingRect.left + boundingRect.width / 2,
    y: boundingRect.top + boundingRect.height / 2,
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
 * Returns the closest element to the current element when trying to navigate in the provided direction. Returns
 * undefined, if there is not element in the given direction.
 *
 * @param activeElement The currently selected element
 * @param elements The list of all elements that can be navigated to
 * @param direction The direction in which to navigate
 */
export function getElementInDirection(
  activeElement: HTMLElement,
  elements: HTMLElement[],
  direction: Direction,
): HTMLElement | undefined {
  if (!activeElement) return undefined;

  const cutoffAngle = 45;
  const activeElemVector = getElementVector(activeElement);

  return elements
    // don't take the current element into account
    .filter(elem => elem !== activeElement)
    // get the angle between, and distance to any other element from the current element
    .map(element => {
      const elementVector = getElementVector(element);
      const dist = distance(activeElemVector, elementVector);
      const angle = calculateAngle(activeElemVector, elementVector, direction);

      return { angle, dist, element };
    })
    // filter out any elements that don't align with the direction we're trying to move in
    .filter(({ angle }) => angle <= cutoffAngle)
    // sort the resulting elements based on their distance to the current element in ascending order
    .sort(({ angle: angleA, dist: distA }, { angle: angleB, dist: distB }) => (angleA - angleB) + (distA - distB))
    // return the element closest to the current element
    .shift()?.element;
}
