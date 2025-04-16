import { EventEmitter } from "./event-emitter";
import { jsonSerializer } from "./serializer";
import type { Listener, StateSerializer, Store } from "./types";

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
    try {
      const value = this.storage?.getItem(storageKey(locationKey)) ?? null;
      const state =
        value !== null ? this.stateSerializer.deserialize(value) : {};
      // Initial key is `null`, so we need to merge the state with the existing state.
      // Because it may be set before load.
      if (this.currentKey === null) {
        this.state = {
          ...state,
          ...this.state,
        };
      } else {
        this.state = state;
      }
    } catch (e) {
      console.error(e);
      this.state = {};
    }
    this.currentKey = locationKey;
    this.events.deferEmitAll();
  }

  save() {
    if (!this.currentKey) {
      return;
    }
    if (Object.keys(this.state).length === 0) {
      this.storage?.removeItem(storageKey(this.currentKey));
      return;
    }
    let value: string;
    try {
      value = this.stateSerializer.serialize(this.state);
    } catch (e) {
      console.error(e);
      return;
    }
    this.storage?.setItem(storageKey(this.currentKey), value);
  }
}

function storageKey(key: string) {
  return `${locationKeyPrefix}${key}`;
}
