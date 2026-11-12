import { ComponentConfig, Component, ViewModeChangedEventArgs, ViewMode } from './Component';
import { DOM } from '../DOM';
import { ArrayUtils } from '../utils/ArrayUtils';
import { i18n } from '../localization/i18n';
import type { UIInstanceManager } from '../UIManager';
import { hasVisibleFocus } from '../utils/FocusVisibilityTracker';

/**
 * Configuration interface for a {@link Container}.
 *
 * @category Configs
 */
export interface ContainerConfig extends ComponentConfig {
  /**
   * Child components of the container.
   */
  components?: Component<ComponentConfig>[];
}

/**
 * A container component that can contain a collection of child components.
 * Components can be added at construction time through the {@link ContainerConfig#components} setting, or later
 * through the {@link Container#addComponent} method. The UIManager automatically takes care of all components, i.e. it
 * initializes and configures them automatically.
 *
 * In the DOM, the container consists of an outer <div> (that can be configured by the config) and an inner wrapper
 * <div> that contains the components. This double-<div>-structure is often required to achieve many advanced effects
 * in CSS and/or JS, e.g. animations and certain formatting with absolute positioning.
 *
 * DOM example:
 * <code>
 *     <div class='ui-container'>
 *         <div class='container-wrapper'>
 *             ... child components ...
 *         </div>
 *     </div>
 * </code>
 *
 * @category Components
 */
export class Container<Config extends ContainerConfig> extends Component<Config> {
  /**
   * A reference to the inner element that contains the components of the container.
   */
  protected innerContainerElement: DOM;
  private componentsToAppend: Component<ComponentConfig>[];
  private componentsToPrepend: Component<ComponentConfig>[];
  private componentsToRemove: Component<ComponentConfig>[];
  private componentsInPersistentViewMode: number;
  private releaseKeyboardFocusTracking?: () => void;
  private keyboardFocusedWithin = false;

