import { Syncer } from "../types";
import { jsonSerializer } from "./serializer";
import { Listener, Store, StateSerializer } from "./types";

type URLEncoder = {
  decode: () => Record<string, unknown>;
  encode: (state?: Record<string, unknown>) => string;
};

export function searchParamEncoder(
  key: string,
  stateSerializer: StateSerializer,
): URLEncoder {
  return {
    decode: () => {
      const params = new URL(location.href);
      const value = params.searchParams.get(key);
      return value ? stateSerializer.deserialize(value) : {};
    },
    encode: (state) => {
      const url = new URL(location.href);
      if (state) {
        url.searchParams.set(key, stateSerializer.serialize(state));
      } else {
        url.searchParams.delete(key);
      }
      return url.toString();
    },
  };
}

export const defaultSearchParamEncoder = searchParamEncoder(
  "location-state",
  jsonSerializer,
);

export class URLStore implements Store {
  private state: Record<string, unknown> = {};
  private readonly listeners: Map<string, Set<Listener>> = new Map();

  constructor(
    private readonly syncer: Syncer,
    private readonly urlEncoder: URLEncoder = defaultSearchParamEncoder,
  ) {}

  subscribe(name: string, listener: Listener) {
    const listeners = this.listeners.get(name);
    if (listeners) {
      listeners.add(listener);
    } else {
      this.listeners.set(name, new Set([listener]));
    }
    return () => this.unsubscribe(name, listener);
  }

  private unsubscribe(name: string, listener: Listener) {
    const listeners = this.listeners.get(name);
    listeners?.delete(listener);
    if (listeners?.size === 0) {
      this.listeners.delete(name);
    }
  }

  private notify(name: string) {
    this.listeners.get(name)?.forEach((listener) => listener());
  }

  private notifyAll() {
    this.listeners.forEach((listeners) =>
      listeners.forEach((listener) => listener()),
    );
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

    try {
      // save to url
      const url = this.urlEncoder.encode(this.state);
      this.syncer.updateURL(url);
    } catch (e) {
      console.error(e);
    }

    this.notify(name);
  }

  load() {
    try {
      this.state = this.urlEncoder.decode();
    } catch (e) {
      console.error(e);
      this.state = {};
      // remove invalid state from url.
      const url = this.urlEncoder.encode();
      this.syncer.updateURL(url);
    }

    queueMicrotask(() => this.notifyAll());
  }

  save() {
    // `set` to save it in the URL, so it does nothing.
  }
}
