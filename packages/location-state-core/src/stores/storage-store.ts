import { EventEmitter } from "./event-emitter";
import { jsonSerializer } from "./serializer";
import type { Listener, StateSerializer, Store } from "./types";

export const locationKeyPrefix = "__location_state_";

type StorageStoreOptions = {
  storage?: Storage;
  stateSerializer?: StateSerializer;
};

type StorageStoreConstructorArgs =
  | []
  | [options?: StorageStoreOptions]
  | [storage?: Storage, stateSerializer?: StateSerializer];

export class StorageStore implements Store {
  private readonly storage?: Storage; // Storage is undefined in SSR.
  private readonly stateSerializer: StateSerializer;
  private state: Record<string, unknown> = {};
  private events = new EventEmitter();
  private currentKey: string | null = null;

  constructor(storage?: Storage, stateSerializer?: StateSerializer);
  constructor(options?: StorageStoreOptions);
  constructor(...args: StorageStoreConstructorArgs) {
    const options = normalizeArgs(args);

    this.storage =
      options.storage ??
      (typeof window === "undefined" ? undefined : globalThis.sessionStorage);
    this.stateSerializer = options.stateSerializer ?? jsonSerializer;
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

function toStorageKey(key: string) {
  return `${locationKeyPrefix}${key}`;
}

function normalizeArgs(args: StorageStoreConstructorArgs): StorageStoreOptions {
  // `new StorageStore()` is the recommended format.
  if (args.length === 0) {
    return {};
  }

  // `new StorageStore(undefined)` is the legacy format.
  // `new StorageStore(storage)` is the legacy format.
  // `new StorageStore(storage, stateSerializer)` is the legacy format.
  if (isLegacyStorageOptions(args[0])) {
    return {
      storage: args[0],
      stateSerializer: args[1],
    };
  }

  // `new StorageStore(options)` is the recommended format.
  return args[0];
}

function isLegacyStorageOptions(value: unknown): value is Storage | undefined {
  return (
    value === undefined ||
    (value !== null && typeof value === "object" && "getItem" in value)
  );
}
