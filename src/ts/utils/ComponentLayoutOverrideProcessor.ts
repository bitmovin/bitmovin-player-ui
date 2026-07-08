import type { UIVariantIdentifier } from '../UIManager';
import type { UIConfig } from '../UIConfig';
import { UIComponentLayoutOverride } from '../UIComponentLayoutOverrides';
import type { UIComponentLayoutOverrideMap } from '../UIComponentLayoutOverrides';
import { Component, ComponentConfig } from '../components/Component';
import { Container, ContainerConfig } from '../components/Container';
import { SettingsPanelItem } from '../components/settings/SettingsPanelItem';

export class ComponentLayoutOverrideProcessor {
  private config: UIConfig;
  private variantIdentifier?: UIVariantIdentifier;

  constructor(config: UIConfig = {}, variantIdentifier?: UIVariantIdentifier) {
    this.config = config;
    this.variantIdentifier = variantIdentifier;
  }

  process(uiContainer: Container<ContainerConfig>): void {
    this.removeInactiveComponents(uiContainer);
  }

  private removeInactiveComponents(container: Container<ContainerConfig>): void {
    const components = container.getComponents().slice();
    for (const component of components) {
      if (this.shouldRemove(component)) {
        this.removeComponent(container, component);
        this.releaseComponentTree(component);
      } else if (component instanceof Container) {
        this.removeInactiveComponents(component);
      }
    }
  }

  private shouldRemove(component: Component<ComponentConfig>): boolean {
    const componentTypeName = component.constructor.name;
    if (!this.isIncluded(componentTypeName)) {
      return true;
    }

    if (component instanceof SettingsPanelItem) {
      const settingComponent = component.getConfig().settingComponent;
      return settingComponent != null && !this.isIncluded(settingComponent.constructor.name);
    }

    return false;
  }

  private isIncluded(componentTypeName: string): boolean {
    let override = this.getOverride(this.config.componentLayoutOverrides, componentTypeName);

    if (this.variantIdentifier != null && this.config.componentLayoutOverrides != null) {
      const variantOverride = this.getOverride(
        this.config.componentLayoutOverrides[this.variantIdentifier],
        componentTypeName,
      );
      if (variantOverride != null) {
        override = variantOverride;
      }
    }

    switch (override) {
      case UIComponentLayoutOverride.Include:
        return true;
      case UIComponentLayoutOverride.Exclude:
        return false;
      default:
        return true;
    }
  }

  private getOverride(
    overrides: UIComponentLayoutOverrideMap | undefined,
    componentTypeName: string,
  ): UIComponentLayoutOverride {
    return overrides && (overrides as { [componentTypeName: string]: UIComponentLayoutOverride })[componentTypeName];
  }

  private removeComponent(container: Container<ContainerConfig>, component: Component<ComponentConfig>): void {
    const componentIndex = container.getComponents().indexOf(component);
    if (componentIndex !== -1) {
      if (container.hasDomElement()) {
        container.removeComponent(component);
        container.updateComponents();
      } else {
        container.getComponents().splice(componentIndex, 1);
      }
    }
  }

  private releaseComponentTree(
    component: Component<ComponentConfig>,
    releasedComponents: Component<ComponentConfig>[] = [],
  ): void {
    if (releasedComponents.indexOf(component) !== -1) {
      return;
    }

    releasedComponents.push(component);
    component.release();

    const settingComponent = this.getSettingsPanelItemSettingComponent(component);
    if (settingComponent != null) {
      this.releaseComponentTree(settingComponent, releasedComponents);
    }

    if (component instanceof Container) {
      const childComponents = component.getComponents().slice();
      for (const childComponent of childComponents) {
        this.releaseComponentTree(childComponent, releasedComponents);
      }
    }
  }

  private getSettingsPanelItemSettingComponent(component: Component<ComponentConfig>): Component<ComponentConfig> {
    if (component instanceof SettingsPanelItem) {
      return component.getConfig().settingComponent;
    }

    return null;
  }
}
