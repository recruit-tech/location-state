import { EventEmitter } from "./event-emitter";
import { jsonSerializer } from "./serializer";
import type { Listener, StateSerializer, Store } from "./types";

export const locationKeyPrefix = "__location_state_";
const storageKeysKey = "__location_state_keys__";

export type StorageStoreOptions = {
  stateSerializer?: StateSerializer;
  maxSize?: number;
};

export class StorageStore implements Store {
  private readonly stateSerializer: StateSerializer;
  private readonly maxSize?: number;
  private state: Record<string, unknown> = {};
  private events = new EventEmitter();
  private currentKey: string | null = null;
  private keys?: Set<string>;

  constructor(storage?: Storage, stateSerializer?: StateSerializer);
  constructor(storage?: Storage, options?: StorageStoreOptions);
  constructor(
    private readonly storage?: Storage, // Storage is undefined in SSR.
    optionsOrSerializer?: StateSerializer | StorageStoreOptions,
  ) {
    // Determine if second argument is options object or state serializer
    const isOptions =
      optionsOrSerializer &&
      typeof optionsOrSerializer === "object" &&
      ("stateSerializer" in optionsOrSerializer ||
        "maxSize" in optionsOrSerializer);

    if (isOptions) {
      // New format: new StorageStore(storage, options)
      const options = optionsOrSerializer as StorageStoreOptions;
      this.stateSerializer = options.stateSerializer ?? jsonSerializer;
      this.maxSize = options.maxSize;
    } else {
      // Legacy format: new StorageStore(storage, stateSerializer)
      this.stateSerializer =
        (optionsOrSerializer as StateSerializer) ?? jsonSerializer;
    }
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
    // Note: `this.keys` is a Set, and its iteration order is from oldest to newest key. LRU cache algorithm is used.
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
