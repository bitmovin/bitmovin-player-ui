import { mockClass, mockObject } from './mockClass';
import { MockHelper } from './MockHelper';

type ConstructorType<T> = new (...args : any[]) => T;

export function mockHtmlElement() {
  return mockObject(['focus', 'blur', 'addEventListener', 'removeEventListener', 'children', 'click']) as jest.Mocked<HTMLElement>;
}

export function mockComponent<T extends ConstructorType<any>>(component: T) {
  const componentMock: jest.Mocked<InstanceType<T>> = mockClass(component);
  const componentDOMMock = MockHelper.generateDOMMock();
  const componentHTMLMock = mockHtmlElement();

  componentDOMMock.get.mockReturnValue([componentHTMLMock] as any);

  componentMock.getDomElement.mockReturnValue(componentDOMMock);

  return componentMock;
}

export function getFirstDomElement(componentMock: jest.Mocked<any>): jest.Mocked<HTMLElement> {
  return componentMock.getDomElement().get()[0] as jest.Mocked<HTMLElement>;
}
