type Listeners = ([Node, EventListenerOrEventListenerObject, boolean | AddEventListenerOptions])[];

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

  public on(
    node: Node,
    type: keyof HTMLElementEventMap,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void {
    node.addEventListener(type, listener, options);
    this.getEventListenersOfType(type).push([node, listener, options]);
  }

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

  public release(): void {
    this.attachedListeners.forEach((listenersOfType, type) => {
      listenersOfType.forEach(([element, listener, options]) => {
        this.off(element, type, listener, options);
      });
    });
    this.attachedListeners.clear();
  }
}
