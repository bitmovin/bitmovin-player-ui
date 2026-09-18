let publicExportNames: Map<object, string>;

// Lazy require to avoid circular deps — main.ts can't be statically imported while Component is initializing.

function getPublicExportName(constructor: object): string | undefined {
  if (publicExportNames == null) {
    publicExportNames = new Map();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const publicExports = require('../main') as { [exportName: string]: unknown };
    for (const exportName of Object.keys(publicExports)) {
      const exportValue = publicExports[exportName];
      if (typeof exportValue === 'function' && !publicExportNames.has(exportValue)) {
        publicExportNames.set(exportValue, exportName);
      }
    }
  }

  return publicExportNames.get(constructor);
}

// Uses export names from main.ts instead of constructor.name so overrides work in minified builds.
export function getConstructorNames(constructor: { prototype: object }): string[] {
  const constructorNames: string[] = [];
  let prototype = constructor.prototype;

  while (prototype && prototype.constructor) {
    const constructorName = getPublicExportName(prototype.constructor) ?? prototype.constructor.name;

    if (!constructorName) {
      break;
    }

    constructorNames.unshift(constructorName);
    prototype = Object.getPrototypeOf(prototype);
  }

  return constructorNames;
}
