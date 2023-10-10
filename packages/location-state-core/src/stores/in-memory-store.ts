import { Listener, Store } from "./types";

type State = Record<string, unknown>;

export class InMemoryStore implements Store {
  private state: Record<string, unknown> = {};
  private storage: Map<string, State> = new Map();
  private readonly listeners: Map<string, Set<Listener>> = new Map();
  private currentKey: string | null = null;

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

  private notifyAll() {
    this.listeners.forEach((listeners) =>
      listeners.forEach((listener) => listener()),
    );
  }

  get(name: string) {
    return this.state[name];
  }

  set(name: string, value: unknown) {
    if (typeof value === "undefined") {
      delete this.state[name];
    } else {
      this.state[name] = value;
    }
    this.notify(name);
  }

  load(locationKey: string) {
    if (this.currentKey === locationKey) return;
    this.currentKey = locationKey;
    this.state = this.storage.get(locationKey) ?? {};
    queueMicrotask(() => this.notifyAll());
  }

  save() {
    if (!this.currentKey) {
      return;
    }
    if (Object.keys(this.state).length === 0) {
      this.storage.delete(this.currentKey);
      return;
    }
    this.storage.set(this.currentKey, this.state);
  }
}
