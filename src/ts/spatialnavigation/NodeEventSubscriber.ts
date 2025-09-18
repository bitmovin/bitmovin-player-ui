type Listeners = ([Node, EventListenerOrEventListenerObject, boolean | AddEventListenerOptions])[];

/**
 * Allows to subscribe to Node events.
 */
export class NodeEventSubscriber {
  private readonly attachedListeners: Map<keyof HTMLElementEventMap, Listeners>;

  constructor() {
    this.attachedListeners = new Map();
  }

  private getEventListenersOfType(type: keyof HTMLElementEventMap): Listeners {
    if (!this.attachedListeners.has(type)) {
      this.attachedListeners.set(type, []);
    }

    return this.attachedListeners.get(type);
  }

  /**
   * Adds the given event listener to the node.
   *
   * @param node The node to remove the event listener from
   * @param type The event to listen to
   * @param listener The listener to remove
   * @param options The event listener options
   */
  public on(
    node: Node,
    type: keyof HTMLElementEventMap,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void {
    node.addEventListener(type, listener, options);
    this.getEventListenersOfType(type).push([node, listener, options]);
  }

  /**
   * Removes the given event listener from the node.
   *
   * @param node The node to attach the event listener to
   * @param type The event to listen to
   * @param listener The listener to add
   * @param options The event listener options
   */
  public off(
    node: Node,
    type: keyof HTMLElementEventMap,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void {
    const listenersOfType = this.getEventListenersOfType(type);
    const listenerIndex = listenersOfType.findIndex(([otherNode, otherListener, otherOptions]) => {
      return otherNode === node && otherListener === listener && otherOptions === options;
    });

    node.removeEventListener(type, listener, options);

    if (listenerIndex > -1) {
      listenersOfType.splice(listenerIndex, 1);
    }
  }

  /**
   * Removes all attached event listeners.
   */
  public release(): void {
    this.attachedListeners.forEach((listenersOfType, type) => {
      listenersOfType.forEach(([element, listener, options]) => {
        this.off(element, type, listener, options);
      });
    });
    this.attachedListeners.clear();
  }
}
