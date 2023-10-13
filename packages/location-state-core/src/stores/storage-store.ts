import { EventEmitter } from "./event-emitter";
import { jsonSerializer } from "./serializer";
import { Listener, StateSerializer, Store } from "./types";

export const locationKeyPrefix = "__location_state_";

export class StorageStore implements Store {
  private state: Record<string, unknown> = {};
  private events = new EventEmitter();
  private currentKey: string | null = null;

  constructor(
    private readonly storage?: Storage, // Storage is undefined in SSR.
    private readonly stateSerializer: StateSerializer = jsonSerializer,
  ) {}

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
    this.currentKey = locationKey;
    const value = this.storage?.getItem(this.createStorageKey()) ?? null;
    try {
      this.state =
        value !== null ? this.stateSerializer.deserialize(value) : {};
    } catch (e) {
      console.error(e);
      this.state = {};
    }
    this.events.deferEmitAll();
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
      value = this.stateSerializer.serialize(this.state);
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