  constructor(config: Config) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-container',
        components: [],
      } as Config,
      this.config,
    );

    this.componentsToAppend = [];
    this.componentsToPrepend = [];
    this.componentsToRemove = [];
    this.componentsInPersistentViewMode = 0;
  }

  /**
   * Adds a child component to the container.
   * @param component the component to add
   */
  addComponent(component: Component<ComponentConfig>) {
    this.config.components.push(component);
    this.componentsToAppend.push(component);
  }

  /**
   * Adds a child component as the first component in the container.
   * @param component the component to add
   */
  prependComponent(component: Component<ComponentConfig>) {
    this.config.components.unshift(component);
    this.componentsToPrepend.push(component);
  }

  /**
   * Removes a child component from the container.
   * @param component the component to remove
   * @returns {boolean} true if the component has been removed, false if it is not contained in this container
   */
  removeComponent(component: Component<ComponentConfig>): boolean {
    if (ArrayUtils.remove(this.config.components, component) != null) {
      this.componentsToRemove.push(component);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Gets an array of all child components in this container.
   * @returns {Component<ComponentConfig>[]}
   */
  getComponents(): Component<ComponentConfig>[] {
    return this.config.components;
  }

  /**
   * Removes all child components from the container.
   */
  removeComponents(): void {
    for (const component of this.getComponents().slice()) {
      this.removeComponent(component);
    }
  }

  /**
   * Updates the DOM of the container with the current components.
   *
   * This is called automatically after construction. However, when you dynamically
   * add or remove components at runtime, you must call `updateComponents()` to
   * re-render the container’s children.
   */
  updateComponents(): void {
    /* We cannot just clear the container to remove all elements and then re-add those that should stay, because
     * IE looses the innerHTML of unattached elements, leading to empty elements within the container (e.g. missing
     * subtitle text in SubtitleLabel).
     * Instead, we keep a list of elements to add and remove, leaving remaining elements alone. By keeping them in
     * the DOM, their content gets preserved in all browsers.
     */
    let component: Component<ComponentConfig>;

    while ((component = this.componentsToRemove.shift()) !== undefined) {
      component.getDomElement().remove();
    }

    while ((component = this.componentsToAppend.shift()) !== undefined) {
      this.innerContainerElement.append(component.getDomElement());
    }

    while ((component = this.componentsToPrepend.shift()) !== undefined) {
      this.innerContainerElement.prepend(component.getDomElement());
    }
  }

  protected toDomElement(): DOM {
    // Create the container element (the outer <div>)
    const containerElement = new DOM(
      this.config.tag,
      {
        id: this.config.id,
        class: this.getCssClasses(),
        role: this.config.role,
        'aria-label': i18n.performLocalization(this.config.ariaLabel),
      },
      this,
    );

    if (typeof this.config.tabIndex === 'number') {
      containerElement.attr('tabindex', this.config.tabIndex.toString());
    }

    // Create the inner container element (the inner <div>) that will contain the components
    const innerContainer = new DOM(this.config.tag, {
      class: this.prefixCss('container-wrapper'),
    });
    this.innerContainerElement = innerContainer;

    for (const initialComponent of this.config.components) {
      this.componentsToAppend.push(initialComponent);
    }
    this.updateComponents();

    containerElement.append(innerContainer);

    return containerElement;
  }

  release(): void {
    this.releaseKeyboardFocusTracking?.();
    super.release();
  }

  /**
   * Whether keyboard focus is inside this container and keeps it in {@link ViewMode.Persistent}. Only containers that
   * stay shown while they are keyboard focused track this, e.g. the {@link ControlBar}, {@link TitleBar} and
   * {@link SettingsPanel}. Always false for all other containers.
   */
  hasKeyboardFocusWithin(): boolean {
    return this.keyboardFocusedWithin;
  }

  /**
   * Keeps this container in {@link ViewMode.Persistent} while keyboard focus is inside it, so the UI does not
   * auto-hide the focused control together with its focus indicator (WCAG 2.4.7 Focus Visible, 2.4.11 Focus Not
   * Obscured). Focus set by a pointer does not count, so clicking a control does not keep the UI shown.
   *
   * Has no effect with spatial navigation (e.g. on TVs): focus never leaves the UI there, so the UI would never
   * auto-hide.
   *
   * Must be called from {@link configure}.
   */
  protected keepShownWhileKeyboardFocused(uimanager: UIInstanceManager): void {
    if (uimanager.hasSpatialNavigation()) {
      return;
    }

    const element = this.getDomElement();
    const hiddenClass = this.prefixCss('hidden');
    const setKeyboardFocused = (focused: boolean) => {
      this.keyboardFocusedWithin = focused;
      this.onViewModeChangedEvent(focused ? ViewMode.Persistent : ViewMode.Temporary);
    };
    // Reads the focus state from the DOM, for changes that do not dispatch a focusout through this container
    const recheckKeyboardFocus = () => setKeyboardFocused(isVisiblyFocusedWithin(element.get(0), hiddenClass));

    const onFocusIn = (e: FocusEvent) => setKeyboardFocused(hasVisibleFocus(e.target));
    const onFocusOut = (e: FocusEvent) => {
      // When focus moves to another element inside, the focusin that follows decides
      const nextFocused = e.relatedTarget as Node | null;
      if (!nextFocused || !element.get(0).contains(nextFocused)) {
        setKeyboardFocused(false);
      }
    };
    // Focus can stay on a control without a focusout when it is hidden, e.g. when the UI switches variants
    const onHiddenWithFocus = () => setKeyboardFocused(false);

    // Switching to the keyboard on a control focused by a pointer makes its focus visible without a focus event. The
    // FocusVisibilityTracker marks it in the capture phase, before the keydown reaches this container.
    const onKeyDown = () => {
      if (!this.keyboardFocusedWithin) {
        recheckKeyboardFocus();
      }
    };

    element.on('focusin', onFocusIn);
    element.on('focusout', onFocusOut);
    element.on('keydown', onKeyDown);
    this.onHide.subscribe(onHiddenWithFocus);
    uimanager.onInactive.subscribe(onHiddenWithFocus);

    // Browsers do not reliably dispatch focusout when the focused control is removed or hidden
    const descendantObserver =
      typeof MutationObserver !== 'undefined'
        ? new MutationObserver(() => {
            if (this.keyboardFocusedWithin) {
              recheckKeyboardFocus();
            }
          })
        : undefined;
    descendantObserver?.observe(element.get(0), {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });

    this.releaseKeyboardFocusTracking = () => {
      // Let the UI auto-hide again if this container is released while focused
      setKeyboardFocused(false);
      descendantObserver?.disconnect();
      element.off('focusin', onFocusIn);
      element.off('focusout', onFocusOut);
      element.off('keydown', onKeyDown);
      uimanager.onInactive.unsubscribe(onHiddenWithFocus);
    };
  }

  protected suspendHideTimeout(): void {
    // to be implemented in subclass
  }

  protected resumeHideTimeout(): void {
    // to be implemented in subclass
  }

  protected trackComponentViewMode(mode: ViewMode) {
    if (mode === ViewMode.Persistent) {
      this.componentsInPersistentViewMode++;
    } else if (mode === ViewMode.Temporary) {
      this.componentsInPersistentViewMode = Math.max(this.componentsInPersistentViewMode - 1, 0);
    }

    if (this.componentsInPersistentViewMode > 0) {
      // There is at least one component that must not be hidden,
      // therefore the hide timeout must be suspended
      this.suspendHideTimeout();
    } else {
      this.resumeHideTimeout();
    }
  }
}

/**
 * Whether the element that has keyboard focus (with a visible focus indicator) is inside `container` and not hidden.
 * Reads the active element of the container's own root, so it also works inside a Shadow DOM.
 */
function isVisiblyFocusedWithin(container: HTMLElement, hiddenClass: string): boolean {
  const root = (container.getRootNode ? container.getRootNode() : document) as Document | ShadowRoot;
  const focused = root.activeElement;

  if (!focused || !container.contains(focused) || !hasVisibleFocus(focused)) {
    return false;
  }

  // The focused control or one of its ancestors may be hidden before the browser moves focus away from it
  for (let node: Element | null = focused; node; node = node.parentElement) {
    if (node.classList.contains(hiddenClass)) {
      return false;
    }
  }
  return true;
}
