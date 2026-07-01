import type { UIComponentConfigOverrides } from '../UIComponentConfigOverrides';
import type { ComponentConfig } from '../components/Component';

/**
 * Provides {@link UIComponentConfigOverrides} overrides while a UI variant is being constructed.
 *
 * Component applies these overrides to the constructor config object before subclass constructors continue. Passing
 * this state through every component constructor would change the UIFactory and component APIs, so UIManager opens this
 * short-lived context around lazy UI construction instead.
 *
 * The context is intentionally synchronous: it is set before the variant factory runs and cleared immediately after.
 * Outside that construction window, components receive no UIConfig component override.
 */
export class ComponentConfigManager {
  private static componentConfig: UIComponentConfigOverrides;
  private static variantIdentifier: string;

  /**
   * Runs a UI variant factory with component overrides enabled for the given variant.
   */
  static run<T>(config: UIComponentConfigOverrides, variant: string, build: () => T): T {
    ComponentConfigManager.componentConfig = config;
    ComponentConfigManager.variantIdentifier = variant;

    try {
      return build();
    } finally {
      ComponentConfigManager.componentConfig = undefined;
      ComponentConfigManager.variantIdentifier = undefined;
    }
  }

  /**
   * Returns the override config for a component constructor.
   *
   * Base class config is applied first, then specific component config. Variant-scoped config is applied after
   * top-level config, so variant entries win.
   */
  static getConfigFor(componentConstructor: { prototype: object }): Partial<ComponentConfig> {
    if (!ComponentConfigManager.componentConfig) {
      return {};
    }

    const config = {};
    ComponentConfigManager.applyConfig(
      config,
      ComponentConfigManager.componentConfig as { [componentName: string]: Partial<ComponentConfig> },
      componentConstructor,
    );
    ComponentConfigManager.applyConfig(
      config,
      (
        ComponentConfigManager.componentConfig as {
          [variantIdentifier: string]: { [componentName: string]: Partial<ComponentConfig> };
        }
      )[ComponentConfigManager.variantIdentifier],
      componentConstructor,
    );
    return config;
  }

  private static applyConfig(
    config: Partial<ComponentConfig>,
    componentConfigMap: { [componentName: string]: Partial<ComponentConfig> },
    componentConstructor: { prototype: object },
  ): void {
    if (!componentConfigMap) {
      return;
    }

    const constructorNames = [];
    let prototype = componentConstructor.prototype;
    while (prototype && prototype.constructor && prototype.constructor.name) {
      constructorNames.unshift(prototype.constructor.name);
      prototype = Object.getPrototypeOf(prototype);
    }

    // Apply base classes first so a more specific component config can override inherited defaults.
    for (const constructorName of constructorNames) {
      Object.assign(config, componentConfigMap[constructorName]);
    }
  }
}
