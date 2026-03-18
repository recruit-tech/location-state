/// <reference types="navigation-api-types" />

import type { Syncer } from "@location-state/core";

export class NextAppSyncer implements Syncer {
  constructor(private readonly navigation?: Navigation) {}

  key(): string | undefined {
    return this.navigation?.currentEntry?.key;
  }

  sync({
    listener,
    signal,
  }: {
    listener: (key: string) => void;
    signal: AbortSignal;
  }): void {
    let prevKey: string;
    this.navigation?.addEventListener(
      "currententrychange",
      (e) => {
        const { navigationType } = e;
        if (navigationType !== "push" && navigationType !== "replace") {
          return;
        }
        // Since an Entry always exists at the time of `currententrychange, it is non-null.
        const currentKey = this.key()!;
        if (prevKey === currentKey) {
          // `history.replace` may cause events to fire with the same key.
          // https://github.com/WICG/navigation-api#the-current-entry
          return;
        }

        listener(currentKey);
        prevKey = currentKey;
      },
      {
        signal,
      },
    );
  }

  updateURL(url: string): void {
    const { __NA, __N, ...rest } = globalThis.history.state ?? {};
    const state = Object.keys(rest).length > 0 ? rest : null;
    globalThis.history.replaceState(state, "", url);
  }
}
