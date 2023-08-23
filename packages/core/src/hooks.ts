import { LocationStateContext } from "@/context";
import { StoreName } from "@/types";
import { useCallback, useContext, useSyncExternalStore } from "react";

export const useLocationState = <T>({
  name,
  defaultValue,
  storeName,
}: {
  name: string;
  defaultValue: T;
  storeName: StoreName | string;
}): [T, (value: T) => void] => {
  const { stores } = useContext(LocationStateContext);
  const store = stores[storeName];
  if (!store) {
    // todo: fix message
    throw new Error("Provider is required");
  }
  const subscribe = useCallback(
    (onStoreChange: () => void) => store.subscribe(name, onStoreChange),
    [name, store],
  );
  // `defaultValue` is assumed to always be the same value (for Objects, it must be memoized).
  const storeState = useSyncExternalStore(
    subscribe,
    () => (store.get(name) as T) ?? defaultValue,
    () => defaultValue,
  );
  const setStoreState = useCallback(
    // todo: accept functions like useState
    (value: T) => {
      store.set(name, value);
    },
    [name, store],
  );
  return [storeState, setStoreState];
};
