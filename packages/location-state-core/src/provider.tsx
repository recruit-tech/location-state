import { type ReactNode, useEffect, useState } from "react";
import { LocationStateContext } from "./context";
import { StorageStore, type Store, URLStore } from "./stores";
import { NavigationSyncer } from "./syncers";
import type { Syncer } from "./types";

export type Stores = Record<string, Store>;
type DefaultStores = {
  session: Store;
  url: Store;
};
export type CreateStores<S extends Stores = Stores> = (syncer: Syncer) => S;

export const createDefaultStores: CreateStores<DefaultStores> = (syncer) => ({
  session: new StorageStore(),
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
  // Generated on first render to prevent provider from re-rendering
  const [contextValue] = useState(() => {
    const syncer =
      props.syncer ??
      new NavigationSyncer(
        typeof window !== "undefined" ? window.navigation : undefined,
      );
    const stores = props.stores ?? createDefaultStores;
    return {
      syncer,
      stores: typeof stores === "function" ? stores(syncer) : stores,
    };
  });

  return (
    <>
      <LocationEffect
        stores={contextValue.stores}
        syncer={contextValue.syncer}
      />
      <LocationStateContext.Provider value={contextValue}>
        {children}
      </LocationStateContext.Provider>
    </>
  );
}

// We split the component and adjust it so that LocationState's `useEffect` is executed
// before `children`'s `useEffect`.
function LocationEffect({
  stores,
  syncer,
}: {
  stores: Stores;
  syncer: Syncer;
}) {
  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;
    const applyAllStore = (callback: (store: Store) => void) => {
      Object.values(stores).forEach(callback);
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
  }, [syncer, stores]);

  return null;
}
