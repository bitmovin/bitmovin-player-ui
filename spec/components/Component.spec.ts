import { Component } from '../../src/ts/components/Component';
import { Button, ButtonConfig } from '../../src/ts/components/buttons/Button';

type ComponentFactory = () => Component<any>;

const componentFactories: Array<{ name: string; create: ComponentFactory }> = [
  { name: 'Component', create: () => new Component() },
  { name: 'Button', create: () => new Button<ButtonConfig>({}) },
];

describe('Component', () => {
  describe('disabled state', () => {
    it.each(componentFactories)('should set aria-disabled when a $name is disabled', ({ create }) => {
      const component = create();

      component.disable();

      expect(component.getDomElement().attr('aria-disabled')).toBe('true');
    });

    it.each(componentFactories)('should remove aria-disabled when a $name is enabled again', ({ create }) => {
      const component = create();
      component.disable();

      component.enable();

      expect(component.getDomElement().attr('aria-disabled')).toBeNull();
    });

    it.each(componentFactories)('should not set aria-disabled on an enabled $name', ({ create }) => {
      const component = create();
      component.initialize();

      expect(component.getDomElement().attr('aria-disabled')).toBeNull();
    });

    it.each(componentFactories)('should set aria-disabled when a $name is configured as disabled', ({ create }) => {
      const component = create();
      component.getConfig().disabled = true;

      component.initialize();

      expect(component.getDomElement().attr('aria-disabled')).toBe('true');
    });

    it.each(componentFactories)('should keep a disabled $name focusable', ({ create }) => {
      const component = create();

      component.disable();

      expect(component.getDomElement().attr('disabled')).toBeNull();
    });
  });
});
