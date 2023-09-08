import { LocationStateContext } from "./context";
import { StoreName } from "./types";
import { useCallback, useContext, useState, useSyncExternalStore } from "react";

const useStore = (storeName: StoreName | string) => {
  const { stores } = useContext(LocationStateContext);
  const store = stores[storeName];
  if (!store) {
    throw new Error(`Store not found: ${storeName}`);
  }

  return store;
};

export type Refine<T> = (value: unknown) => T | undefined;

export type LocationStateDefinition<T> = {
  name: string;
  defaultValue: T;
  storeName: StoreName | string;
  refine?: Refine<T>;
};

type Updater<T> = (prev: T) => T;
type UpdaterOrValue<T> = T | Updater<T>;
type SetState<T> = (updaterOrValue: UpdaterOrValue<T>) => void;

export const useLocationState = <T>(
  definition: LocationStateDefinition<T>,
): [T, SetState<T>] => {
  const storeState = useLocationStateValue(definition);
  const setStoreState = useLocationSetState<T>(definition);
  return [storeState, setStoreState];
};

export const useLocationStateValue = <T>({
  name,
  defaultValue,
  storeName,
  refine,
}: LocationStateDefinition<T>): T => {
  const store = useStore(storeName);
  const subscribe = useCallback(
    (onStoreChange: () => void) => store.subscribe(name, onStoreChange),
    [name, store],
  );
  const getSnapshot = () => {
    const storeValue = store.get(name) as T | undefined;
    const refinedValue = refine ? refine(storeValue) : storeValue;
    return refinedValue ?? defaultValue;
  };
  // `defaultValue` is assumed to always be the same value (for Objects, it must be memoized).
  const storeState = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => defaultValue,
  );
  return storeState;
};

export const useLocationSetState = <T>(
  props: LocationStateDefinition<T>,
): SetState<T> => {
  const { name, defaultValue, storeName, refine } = useState(props)[0];
  const store = useStore(storeName);
  const setStoreState = useCallback(
    (updaterOrValue: UpdaterOrValue<T>) => {
      if (typeof updaterOrValue !== "function") {
        store.set(name, updaterOrValue);
        return;
      }
      const updater = updaterOrValue as Updater<T>;
      const storeValue = store.get(name) as T | undefined;
      const refinedValue = refine ? refine(storeValue) : storeValue;
      const prev = refinedValue ?? defaultValue;
      store.set(name, updater(prev));
    },
    [name, store, defaultValue, refine],
  );
  return setStoreState;
};
