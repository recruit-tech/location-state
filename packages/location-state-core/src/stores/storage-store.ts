import { EventEmitter } from "./event-emitter";
import { jsonSerializer } from "./serializer";
import type { Listener, StateSerializer, Store } from "./types";

export const locationKeyPrefix = "__location_state_";

type StorageStoreOptions = {
  storage?: Storage;
  stateSerializer?: StateSerializer;
};

export class StorageStore implements Store {
  private readonly storage?: Storage; // Storage is undefined in SSR.
  private readonly stateSerializer: StateSerializer;
  private state: Record<string, unknown> = {};
  private events = new EventEmitter();
  private currentKey: string | null = null;

  constructor(storage?: Storage, stateSerializer?: StateSerializer);
  constructor(options?: StorageStoreOptions);
  constructor(
    storageOrOptions?: Storage | StorageStoreOptions,
    stateSerializer?: StateSerializer,
  ) {
    // Normalize arguments to a common options object with defaults
    const normalizedOptions: {
      storage?: Storage;
      stateSerializer: StateSerializer;
    } = isStorageStoreOptions(storageOrOptions)
      ? {
          // Only in the recommended format, set the initial value for Storage (`sessionStorage` or `undefined`)
          storage:
            storageOrOptions?.storage ??
            (typeof window === "undefined"
              ? undefined
              : globalThis.sessionStorage),
          stateSerializer: storageOrOptions?.stateSerializer ?? jsonSerializer,
        }
      : {
          storage: storageOrOptions,
          stateSerializer: stateSerializer ?? jsonSerializer,
        };

    this.storage = normalizedOptions.storage;
    this.stateSerializer = normalizedOptions.stateSerializer;
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

function isStorageStoreOptions(
  value: Storage | StorageStoreOptions | undefined,
): value is StorageStoreOptions | undefined {
  // undefined: recommended format
  return !value || (value !== undefined && !("getItem" in value));
}

function toStorageKey(key: string) {
  return `${locationKeyPrefix}${key}`;
}
