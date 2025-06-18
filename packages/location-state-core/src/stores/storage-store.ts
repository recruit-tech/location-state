import { EventEmitter } from "./event-emitter";
import { jsonSerializer } from "./serializer";
import type { Listener, StateSerializer, Store } from "./types";

export const locationKeyPrefix = "__location_state_";
const storageKeysKey = "__location_state_keys__";

export type StorageStoreOptions = {
  storage?: Storage;
  stateSerializer?: StateSerializer;
  maxSize?: number;
};

export class StorageStore implements Store {
  private state: Record<string, unknown> = {};
  private events = new EventEmitter();
  private currentKey: string | null = null;
  private keys?: Set<string>;
  private readonly storage?: Storage;
  private readonly stateSerializer: StateSerializer;
  private readonly maxSize?: number;

  constructor(options: StorageStoreOptions = {}) {
    this.storage = options.storage; // Storage is undefined in SSR.
    this.stateSerializer = options.stateSerializer ?? jsonSerializer;
    this.maxSize = options.maxSize;
  }

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

    // Manage keys when max limit is specified
    if (this.maxSize !== undefined) {
      if (this.currentKey === null) {
        this.loadKeys();
      } else {
        this.updateKeyOrder(locationKey);
      }
    }

    try {
      const value = this.storage?.getItem(toStorageKey(locationKey)) ?? null;
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
    if (!this.currentKey) return;

    // Update key order when max limit is specified
    if (this.maxSize !== undefined && this.keys !== undefined) {
      this.updateKeyOrder(this.currentKey);
    }

    if (Object.keys(this.state).length === 0) {
      this.storage?.removeItem(toStorageKey(this.currentKey));
      return;
    }
    let value: string;
    try {
      value = this.stateSerializer.serialize(this.state);
    } catch (e) {
      console.error(e);
      return;
    }
    this.storage?.setItem(toStorageKey(this.currentKey), value);
  }

  private loadKeys() {
    try {
      const storageValue = this.storage?.getItem(storageKeysKey) ?? null;
      const keys = storageValue !== null ? JSON.parse(storageValue) : [];
      this.keys = new Set<string>(keys);
    } catch (e) {
      console.error(e);
      this.keys = new Set<string>();
    }
  }

  private updateKeyOrder(currentKey: string) {
    if (!this.keys || !this.maxSize) return;

    this.keys.delete(currentKey);
    this.keys.add(currentKey);

    // Remove old keys if exceeding the limit
    // Note: `this.keys` is a Set, and its iteration order is from oldest to newest key.
    for (const oldestKey of this.keys) {
      if (this.keys.size <= this.maxSize) {
        break;
      }
      this.keys.delete(oldestKey);
      this.storage?.removeItem(toStorageKey(oldestKey));
    }

    // Save key list to Storage
    try {
      this.storage?.setItem(storageKeysKey, JSON.stringify([...this.keys]));
    } catch (e) {
      console.error(e);
    }
  }
}

function toStorageKey(key: string) {
  return `${locationKeyPrefix}${key}`;
}
