import { LocationStateContext } from "./context";
import { StorageStore, Store, URLStore } from "./stores";
import { NavigationSyncer } from "./syncers";
import { Syncer } from "./types";
import { ReactNode, useEffect, useState } from "react";

export type Stores = Record<string, Store>;
export type CreateStores = (syncer: Syncer) => Stores;

export const createDefaultStores: CreateStores = (syncer) => ({
  session: new StorageStore(globalThis.sessionStorage),
  url: new URLStore(syncer),
});

export function LocationStateProvider({
  children,
  ...props
}: {
  syncer?: Syncer;
  stores?: Stores | CreateStores;
  children: ReactNode;
}) {
  const [syncer] = useState(
    () => props.syncer ?? new NavigationSyncer(window.navigation),
  );
  // Generated on first render to prevent provider from re-rendering
  const [contextValue] = useState(() => {
    const stores = props.stores ?? createDefaultStores;
    return {
      stores: typeof stores === "function" ? stores(syncer) : stores,
    };
  });

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;
    const applyAllStore = (callback: (store: Store) => void) => {
      Object.values(contextValue.stores).forEach(callback);
    };

    const key = syncer.key()!;
    applyAllStore((store) => store.load(key));

    syncer.sync({
      listener: (key) => {
        applyAllStore((store) => {
          store.save();
          store.load(key);
        });
      },
      signal,
    });
    window?.addEventListener(
      "beforeunload",
      () => {
        applyAllStore((store) => store.save());
      },
      { signal },
    );

    return () => abortController.abort();
  }, [syncer, contextValue.stores]);

  return (
    <LocationStateContext.Provider value={contextValue}>
      {children}
    </LocationStateContext.Provider>
  );
}
