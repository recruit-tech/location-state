import { Syncer } from "../types";
import { jsonSerializer } from "./serializer";
import { Listener, Store, Serializer } from "./types";

export class URLStore implements Store {
  private state: Record<string, unknown> = {};
  // `state`'s JSON string for comparison
  private stateJSON: string = "{}";
  private readonly listeners: Map<string, Set<Listener>> = new Map();
  private readonly serializer: Serializer;

  constructor(
    private readonly key: string,
    private readonly syncer: Syncer,
    serializer?: Serializer,
  ) {
    this.serializer = serializer ?? jsonSerializer;
  }

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
      this.stateJSON = this.serializer.serialize(this.state);
    } catch (e) {
      console.error(e);
      this.notify(name);
      // Not reflected in URL.
      return;
    }
    // save to url
    const url = new URL(location.href);
    url.searchParams.set(this.key, this.stateJSON);
    this.syncer.updateURL(url.toString());

    this.notify(name);
  }

  load() {
    const params = new URLSearchParams(location.search);
    const stateJSON = params.get(this.key);
    if (this.stateJSON === stateJSON) return;
    this.stateJSON = stateJSON!;
    try {
      this.state = this.serializer.deserialize(this.stateJSON || "{}");
    } catch (e) {
      console.error(e);
      this.state = {};
      // remove invalid state from url.
      const url = new URL(location.href);
      url.searchParams.delete(this.key);
      this.syncer.updateURL(url.toString());
      return;
    }
    queueMicrotask(() => this.notifyAll());
  }

  save() {
    // `set` to save it in the URL, so it does nothing.
  }
}
