import { useCallback, useContext, useState, useSyncExternalStore } from "react";
import { LocationStateContext } from "./context";
import type { DefaultStoreName } from "./types";

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
type ValueOrUpdater<T> = T | Updater<T>;
type SetState<T> = (valueOrUpdater: ValueOrUpdater<T>) => void;
type GetState<T> = () => T;

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

const _useLocationGetState = <T, StoreName extends string>(
  definition: LocationStateDefinition<T, StoreName>,
): GetState<T> => {
  const { name, defaultValue, storeName, refine } = useState(definition)[0];
  const store = useStore(storeName);
  return useCallback(() => {
    const storeValue = store.get(name) as T | undefined;
    const refinedValue = refine ? refine(storeValue) : storeValue;
    return refinedValue ?? defaultValue;
  }, [store, name, refine, defaultValue]);
};

const _useLocationSetState = <T, StoreName extends string>(
  definition: LocationStateDefinition<T, StoreName>,
): SetState<T> => {
  const { name, defaultValue, storeName, refine } = useState(definition)[0];
  const store = useStore(storeName);
  const setStoreState = useCallback(
    (updaterOrValue: ValueOrUpdater<T>) => {
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
    useLocationGetState: _useLocationGetState,
    useLocationSetState: _useLocationSetState,
  }) as {
    useLocationState: <T>(
      definition: LocationStateDefinition<T, StoreName>,
    ) => [T, SetState<T>];
    useLocationStateValue: <T>(
      definition: LocationStateDefinition<T, StoreName>,
    ) => T;
    useLocationGetState: <T>(
      definition: LocationStateDefinition<T, StoreName>,
    ) => GetState<T>;
    useLocationSetState: <T>(
      definition: LocationStateDefinition<T, StoreName>,
    ) => SetState<T>;
  };

export const {
  useLocationState,
  useLocationStateValue,
  useLocationGetState,
  useLocationSetState,
} = getHooksWith<DefaultStoreName>();

export const useLocationKey = ({
  serverDefault,
  clientDefault,
}:
  | {
      serverDefault?: string;
      clientDefault?: string;
    }
  | undefined = {}) => {
  const { syncer } = useContext(LocationStateContext);
  if (!syncer) {
    throw new Error("syncer not found");
  }
  const subscribe = useCallback(
    (listener: () => void) => {
      const abortController = new AbortController();
      const { signal } = abortController;
      syncer.sync({
        listener,
        signal,
      });
      return () => abortController.abort();
    },
    [syncer],
  );
  // https://tkdodo.eu/blog/avoiding-hydration-mismatches-with-use-sync-external-store
  return useSyncExternalStore(
    subscribe,
    () => syncer.key() ?? clientDefault,
    () => serverDefault,
  );
};
