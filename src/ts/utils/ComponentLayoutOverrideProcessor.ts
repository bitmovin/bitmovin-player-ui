import type { UIVariantIdentifier } from '../UIManager';
import type { UIConfig } from '../UIConfig';
import { UIComponentLayoutOverride } from '../UIComponentLayoutOverrides';
import type { UIComponentLayoutOverrideMap, UIComponentLayoutOverrides } from '../UIComponentLayoutOverrides';
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
    if (this.config.componentLayoutOverrides === undefined) {
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
    if (this.resolveOverrideFor(component, variantIdentifier) === UIComponentLayoutOverride.Exclude) {
      return true;
    }

    // Settings rows own their nested setting component, so excluding the nested component removes the whole row.
    if (component instanceof SettingsPanelItem) {
      const settingComponent = component.getConfig().settingComponent;
      return (
        settingComponent != null &&
        this.resolveOverrideFor(settingComponent, variantIdentifier) === UIComponentLayoutOverride.Exclude
      );
    }

    return false;
  }

  private resolveOverrideFor(
    component: Component<ComponentConfig>,
    variantIdentifier: UIVariantIdentifier,
  ): UIComponentLayoutOverride {
    return resolveComponentLayoutOverride(
      this.config.componentLayoutOverrides,
      getConstructorNames(component.constructor as { prototype: object }),
      variantIdentifier,
    );
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

    component.release();
  }
}

/**
 * The overrides in force for a UI config, in the precedence of {@link UIComponentLayoutOverrides}: the built-in
 * exclusions, then the config aliases, then the configured overrides.
 */
export function mergeComponentLayoutOverrides(uiconfig: UIConfig): UIComponentLayoutOverrides {
  return {
    CaptionToggleButton: UIComponentLayoutOverride.Exclude,
    EcoModeContainer: UIComponentLayoutOverride.Exclude,
    PlayerGraphsContextMenuItem: UIComponentLayoutOverride.Exclude,
    PlayerGraphsPanel: UIComponentLayoutOverride.Exclude,
    QuickSeekButton: UIComponentLayoutOverride.Exclude,
    Watermark: UIComponentLayoutOverride.Exclude,
    ...(uiconfig.playerGraphs != null && {
      PlayerGraphsContextMenuItem: uiconfig.playerGraphs
        ? UIComponentLayoutOverride.Include
        : UIComponentLayoutOverride.Exclude,
      PlayerGraphsPanel: uiconfig.playerGraphs ? UIComponentLayoutOverride.Include : UIComponentLayoutOverride.Exclude,
    }),
    ...(uiconfig.ecoMode != null && {
      EcoModeContainer: uiconfig.ecoMode ? UIComponentLayoutOverride.Include : UIComponentLayoutOverride.Exclude,
    }),
    ...(uiconfig.includeWatermark != null && {
      Watermark: uiconfig.includeWatermark ? UIComponentLayoutOverride.Include : UIComponentLayoutOverride.Exclude,
    }),
    ...(uiconfig.playbackSpeedSelectionEnabled != null && {
      PlaybackSpeedSelectBox: uiconfig.playbackSpeedSelectionEnabled
        ? UIComponentLayoutOverride.Include
        : UIComponentLayoutOverride.Exclude,
    }),
    ...uiconfig.componentLayoutOverrides,
  };
}

/**
 * The override in force for a component in a variant. The top-level overrides apply first, then the overrides of
 * the variant. Within each, the key of a base class applies first, then the keys of its subclasses.
 */
export function resolveComponentLayoutOverride(
  componentLayoutOverrides: UIComponentLayoutOverrides,
  componentTypeNames: string[],
  variantIdentifier: UIVariantIdentifier,
): UIComponentLayoutOverride {
  let override = UIComponentLayoutOverride.Include;
  const resolveMap = (componentLayoutOverrideMap: UIComponentLayoutOverrideMap): void => {
    const overridesByName = componentLayoutOverrideMap as { [componentTypeName: string]: UIComponentLayoutOverride };
    for (const componentTypeName of componentTypeNames) {
      override = overridesByName[componentTypeName] ?? override;
    }
  };

  resolveMap(componentLayoutOverrides);
  if (componentLayoutOverrides[variantIdentifier] != null) {
    resolveMap(componentLayoutOverrides[variantIdentifier]);
  }

  return override;
}
