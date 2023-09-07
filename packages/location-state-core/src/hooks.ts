import { LocationStateContext } from "./context";
import { StoreName } from "./types";
import { useCallback, useContext, useSyncExternalStore } from "react";

const useStore = (storeName: StoreName | string) => {
  const { stores } = useContext(LocationStateContext);
  const store = stores[storeName];
  if (!store) {
    throw new Error("`LocationStateProvider` is required.");
  }

  return store;
};

export type LocationStateDefinition<T> = {
  name: string;
  defaultValue: T;
  storeName: StoreName | string;
};

type SetStateArg<T> = T | ((prev: T) => T);

export const useLocationState = <T>(
  definition: LocationStateDefinition<T>,
): [T, (setterOrValue: SetStateArg<T>) => void] => {
  const storeState = useLocationStateValue(definition);
  const setStoreState = useLocationSetState<T>(definition);
  return [storeState, setStoreState];
};

export const useLocationStateValue = <T>({
  name,
  defaultValue,
  storeName,
}: LocationStateDefinition<T>): T => {
  const store = useStore(storeName);
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
  return storeState;
};

export const useLocationSetState = <T>({
  name,
  defaultValue,
  storeName,
}: LocationStateDefinition<T>): ((setterOrValue: SetStateArg<T>) => void) => {
  const store = useStore(storeName);
  const setStoreState = useCallback(
    (setterOrValue: SetStateArg<T>) => {
      if (typeof setterOrValue === "function") {
        const setter = setterOrValue as (prev: T) => T;
        const prev = (store.get(name) as T) ?? defaultValue;
        store.set(name, setter(prev));
        return;
      }
      store.set(name, setterOrValue);
    },
    [name, store],
  );
  return setStoreState;
};

export const useLocationStateSnapshot = <T>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  storeName,
}: {
  name: string;
  storeName: StoreName | string;
}): T => {
  throw new Error("Not implemented yet");
};
