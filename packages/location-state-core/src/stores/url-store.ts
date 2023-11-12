import { Syncer } from "../types";
import { EventEmitter } from "./event-emitter";
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
  private stateEvents = new EventEmitter();
  private loadEvents = new EventEmitter();

  constructor(
    private readonly syncer: Syncer,
    private readonly urlEncoder: URLEncoder = defaultSearchParamEncoder,
  ) {}

  subscribe(name: string, listener: Listener) {
    this.stateEvents.on(name, listener);
    return () => this.stateEvents.off(name, listener);
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

    this.stateEvents.emit(name);
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

    this.stateEvents.deferEmitAll();
    this.loadEvents.deferEmit("load");
  }

  onLoad(listener: Listener) {
    this.loadEvents.on("load", listener);
    return () => this.loadEvents.off("load", listener);
  }

  save() {
    // `set` to save it in the URL, so it does nothing.
  }
}
