export type Listener<T> = (event: T) => void;
type EventBusGenericMap = { [key in string]: any; };

export class SpatialNavigationEventBus<T extends EventBusGenericMap> {
  private listeners: { [key in keyof T]?: Listener<T[key]>[]; } = {};

  public getListenersForType<K extends keyof T>(type: K) {
    return this.listeners[type] || [];
  }

  public addEventListener<K extends keyof T>(type: K, handler: Listener<T[K]>) {
    console.error('ADD LISTENER', type)
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    if (!this.listeners[type].includes(handler)) {
      this.listeners[type].push(handler);
    }
  }

  public removeEventListener<K extends keyof T>(type: K, handler: Listener<T[K]>) {
    this.listeners[type] = this.getListenersForType(type).filter(tracked => tracked !== handler);
  }

  public dispatch<K extends keyof T>(type: K, event: T[K]) {
    console.error('DISPATCH', type, event);
    console.error(this.getListenersForType(type));
    this.getListenersForType(type).forEach(listener => {
      listener(event);
    })
  }
}
