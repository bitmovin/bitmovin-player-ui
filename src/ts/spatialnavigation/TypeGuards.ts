import { Component } from '../components/Component';
import { SettingsPanel, SettingsPanelConfig } from '../components/settings/SettingsPanel';
import { Container } from '../components/Container';
import { Action, Direction, Focusable } from './types';
import { FocusableContainer } from './FocusableContainer';

export function isSettingsPanel(component: Component<unknown>): component is SettingsPanel<SettingsPanelConfig> {
  return component instanceof SettingsPanel;
}

export function isComponent(obj: unknown): obj is Component<unknown> {
  return obj !== null && obj !== undefined && obj instanceof Component;
}

export function isContainer(obj: unknown): obj is Container<unknown> {
  return obj !== null && obj !== undefined && obj instanceof Container;
}

export function isDirection(direction: unknown): direction is Direction {
  return typeof direction === 'string' && Object.values<string>(Direction).includes(direction);
}

export function isAction(action: unknown): action is Action {
  return typeof action === 'string' && Object.values<string>(Action).includes(action);
}

export function isFocusable(component: Focusable): boolean {
  if (component instanceof FocusableContainer) {
    return true;
  }
  return component.isShown() && component.getConfig().tabIndex >= 0;
}
