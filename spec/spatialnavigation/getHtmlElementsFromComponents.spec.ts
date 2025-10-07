import { resolveAllComponents } from '../../src/ts/spatialnavigation/helper/resolveAllComponents';
import { createComponentMock, createContainerMock } from '../helper/mockComponent';

describe('resolveAllComponents', () => {
  it('should resolve components recursively', () => {
    const component1 = createComponentMock();
    const component2 = createComponentMock();
    const component3 = createComponentMock();
    const component4 = createComponentMock();
    const expectedComponents = [component1, component2, component3, component4];

    const container = createContainerMock(
      createContainerMock(component1),
      createContainerMock(createContainerMock(component2, component3)),
      component4,
    );

    const components = resolveAllComponents(container);
    expect(components).toEqual(expectedComponents);
  });
});
