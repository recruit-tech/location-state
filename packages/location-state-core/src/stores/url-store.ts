import { Syncer } from "../types";
import { jsonSerializer } from "./serializer";
import { Listener, Store, StateSerializer } from "./types";

type URLEncoder = {
  encode: (url: string, state?: Record<string, unknown>) => string;
  decode: (url: string) => Record<string, unknown>;
};

export function searchParamEncoder(
  paramName: string,
  stateSerializer: StateSerializer,
): URLEncoder {
  return {
    encode: (url, state) => {
      const newUrl = new URL(url);
      if (state) {
        newUrl.searchParams.set(paramName, stateSerializer.serialize(state));
      } else {
        newUrl.searchParams.delete(paramName);
      }
      return newUrl.toString();
    },
    decode: (url: string) => {
      const { searchParams } = new URL(url);
      const value = searchParams.get(paramName);
      return value ? stateSerializer.deserialize(value) : {};
    },
  };
}

export const defaultSearchParamEncoder = searchParamEncoder(
  "location-state",
  jsonSerializer,
);

export class URLStore implements Store {
  private state: Record<string, unknown> = {};
  private syncedURL: string | undefined;
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
      this.syncedURL = this.urlEncoder.encode(location.href, this.state);
      this.syncer.updateURL(this.syncedURL);
    } catch (e) {
      console.error(e);
    }

    this.notify(name);
  }

  load() {
    const currentURL = location.href;
    if (currentURL === this.syncedURL) return;

    try {
      this.state = this.urlEncoder.decode(currentURL);
      this.syncedURL = currentURL;
    } catch (e) {
      console.error(e);
      this.state = {};
      // remove invalid state from url.
      const url = this.urlEncoder.encode(currentURL);
      this.syncer.updateURL(url);
      this.syncedURL = url;
    }

    queueMicrotask(() => this.notifyAll());
  }

  save() {
    // `set` to save it in the URL, so it does nothing.
  }
}
