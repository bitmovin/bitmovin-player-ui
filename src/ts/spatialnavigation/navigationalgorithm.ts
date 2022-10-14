import { Direction } from './spatialnavigation';

interface Vector {
  x: number;
  y: number;
}

function length(vector: Vector): number {
  return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
}

function normalize(vector: Vector): Vector {
  const len = length(vector);

  return {
    x: vector.x / len,
    y: vector.y / len,
  };
}

function dotProduct(a: Vector, b: Vector): number {
  return a.x * b.x + a.y * b.y;
}

function distance(vector1: Vector, vector2: Vector) {
  return length({
    x: vector2.x - vector1.x,
    y: vector2.y - vector1.y,
  });
}

function getElementVector(element: HTMLElement): Vector {
  const boundingRect = element.getBoundingClientRect();

  return {
    x: boundingRect.x + boundingRect.width / 2,
    y: boundingRect.y + boundingRect.height / 2,
  };
}

function calculateAngle(point1: Vector, point2: Vector, direction: Direction): number {
  const directionVector = {
    x: (direction === Direction.LEFT ? -1 : direction === Direction.RIGHT ? 1 : 0),
    y: (direction === Direction.UP ? -1 : direction === Direction.DOWN ? 1 : 0),
  };

  const elementVector = normalize({
    x: point2.x - point1.x,
    y: point2.y - point1.y,
  });

  const angleCos = dotProduct(directionVector, elementVector) / (length(directionVector) * length(elementVector));

  return Math.acos(angleCos) * 180 / Math.PI;
}

export function getElementInDirection(
  activeElement: HTMLElement,
  elements: HTMLElement[],
  direction: Direction,
): HTMLElement | undefined {
  if (!activeElement) return null;

  const cutoffAngle = 45;
  const activeElemVector = getElementVector(activeElement);

  return elements
    .filter(elem => elem !== activeElement)
    .map(elem => {
      const elemVector = getElementVector(elem);
      const dist = distance(activeElemVector, elemVector);
      const angle = calculateAngle(activeElemVector, elemVector, direction);
      return [angle, dist, elem] as const;
    })
    .filter(([angle]) => angle <= cutoffAngle)
    .sort(([angleA, lengthA], [angleB, lengthB]) => (angleA - angleB) + (lengthA - lengthB))
    .shift()?.[2];
}
