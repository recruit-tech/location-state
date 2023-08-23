/// <reference types="navigation-api-types" />

import { Syncer } from "../../core/src/syncers/types";
import { NextRouter } from "next/router";

export class NextPagesSyncer implements Syncer {
  private readonly listeners = new Set<(key: string) => void>();

  constructor(private readonly router: NextRouter) {}

  key(): string | undefined {
    // The `history.state.key` disappears on reload or MPA transition.
    // Also, only the form parts are restored when Chrome's BF Cache is restored, so use Navigation API key when available.
    return window.navigation?.currentEntry?.key ?? window.history.state.key;
  }

  sync({
    listener,
    signal,
  }: {
    listener: (key: string) => void;
    signal: AbortSignal;
  }): void {
    this.listeners.add(listener);
    signal?.addEventListener("abort", () => {
      this.listeners.delete(listener);
    });
  }

  notify() {
    const currentKey = this.key()!;
    this.listeners.forEach((listener) => listener(currentKey));
  }

  updateURL(url: string): void {
    this.router.replace(url, undefined, { shallow: true });
  }
}
