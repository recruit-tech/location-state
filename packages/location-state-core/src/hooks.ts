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

export const useLocationState = <T>({
  name,
  defaultValue,
  storeName,
}: {
  name: string;
  defaultValue: T;
  storeName: StoreName | string;
}): [T, (value: T) => void] => {
  const storeState = useLocationStateValue({
    name,
    defaultValue,
    storeName,
  });
  const setStoreState = useLocationSetState({
    name,
    storeName,
  });
  return [storeState, setStoreState];
};

export const useLocationStateValue = <T>({
  name,
  defaultValue,
  storeName,
}: {
  name: string;
  defaultValue: T;
  storeName: StoreName | string;
}): T => {
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
  storeName,
}: {
  name: string;
  storeName: StoreName | string;
}): ((value: T) => void) => {
  const store = useStore(storeName);
  const setStoreState = useCallback(
    // todo: accept functions like useState
    (value: T) => {
      store.set(name, value);
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
