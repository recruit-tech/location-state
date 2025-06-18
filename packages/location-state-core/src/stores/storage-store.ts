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
    this.storage = options.storage;
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
        // Initial load: read key list from Storage
        try {
          const keysValue = this.storage?.getItem(storageKeysKey) ?? null;
          const keysArray = keysValue !== null ? JSON.parse(keysValue) : [];
          this.keys = new Set<string>(keysArray);
        } catch (e) {
          console.error(e);
          this.keys = new Set<string>();
        }
      } else {
        // For existing keys: update order (delete then add)
        if (this.keys) {
          this.keys.delete(locationKey);
          this.keys.add(locationKey);

          // Remove old keys if exceeding the limit
          while (this.keys.size > this.maxSize) {
            const oldestKey = this.keys.values().next().value;
            if (oldestKey) {
              this.keys.delete(oldestKey);
              this.storage?.removeItem(toStorageKey(oldestKey));
            }
          }

          // Save key list to Storage
          try {
            const keysArray = [...this.keys];
            this.storage?.setItem(storageKeysKey, JSON.stringify(keysArray));
          } catch (e) {
            console.error(e);
          }
        }
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
    if (!this.currentKey) {
      return;
    }

    // Add new key when max limit is specified
    if (this.maxSize !== undefined && this.keys) {
      this.keys.delete(this.currentKey);
      this.keys.add(this.currentKey);

      // Remove old keys if exceeding the limit
      while (this.keys.size > this.maxSize) {
        const oldestKey = this.keys.values().next().value;
        if (oldestKey) {
          this.keys.delete(oldestKey);
          this.storage?.removeItem(toStorageKey(oldestKey));
        }
      }

      // Save key list to Storage
      try {
        const keysArray = [...this.keys];
        this.storage?.setItem(storageKeysKey, JSON.stringify(keysArray));
      } catch (e) {
        console.error(e);
      }
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
}

function toStorageKey(key: string) {
  return `${locationKeyPrefix}${key}`;
}
