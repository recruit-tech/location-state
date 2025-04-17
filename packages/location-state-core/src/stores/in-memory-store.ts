import { EventEmitter } from "./event-emitter";
import type { Listener, Store } from "./types";

type State = Record<string, unknown>;

export class InMemoryStore implements Store {
  private state: Record<string, unknown> = {};
  private events = new EventEmitter();
  private currentKey: string | null = null;

  constructor(private readonly storage: Map<string, State> = new Map()) {}

  subscribe(name: string, listener: Listener) {
    this.events.on(name, listener);
    return () => this.events.off(name, listener);
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
    this.events.emit(name);
  }

  load(locationKey: string) {
    if (this.currentKey === locationKey) return;
    const storageState = this.storage.get(locationKey) ?? {};
    // Initial key is `null`, so we need to merge the state with the existing state.
    // Because it may be set before load.
    if (this.currentKey === null) {
      this.state = {
        ...storageState,
        ...this.state,
      };
    } else {
      this.state = storageState;
    }
    this.currentKey = locationKey;
    this.events.deferEmitAll();
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
