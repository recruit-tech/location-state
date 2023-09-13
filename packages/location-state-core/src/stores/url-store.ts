import { Syncer } from "../types";
import { jsonSerializer } from "./serializer";
import { Listener, Store, StateSerializer } from "./types";

type URLHandlers = {
  get: (props: { href: string; key: string }) => string | null;
  update: (props: { href: string; key: string; stateJSON: string }) => string;
  reset: (props: { href: string; key: string }) => string;
};

const urlParamsHandlers: URLHandlers = {
  get: ({ href, key }) => {
    const params = new URL(href);
    return params.searchParams.get(key);
  },
  update: ({ href, key, stateJSON }) => {
    const url = new URL(href);
    url.searchParams.set(key, stateJSON);
    return url.toString();
  },
  reset: ({ href, key }) => {
    const url = new URL(href);
    url.searchParams.delete(key);
    return url.toString();
  },
};

export class URLStore implements Store {
  private state: Record<string, unknown> = {};
  // `state`'s JSON string for comparison
  private stateJSON: string = "{}";
  private readonly listeners: Map<string, Set<Listener>> = new Map();

  constructor(
    private readonly key: string,
    private readonly syncer: Syncer,
    private readonly stateSerializer: StateSerializer = jsonSerializer,
    private readonly urlHandlers: URLHandlers = urlParamsHandlers,
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
      this.stateJSON = this.stateSerializer.serialize(this.state);
      // save to url
      const url = this.urlHandlers.update({
        href: location.href,
        key: this.key,
        stateJSON: this.stateJSON,
      });
      this.syncer.updateURL(url);
    } catch (e) {
      console.error(e);
    }

    this.notify(name);
  }

  load() {
    const stateJSON = this.urlHandlers.get({
      href: location.href,
      key: this.key,
    });
    if (this.stateJSON === stateJSON) return;
    this.stateJSON = stateJSON!;

    try {
      this.state = this.stateSerializer.deserialize(this.stateJSON || "{}");
    } catch (e) {
      console.error(e);
      this.state = {};
      // remove invalid state from url.
      const url = this.urlHandlers.reset({
        href: location.href,
        key: this.key,
      });
      this.syncer.updateURL(url);
    }

    queueMicrotask(() => this.notifyAll());
  }

  save() {
    // `set` to save it in the URL, so it does nothing.
  }
}
