import { Container } from '../../src/ts/components/container';
import { Component } from '../../src/ts/components/component';
import { ListBox } from '../../src/ts/components/listbox';
import { getHtmlElementsFromComponents } from '../../src/ts/spatialnavigation/gethtmlelementsfromcomponents';

class DummyListBox extends ListBox {
  public className = 'ListBox';
}

class DummyContainer extends Container<{}> {
  public className = 'Container';
}

class DummyComponent extends Component<{}> {
  public className = 'Component';
}

describe('getHtmlElementsFromComponents', () => {
  test.each`
    component
    ${createContainerMock()}
    ${createComponentMock()}
    ${createListBoxMock()}
  `('should return an empty array for an empty $component.className', ({ component }) => {
    const htmlElements = getHtmlElementsFromComponents([component]);

    expect(htmlElements).toEqual([]);
  });

  it('should resolve components recursively', () => {
    const listBoxEntries = [
      document.createElement('div'),
      document.createElement('div'),
      document.createElement('div'),
    ];
    const componentElements = [
      document.createElement('button'),
      document.createElement('button'),
    ];
    const expectedHtmlElements = [componentElements[0], ...listBoxEntries];

    const container = createContainerMock(
      createContainerMock(createComponentMock()),
      createContainerMock(createContainerMock(createComponentMock(...componentElements))),
      createListBoxMock(...listBoxEntries),
    );

    const htmlElements = getHtmlElementsFromComponents([container as Container<any>]);

    expect(htmlElements).toEqual(expectedHtmlElements);
  });

  it('should extract HTMLElements from all components', () => {
    const expectedHtmlElements = [
      document.createElement('sponge'),
      document.createElement('bob'),
      document.createElement('square'),
      document.createElement('pants'),
    ];
    const components = expectedHtmlElements.map(elem => createComponentMock(elem));

    const htmlElements = getHtmlElementsFromComponents(components as any);

    expect(htmlElements).toEqual(expectedHtmlElements);
  });
});

function createListBoxMock(...elements: HTMLElement[]): jest.Mocked<DummyListBox> {
  const listBox = new DummyListBox();

  listBox.getDomElement = jest.fn().mockReturnValue({ get: () => [{ children: elements }] });

  return listBox as jest.Mocked<DummyListBox>;
}

function createContainerMock(...components: DummyComponent[]): jest.Mocked<DummyContainer> {
  const container = new DummyContainer({});

  container.isHidden = jest.fn();
  container.getComponents = jest.fn().mockReturnValue(components);

  return container as jest.Mocked<DummyContainer>;
}

function createComponentMock(...elements: HTMLElement[]): jest.Mocked<DummyComponent> {
  const component = new DummyComponent();

  component.getDomElement = jest.fn().mockReturnValue({ get: () => elements });

  return component as jest.Mocked<DummyComponent>;
}
