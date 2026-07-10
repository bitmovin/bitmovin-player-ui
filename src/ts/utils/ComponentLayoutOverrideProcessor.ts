import type { UIVariantIdentifier } from '../UIManager';
import type { UIConfig } from '../UIConfig';
import { UIComponentLayoutOverride } from '../UIComponentLayoutOverrides';
import type { UIComponentLayoutOverrideMap } from '../UIComponentLayoutOverrides';
import { Component, ComponentConfig } from '../components/Component';
import { Container, ContainerConfig } from '../components/Container';
import { SettingsPanelItem } from '../components/settings/SettingsPanelItem';
import { getConstructorNames } from './ConstructorUtils';

export class ComponentLayoutOverrideProcessor {
  private config: UIConfig;

  constructor(config: UIConfig) {
    this.config = config;
  }

  process(uiContainer: Container<ContainerConfig>, variantIdentifier: UIVariantIdentifier): void {
    if (this.config.componentLayoutOverrides == null) {
      return;
    }

    this.removeExcludedComponents(uiContainer, variantIdentifier);
  }

  private removeExcludedComponents(
    container: Container<ContainerConfig>,
    variantIdentifier: UIVariantIdentifier,
  ): void {
    const components = container.getComponents().slice();
    components.forEach(component => {
      if (this.shouldExclude(component, variantIdentifier)) {
        container.removeComponent(component);
        this.releaseComponentTree(component);
      } else if (component instanceof Container) {
        this.removeExcludedComponents(component, variantIdentifier);
      }
    });
  }

  private shouldExclude(component: Component<ComponentConfig>, variantIdentifier: UIVariantIdentifier): boolean {
    if (this.resolveComponentLayoutOverride(component, variantIdentifier) === UIComponentLayoutOverride.Exclude) {
      return true;
    }

    // Settings rows own their nested setting component, so excluding the nested component removes the whole row.
    if (component instanceof SettingsPanelItem) {
      const settingComponent = component.getConfig().settingComponent;
      return (
        settingComponent != null &&
        this.resolveComponentLayoutOverride(settingComponent, variantIdentifier) === UIComponentLayoutOverride.Exclude
      );
    }

    return false;
  }

  private resolveComponentLayoutOverride(
    component: Component<ComponentConfig>,
    variantIdentifier: UIVariantIdentifier,
  ): UIComponentLayoutOverride {
    const componentLayoutOverrides = this.config.componentLayoutOverrides;
    const componentTypeNames = getConstructorNames(component.constructor as { prototype: object });
    let override = UIComponentLayoutOverride.Include;

    const resolveConfig = (componentLayoutOverrides: UIComponentLayoutOverrideMap): void => {
      const componentLayoutOverrideMap = componentLayoutOverrides as {
        [componentTypeName: string]: UIComponentLayoutOverride;
      };
      for (const componentTypeName of componentTypeNames) {
        override = componentLayoutOverrideMap[componentTypeName] ?? override;
      }
    };

    resolveConfig(componentLayoutOverrides);
    if (componentLayoutOverrides[variantIdentifier] != null) {
      resolveConfig(componentLayoutOverrides[variantIdentifier]);
    }

    return override;
  }

  private releaseComponentTree(
    component: Component<ComponentConfig>,
    releasedComponents: Component<ComponentConfig>[] = [],
  ): void {
    // Guard against shared or circular component references causing duplicate release calls.
    if (releasedComponents.indexOf(component) !== -1) {
      return;
    }

    releasedComponents.push(component);
    component.release();

    if (component instanceof SettingsPanelItem) {
      const settingComponent = component.getConfig().settingComponent;
      if (settingComponent != null) {
        this.releaseComponentTree(settingComponent, releasedComponents);
      }
    }

    if (component instanceof Container) {
      const childComponents = component.getComponents().slice();
      for (const childComponent of childComponents) {
        this.releaseComponentTree(childComponent, releasedComponents);
      }
    }
  }
}
