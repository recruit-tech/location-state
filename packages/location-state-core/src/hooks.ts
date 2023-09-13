import { LocationStateContext } from "./context";
import { DefaultStoreName } from "./types";
import { useCallback, useContext, useState, useSyncExternalStore } from "react";

export type Refine<T> = (value: unknown) => T | undefined;

export type LocationStateDefinition<
  T,
  StoreName extends string = DefaultStoreName,
> = {
  name: string;
  defaultValue: T;
  storeName: StoreName;
  refine?: Refine<T>;
};

type Updater<T> = (prev: T) => T;
type UpdaterOrValue<T> = T | Updater<T>;
type SetState<T> = (updaterOrValue: UpdaterOrValue<T>) => void;

const useStore = (storeName: string) => {
  const { stores } = useContext(LocationStateContext);
  const store = stores[storeName];
  if (!store) {
    throw new Error(`Store not found: ${storeName}`);
  }

  return store;
};

const _useLocationState = <T, StoreName extends string>(
  definition: LocationStateDefinition<T, StoreName>,
): [T, SetState<T>] => {
  const storeState = _useLocationStateValue(definition);
  const setStoreState = _useLocationSetState(definition);
  return [storeState, setStoreState];
};

const _useLocationStateValue = <T, StoreName extends string>(
  definition: LocationStateDefinition<T, StoreName>,
): T => {
  const { name, defaultValue, storeName, refine } = useState(definition)[0];
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

const _useLocationSetState = <T, StoreName extends string>(
  definition: LocationStateDefinition<T, StoreName>,
): SetState<T> => {
  const { name, defaultValue, storeName, refine } = useState(definition)[0];
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
    // These values are immutable.
    [name, store, defaultValue, refine],
  );
  return setStoreState;
};

export const getHooksWith = <StoreName extends string>() =>
  ({
    useLocationState: _useLocationState,
    useLocationStateValue: _useLocationStateValue,
    useLocationSetState: _useLocationSetState,
  } as {
    useLocationState: <T>(
      definition: LocationStateDefinition<T, StoreName>,
    ) => [T, SetState<T>];
    useLocationStateValue: <T>(
      definition: LocationStateDefinition<T, StoreName>,
    ) => T;
    useLocationSetState: <T>(
      definition: LocationStateDefinition<T, StoreName>,
    ) => SetState<T>;
  });

export const { useLocationState, useLocationStateValue, useLocationSetState } =
  getHooksWith<DefaultStoreName>();
