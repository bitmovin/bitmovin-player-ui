// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = unknown> = { new (...params: any[]): T };
type GenericMock = { [key: string]: jest.Mock };

function isStringIndexable(obj: object): obj is { [key: string]: unknown } {
  return Boolean(obj) && Object.getOwnPropertyNames(obj).length > 0;
}

function isFunction(obj: object, key: string): boolean {
  try {
    return isStringIndexable(obj) && obj[key] instanceof Function;
  } catch {
    return false;
  }
}

function resolveClassMethods<T>(obj?: Constructor<T>, classMethods: string[] = []): string[] {
  if (!obj) {
    return classMethods;
  }

  const newClassMethods = [...classMethods, ...Object.getOwnPropertyNames(obj).filter(name => isFunction(obj, name))];

  return resolveClassMethods(Object.getPrototypeOf(obj), newClassMethods);
}

function addMockMethod(mock: GenericMock, methodName: string): GenericMock {
  mock[methodName] = jest.fn();

  return mock;
}

export function getClassMethods<T>(constructor: Constructor<T>) {
  return resolveClassMethods(constructor);
}

export function mockClass<T>(constructor: Constructor<T>): jest.Mocked<T> {
  return getClassMethods(constructor.prototype).reduce(
    addMockMethod,
    jest.fn() as unknown as GenericMock,
  ) as unknown as jest.Mocked<T>;
}

export function mockObject(propertyNames: string[]): object {
  return propertyNames.reduce((obj, name) => {
    (obj as any)[name] = jest.fn();
    return obj;
  }, {});
}
