import { EventEmitter } from "./event-emitter";
import { Listener, Store } from "./types";

type State = Record<string, unknown>;

export class InMemoryStore implements Store {
  private state: Record<string, unknown> = {};
  private eventEmitter = new EventEmitter();
  private currentKey: string | null = null;

  constructor(private readonly storage: Map<string, State> = new Map()) {}

  subscribe(name: string, listener: Listener) {
    this.eventEmitter.on(name, listener);
    return () => this.eventEmitter.off(name, listener);
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
    this.eventEmitter.emit(name);
  }

  load(locationKey: string) {
    if (this.currentKey === locationKey) return;
    this.currentKey = locationKey;
    this.state = this.storage.get(locationKey) ?? {};
    queueMicrotask(() => this.eventEmitter.emitAll());
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
