import { LocationStateContext } from "./context";
import { StorageStore, Store, URLStore } from "./stores";
import { NavigationSyncer } from "./syncers";
import { Syncer } from "./types";
import { ReactNode, useEffect, useState } from "react";

type Stores = Record<string, Store>;
type CreateStores = (syncer: Syncer) => Stores;

const createDefaultStores: CreateStores = (syncer) => ({
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
  const [stores] = useState(() => {
    if (props.stores) {
      return typeof props.stores === "function"
        ? props.stores(syncer)
        : props.stores;
    }
    return createDefaultStores(syncer);
  });

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

  return (
    <LocationStateContext.Provider value={{ stores }}>
      {children}
    </LocationStateContext.Provider>
  );
}
