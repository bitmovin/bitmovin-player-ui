import { mockClass, mockObject } from './mockClass';
import { MockHelper } from './MockHelper';
import { Component } from '../../src/ts/components/Component';
import { Container } from '../../src/ts/components/Container';

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

class DummyComponent extends Component<{}> {
  public className = 'Component';
}

class DummyContainer extends Container<{}> {
  public className = 'Container';
}

export function createContainerMock(...components: DummyComponent[]): jest.Mocked<DummyContainer> {
  const container = new DummyContainer({});

  container.isHidden = jest.fn();
  container.getComponents = jest.fn().mockReturnValue(components);

  return container as jest.Mocked<DummyContainer>;
}

export function createComponentMock(...elements: HTMLElement[]): jest.Mocked<DummyComponent> {
  const component = new DummyComponent();

  component.getDomElement = jest.fn().mockReturnValue({ get: (index?: number) => {
    if (index === undefined) {
      return elements;
    } else if (!elements || index >= elements.length || index < -elements.length) {
      return undefined;
    } else if (index < 0) {
      return elements[elements.length - index];
    } else {
      return elements[index];
    }
  } });

  return component as jest.Mocked<DummyComponent>;
}
