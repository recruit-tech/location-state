import { jsonSerializer } from "./serializer";
import { Listener, Serializer, Store } from "./types";

export const locationKeyPrefix = "__location_state_";

export class StorageStore implements Store {
  private state: Record<string, unknown> = {};
  private readonly listeners: Map<string, Set<Listener>> = new Map();
  private currentKey: string | null = null;

  constructor(
    private readonly storage: Storage = globalThis.sessionStorage,
    private readonly serializer: Serializer = jsonSerializer,
  ) {}

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
    const value = this.storage?.getItem(this.createStorageKey()) ?? null;
    try {
      this.state =
        value !== null ? this.serializer.stateDeserialize(value) : {};
    } catch (e) {
      console.error(e);
      this.state = {};
    }
    queueMicrotask(() => this.notifyAll());
  }

  save() {
    if (!this.currentKey) {
      return;
    }
    if (Object.keys(this.state).length === 0) {
      this.storage?.removeItem(this.createStorageKey());
      return;
    }
    let value: string;
    try {
      value = this.serializer.stateSerialize(this.state);
    } catch (e) {
      console.error(e);
      return;
    }
    this.storage?.setItem(this.createStorageKey(), value);
  }

  private createStorageKey() {
    return `${locationKeyPrefix}${this.currentKey}`;
  }
}
