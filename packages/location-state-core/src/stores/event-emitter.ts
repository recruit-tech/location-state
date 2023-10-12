import { Listener } from "./types";

export class EventEmitter {
  private readonly listeners: Map<string, Set<Listener>> = new Map();

  on(event: string, listener: Listener) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.add(listener);
    } else {
      this.listeners.set(event, new Set([listener]));
    }
  }

  off(event: string, listener: Listener) {
    const listeners = this.listeners.get(event);
    listeners?.delete(listener);
    if (listeners?.size === 0) {
      this.listeners.delete(event);
    }
  }

  emit(event: string) {
    this.listeners.get(event)?.forEach((listener) => listener());
  }

  emitAll() {
    this.listeners.forEach((listeners) =>
      listeners.forEach((listener) => listener()),
    );
  }

  deferEmitAll() {
    queueMicrotask(() => this.emitAll());
  }
}
