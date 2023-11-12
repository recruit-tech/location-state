import { EventEmitter } from "./event-emitter";
import { Listener, Store } from "./types";

type State = Record<string, unknown>;

export class InMemoryStore implements Store {
  private state: Record<string, unknown> = {};
  private stateEvents = new EventEmitter();
  private loadEvents = new EventEmitter();
  private currentKey: string | null = null;

  constructor(private readonly storage: Map<string, State> = new Map()) {}

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
    this.stateEvents.emit(name);
  }

  load(locationKey: string) {
    if (this.currentKey === locationKey) return;
    this.currentKey = locationKey;
    this.state = this.storage.get(locationKey) ?? {};
    this.stateEvents.deferEmitAll();
    this.loadEvents.deferEmit("load");
  }

  onLoad(listener: Listener) {
    this.loadEvents.on("load", listener);
    return () => this.loadEvents.off("load", listener);
  }

  save() {
    if (!this.currentKey) {
      return;
    }
    if (Object.keys(this.state).length === 0) {
      this.storage.delete(this.currentKey);
      return;
    }
    this.storage.set(this.currentKey, this.state);
  }
}
