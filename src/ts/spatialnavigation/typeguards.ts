import { Component } from '../components/component';
import { SettingsPanel } from '../components/settingspanel';
import { Container } from '../components/container';
import { ListBox } from '../components/listbox';
import { Action, Direction } from './types';

export function isSettingsPanel(component: Component<unknown>): component is SettingsPanel {
  return component instanceof SettingsPanel;
}

export function isComponent(obj: unknown): obj is Component<unknown> {
  return obj !== null && obj !== undefined && obj instanceof Component;
}

export function isContainer(obj: unknown): obj is Container<unknown> {
  return obj !== null && obj !== undefined && obj instanceof Container;
}

export function isListBox(obj: unknown): obj is ListBox {
  return obj instanceof ListBox;
}

export function isDirection(direction: unknown): direction is Direction {
  return typeof direction === 'string' && Object.values<string>(Direction).includes(direction);
}

export function isAction(action: unknown): action is Action {
  return typeof action === 'string' && Object.values<string>(Action).includes(action);
}
