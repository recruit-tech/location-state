import type { Syncer } from "../types";

export class NavigationSyncer implements Syncer {
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
    // Pass `null` instead of `globalThis.history.state` because Next.js
    // treats `replaceState` with `__NA` in the state as its own internal navigation.
    // ref: https://github.com/vercel/next.js/blob/41ed440b50dafe6bb1f76bd6774e7284288e0b16/packages/next/src/client/components/app-router.tsx#L363-L365
    globalThis.history.replaceState(null, "", url);
  }
}
