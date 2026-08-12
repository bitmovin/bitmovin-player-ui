export function getConstructorNames(constructor: { prototype: object }): string[] {
  const constructorNames: string[] = [];
  let prototype = constructor.prototype;

  while (prototype && prototype.constructor && prototype.constructor.name) {
    constructorNames.unshift(prototype.constructor.name);
    prototype = Object.getPrototypeOf(prototype);
  }

  return constructorNames;
}
