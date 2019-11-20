import {Component, ComponentConfig} from './components/component';
import {Container} from './components/container';

export namespace UIUtils {
  export interface TreeTraversalCallback {
    (component: Component<ComponentConfig>, parent?: Component<ComponentConfig>): void;
  }

  export function traverseTree(component: Component<ComponentConfig>, visit: TreeTraversalCallback): void {
    let recursiveTreeWalker = (component: Component<ComponentConfig>, parent?: Component<ComponentConfig>) => {
      visit(component, parent);

      // If the current component is a container, visit it's children
      if (component instanceof Container) {
        for (let childComponent of component.getComponents()) {
          recursiveTreeWalker(childComponent, component);
        }
      }
    };

    // Walk and configure the component tree
    recursiveTreeWalker(component);
  }

  // From: https://github.com/nfriend/ts-keycode-enum/blob/master/Key.enum.ts
  export enum KeyCode {
    LeftArrow = 37,
    UpArrow = 38,
    RightArrow = 39,
    DownArrow = 40,
  }
}
