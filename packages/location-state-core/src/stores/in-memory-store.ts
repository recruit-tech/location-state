import { Listener, Store } from "./types";

export class InMemoryStore implements Store {
  private state: Record<string, unknown> = {};
  private readonly listeners: Map<string, Set<Listener>> = new Map();
  private currentKey: string = "initial-key";

  subscribe(name: string, listener: Listener) {
    const listeners = this.listeners.get(name);
    if (listeners) {
      listeners.add(listener);
    } else {
      this.listeners.set(name, new Set([listener]));
    }
    return () => this.unsubscribe(name, listener);
  }

  private unsubscribe(name: string, listener: Listener) {
    const listeners = this.listeners.get(name);
    listeners?.delete(listener);
    if (listeners?.size === 0) {
      this.listeners.delete(name);
    }
  }

  private notify(name: string) {
    this.listeners.get(name)?.forEach((listener) => listener());
  }

  get(name: string) {
    return this.state[this.stateKey(name)];
  }

  set(name: string, value: unknown) {
    const key = this.stateKey(name);
    if (typeof value === "undefined") {
      delete this.state[key];
    } else {
      this.state[key] = value;
    }
    this.notify(name);
  }

  private stateKey(name: string) {
    return `${this.currentKey}:${name}`;
  }

  load(locationKey: string) {
    this.currentKey = locationKey;
    this.notifyAll();
  }

  save() {
    // Since it is in memory, nothing is done when saving.
  }

  private notifyAll() {
    this.listeners.forEach((listeners) =>
      listeners.forEach((listener) => listener()),
    );
  }
}
