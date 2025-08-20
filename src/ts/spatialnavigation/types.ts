import { Component, ComponentConfig } from '../components/Component';
import { Container, ContainerConfig } from '../components/Container';
import { FocusableContainer } from './FocusableContainer';

export type AnyComponent = Component<ComponentConfig>;
export type AnyContainer = Container<ContainerConfig>;
export type Callback<T> = (data: T, target: AnyComponent, preventDefault: () => void) => void;
export type NavigationCallback = Callback<Direction>;
export type ActionCallback = Callback<Action>;
export type KeyMap = {
  [keyCode: number]: Action | Direction;
};
export type Focusable = AnyComponent | FocusableContainer;

export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

export enum Action {
  SELECT = 'select',
  BACK = 'back',
}
