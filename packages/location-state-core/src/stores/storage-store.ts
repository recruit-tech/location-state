import { EventEmitter } from "./event-emitter";
import { jsonSerializer } from "./serializer";
import type { Listener, StateSerializer, Store } from "./types";

export const LOCATION_KEY_PREFIX = "__location_state_";
const STORAGE_KEYS_KEY = "__location_state:keys";

type StorageStoreOptions = {
  storage?: Storage;
  stateSerializer?: StateSerializer;
  maxKeys?: number;
};

type StorageStoreConstructorArgs =
  | []
  | [options: StorageStoreOptions]
  | [storage: Storage | undefined, stateSerializer?: StateSerializer];

export class StorageStore implements Store {
  private readonly storage?: Storage; // Storage is undefined in SSR.
  private readonly stateSerializer: StateSerializer;
  private readonly maxKeys?: number;
  private state: Record<string, unknown> = {};
  private events = new EventEmitter();
  private currentKey: string | null = null;
  private keys?: Set<string>;

  constructor(); // Recommended format
  constructor(options: StorageStoreOptions); // Recommended format
  constructor(storage: Storage | undefined, stateSerializer?: StateSerializer); // Legacy format
  constructor(...args: StorageStoreConstructorArgs) {
    const options = normalizeArgs(args);

    this.storage =
      options.storage ??
      (typeof window === "undefined" ? undefined : globalThis.sessionStorage);
    this.stateSerializer = options.stateSerializer ?? jsonSerializer;
    this.maxKeys = options?.maxKeys;
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
    if (this.maxKeys !== undefined) {
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
    if (this.maxKeys !== undefined && this.keys !== undefined) {
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
      const storageValue = this.storage?.getItem(STORAGE_KEYS_KEY) ?? null;
      const keys = storageValue !== null ? JSON.parse(storageValue) : [];
      this.keys = new Set<string>(keys);
    } catch (e) {
      console.error(e);
      this.keys = new Set<string>();
    }
  }

  private updateKeyOrder(currentKey: string) {
    if (!this.keys || !this.maxKeys) return;

    this.keys.delete(currentKey);
    this.keys.add(currentKey);

    // Remove old keys if exceeding the limit
    // Note: `this.keys` is a Set, and its iteration order is from oldest to newest key. LRU cache algorithm is used.
    for (const oldestKey of this.keys) {
      if (this.keys.size <= this.maxKeys) {
        break;
      }
      this.keys.delete(oldestKey);
      this.storage?.removeItem(toStorageKey(oldestKey));
    }

    // Save key list to Storage
    try {
      this.storage?.setItem(STORAGE_KEYS_KEY, JSON.stringify([...this.keys]));
    } catch (e) {
      console.error(e);
    }
  }
}

function toStorageKey(key: string) {
  return `${LOCATION_KEY_PREFIX}${key}`;
}

function normalizeArgs(args: StorageStoreConstructorArgs): StorageStoreOptions {
  // Recommended format: `new StorageStore()`
  if (args.length === 0) {
    return {};
  }

  // Recommended format: `new StorageStore(options)`
  if (!isLegacyStorageOptions(args[0])) {
    return args[0];
  }

  // Legacy format: `new StorageStore(undefined)`
  // Legacy format: `new StorageStore(storage)`
  // Legacy format: `new StorageStore(storage, stateSerializer)`
  // Legacy format: `new StorageStore(undefined, stateSerializer)`
  return {
    storage: args[0],
    stateSerializer: args[1],
  };
}

function isLegacyStorageOptions(value: unknown): value is Storage | undefined {
  return (
    value === undefined ||
    (value !== null && typeof value === "object" && "getItem" in value)
  );
}
