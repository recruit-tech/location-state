# API

- [State hooks](#State-hooks)
  - [type `LocationStateDefinition`](#type-LocationStateDefinition)
  - [type `Refine`](#type-Refine)
  - [function `useLocationState`](#function-useLocationState)
  - [function `useLocationStateValue`](#function-useLocationStateValue)
  - [function `useLocationGetState`](#function-useLocationGetState)
  - [function `useLocationSetState`](#function-useLocationSetState)
  - [function `useLocationKey`](#function-useLocationKey)
- [Provider](#Provider)
  - [component `<LocationStateProvider>`](#component-LocationStateProvider)
  - [function `createDefaultStores`](#function-createDefaultStores)
  - [function`getHooksWith`](#function-getHooksWith)
- [Syncer](#Syncer)
  - [class `NavigationSyncer`](#class-NavigationSyncer)
- [Store](#Store)
  - [type `Store`](#type-Store)
  - [type `Stores`](#type-Stores)
  - [type `StateSerializer`](#type-StateSerializer)
  - [class `StorageStore`](#class-StorageStore)
  - [type `URLEncoder`](#type-URLEncoder)
  - [class `URLStore`](#class-URLStore)

## State hooks

State hooks are only available in descendant components of [`<LocationStateProvider>`](#LocationStateProvider).

### type `LocationStateDefinition`

```ts
type LocationStateDefinition<
  T,
  StoreName extends string = "session" | "url",
> = {
  name: string;
  defaultValue: T;
  storeName: StoreName;
  refine?: Refine<T>;
};
```

Common options for state hooks.

> **Warning**
> State hooks evaluates this option only once at the first rendering. **Passing different values at re-rendering is not applied.**

#### Type Parameters

- `T`: Type of state.
- `StoreName`: The type of the `Store` name.

#### Parameters

- `name`: A unique name that identifies the state at the current history location in the `Store` specified by `storeName`.
- `defaultValue`: Default value returned by state hooks if there is no state in the `Store`.
- `storeName`: The name of the `Store` where the state will be stored. By default, `"session"` and `"url"` are available. You can be changed with the type parameter `StoreName`.
- `refine?`: Function to validate and/or convert a state retrieved from the `Store`. See [Refine](#type-refine).

#### Example

```ts
const counter: LocationStateDefinition<number> = {
  name: "count",
  defaultValue: 0,
  storeName: "session",
};
const [count, setCount] = useLocationValue(counter);
```

### type `Refine`

```ts
type Refine<T> = (state: unknown) => T | undefined;
```

The type of the function that validate and/or convert the state retrieved from the `Store`. It must not throw an error if validation fails.

#### Type Parameters

- `T`: Type of state.

#### Parameters

- `state`: The value retrieved from store.

#### Returns

Validated state value, converted from it, or undefined. If `undefined` is returned, state hooks will return the `defaultValue` of the `LocationStateDefinition` as state.

#### Example

```ts
const zodRefine =
  <T extends unknown>(schema: ZodType<T>): Refine<T> =>
  (value) => {
    const result = schema.safeParse(value);
    return result.success ? result.data : undefined;
  };

const [counter, setCounter] = useLocationState({
  name: "counter",
  defaultValue: 0,
  storeName,
  refine: zodRefine(
    // Migration of state that were previously type `string`, but are now type `number`.
    z.union([
      z.number(),
      z
        .string()
        .regex(/\d+/)
        .transform((v) => Number(v)),
    ]),
  ),
});
```

### function `useLocationState`

```ts
type SetState<T> = (valueOrUpdater: T | ((prev: T) => T)) => void;

declare const useLocationState: <T>(
  definition: LocationStateDefinition<T, DefaultStoreName>,
) => [T, SetState<T>];
```

Allows access to the state associated with the current history location from a specified `Store`. This hook subscribes to re-render the component if there is a change in the state.

#### Type Parameters

- `T`: Type of state.

#### Parameters

- `definition`: See [`LocationStateDefinition`](#type-locationstatedefinition).

#### Returns

Returns an array that first element is a state and the second element is a state update function.

#### Example

```ts
const [count, setCount] = useLocationState({
  name: "count",
  defaultValue: 0,
  storeName: "session",
});
```

### function `useLocationStateValue`

```ts
declare const useLocationStateValue: <T>(
  definition: LocationStateDefinition<T, DefaultStoreName>,
) => T;
```

Allows a reference to the state associated with the current history location from a specified `Store`. This hook subscribes to re-render the component if there is a change in the state.

#### Type Parameters

- `T`: Type of state.

#### Parameters

- `definition`: See [`LocationStateDefinition`](#type-locationstatedefinition).

#### Returns

Returns state.

#### Example

```ts
const count = useLocationStateValue({
  name: "count",
  defaultValue: 0,
  storeName: "session",
});
```

### function `useLocationGetState`

```ts
type GetState<T> = () => T;

declare const useLocationGetState: <T>(
  definition: LocationStateDefinition<T, DefaultStoreName>,
) => GetState<T>;
```

Allows getting of the state associated with the current history location from a specified `Store`. This hooks will **not re-render** the component if there is a change in the state.

#### Type Parameters

- `T`: Type of state.

#### Parameters

- `definition`: See [`LocationStateDefinition`](#type-locationstatedefinition).

#### Returns

Returns the callback function to get state. It can be used in the `useEffect` hook, event handler, etc.

#### Example

```ts
const getCount = useLocationGetState({
  name: "count",
  defaultValue: 0,
  storeName: "session",
});

useEffect(() => {
  const count = getCount();
  // ...
}, [getCount]);
```

### function `useLocationSetState`

```ts
type SetState<T> = (valueOrUpdater: T | ((prev: T) => T)) => void;

declare const useLocationSetState: <T>(
  definition: LocationStateDefinition<T, DefaultStoreName>,
) => SetState<T>;
```

Allows updating of the state associated with the current history location from a specified `Store`.

#### Type Parameters

- `T`: Type of state.

#### Parameters

- `definition`: See [`LocationStateDefinition`](#type-locationstatedefinition).

#### Returns

Returns the update function of state.

#### Example

```ts
const setCount = useLocationSetState({
  name: "count",
  defaultValue: 0,
  storeName: "session",
});
```

### function `useLocationKey`

```ts
declare const useLocationKey: ({ serverDefault, clientDefault, }?: {
  serverDefault?: string | undefined;
  clientDefault?: string | undefined;
} | undefined) => string | undefined;
```

Returns the key associated with the current history location from the `Syncer`. This hook subscribes to re-render the component if there is a change in the key.

#### Parameters

- `serverDefault`: Key on the server. This key is used when server side and client hydration. If not specified, `undefined` is used.
- `clientDefault`: Default key when key is not available. If not specified, `undefined` is used.

#### Returns

Returns the key associated with the current history location.

#### Example

```ts
const locationKey = useLocationKey();
```

## Provider

### component `<LocationStateProvider>`

```ts
declare function LocationStateProvider({
  children,
  ...props
}: {
  syncer?: Syncer;
  stores?: Stores | ((syncer: Syncer) => Stores);
  children: ReactNode;
}): JSX.Element;
```

Context Provider of `location-state`.

#### Props

- `syncer?`: Specifies how `location-state` synchronizes with history. It must implement [`Syncer`](#syncer). If not specified, [`NavigationSyncer`](#class-NavigationSyncer) instance is used.
- `stores?`: [`Stores`](#type-stores) that persist state. If not specified, [`createDefaultStores()`](#function-createDefaultStores) is used.

#### Example

```tsx
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocationStateProvider syncer={syncer} stores={stores}>
      {children}
    </LocationStateProvider>
  );
}
```

### function `createDefaultStores`

```ts
export declare const createDefaultStores: (syncer: Syncer) => Stores;
```

Create default [`Stores`](#type-Stores) to be used by `<LocationStateProvider>`.

#### Parameters

- `syncer?`: Specifies how `location-state` synchronizes with history. It must implement [`Syncer`](#syncer). If not specified, [`NavigationSyncer`](#class-NavigationSyncer) instance is used.

#### Returns

Returns [`Stores`](#type-stores) with the following properties.

| Store Name  | Store          | detail                                  |
| ----------- | -------------- | --------------------------------------- |
| `"session"` | `StorageStore` | Store to persist in session storage.    |
| `"url"`     | `URLStore`     | Store to persist in a URL query string. |

#### Example

```ts
const defaultStores = createDefaultStores(syncer);
```

### function `getHooksWith`

```ts
export declare const getHooksWith: <StoreName extends string>() => {
  useLocationState: <T>(
    definition: LocationStateDefinition<T, StoreName>,
  ) => [T, SetState<T>];
  useLocationStateValue: <T>(
    definition: LocationStateDefinition<T, StoreName>,
  ) => T;
  useLocationSetState: <T>(
    definition: LocationStateDefinition<T, StoreName>,
  ) => SetState<T>;
};
```

Returns state hooks that allows a type parameter to be specified for the storeName of the `LocationStateDefinition`. This is useful when you specify custom stores for the `<LocationStateProvider>`.

#### Type Parameters

- `StoreName`: The type of the `Store` name.

#### Returns

Returns the following hooks to which `StoreName` is bound.

- [`useLocationState`](#function-useLocationState)
- [`useLocationStateValue`](#function-useLocationStateValue)
- [`useLocationSetState`](#function-useLocationSetState)

#### Example

```ts
export const { useLocationState, useLocationStateValue, useLocationSetState } =
  getHooksWith<"local" | "indexeddb">();
```

## Syncer

### type `Syncer`

```ts
type Syncer = {
  key(): string | undefined;
  sync(arg: { listener: (key: string) => void; signal: AbortSignal }): void;
  updateURL(url: string): void;
};
```

`Syncer` is an interface for synchronizing with history location. You can implement a `Syncer` to customize how to synchronize with the history location.

#### Methods

- `key()`: Returns a stable identifier string for the current history location. On the server side, returns `undefined`.
- `sync({ listener, signal })`: Called to synchronize with the history location. Call back the `listener` function when the history location is changed. When [signal](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/signal) has been aborted, do not call back the `listener` anymore.
- `updateURL(url)`: Update the browser's URL. It is used to persist state by URL.

### class `NavigationSyncer`

```ts
export declare class NavigationSyncer implements Syncer {
  constructor(navigation?: Navigation | undefined);
}
```

`Syncer` implementation that uses the [Navigation API](https://github.com/WICG/navigation-api) to synchronize with history location.

#### `new NavigationSyncer(navigation)`

- `navigation?`: `window.navigation` or implementation of [Navigation API](https://github.com/WICG/navigation-api). Pass `undefined` when server side.

#### Example

```tsx
const navigationSyncer = new NavigationSyncer(
  typeof window !== "undefined" ? window.navigation : undefined,
);
```

#### `unsafeNavigation`

Provides a temporary implementation for browsers that do not support the Navigation API. The actual value is below, depending on the runtime environment.

- Server side
  - `undefined`
- Client side
  - `window.navigation` when the Navigation API is supported.
  - Otherwise, Navigation API polyfill (partially implemented).

> **Warning**
> This is a polyfill-like implementation that partially supports the behavior of the Navigation API, but the scope of implementation is minimal and **the `location-state` does not actively test and support it**.

```tsx
import { unsafeNavigation } from "@location-state/core/unsafe-navigation";

const navigationSyncer = new NavigationSyncer(unsafeNavigation);
```

## Store

### type `Store`

```ts
type Unsubscribe = () => void;
type Store = {
  subscribe(name: string, listener: Listener): Unsubscribe;
  get(name: string): unknown;
  set(name: string, value: unknown): void;
  load(key: string): void;
  save(): void;
};
```

`Store` is an interface to implement state retention and persistence.

#### Methods

- `subscribe(name, listener)`: Call `listener` when `state[name]` changes. Return a function to `unsubscribe`.
- `get(name)`: Returns `state[name]`.
- `set(name, value)`: Update `state[name]` with `value`.
- `load(key)`: Load state from destination using `key` in history location and update state.
- `save()`: Save state to destination with current `key`.

### type `Stores`

```ts
export type Stores = Record<string, Store>;
```

`Stores` is a key-value object of `Store`.

### type `StateSerializer`

```ts
type StateSerializer = {
  serialize: (value: Record<string, unknown>) => string;
  deserialize: (value: string) => Record<string, unknown>;
};
```

Interface to serialize/deserialize state. It may be used for `Store`s customization.

### class `StorageStore`

```ts
export declare class StorageStore implements Store {
  constructor(storage?: Storage | undefined, stateSerializer?: StateSerializer);
}
```

A `Store` that stores state in `Storage`.

#### `new StorageStore(storage, stateSerializer)`

- `storage?`: The `Storage` of the destination. On the client side, pass `globalThis.sessionStorage` or `globalThis.localStorage`. On the server side, pass `undefined`.
- `stateSerializer?`: Specifies how to serialize/deserialize. By default, `JSON.stringify` and `JSON.parse` are used.

#### Example

```ts
const sessionStore = new StorageStore(
  typeof window !== "undefined" ? globalThis.sessionStorage : undefined,
);
```

### type `URLEncoder`

```ts
type URLEncoder = {
  encode: (url: string, state?: Record<string, unknown>) => string;
  decode: (url: string) => Record<string, unknown>;
};
```

Interface to URL encoding/decoding. It may be used for `URLStore`s customization.

### class `URLStore`

```ts
export declare class URLStore implements Store {
  constructor(syncer: Syncer, urlEncoder?: URLEncoder);
}
```

A `Store` that stores state in a URL.

#### `new URLStore(syncer, urlEncoder)`

- `syncer`: Implementation of [`Syncer`](#syncer) used for URL updates.
- `urlEncoder?`: Implementation of [`URLEncoder`](#type-urlencoder) used for URL encoding/decoding. By default, [`defaultSearchParamEncoder`](#defaultSearchParamEncoder) is used.

#### Example

```ts
const urlStore = new URLStore(syncer);
const customUrlStore = new URLStore(syncer, {
  encode: encodeUrlState,
  decode: decodeUrlState,
});
```

#### function `searchParamEncoder`

```ts
declare function searchParamEncoder(
  paramName: string,
  stateSerializer: StateSerializer,
): URLEncoder;
```

Generate a `URLEncoder` with the query parameter name and `StateSerializer`.

#### object `defaultSearchParamEncoder`: URLEncoder

```ts
declare const defaultSearchParamEncoder: URLEncoder;
```

This is the `URLEncoder` that `URLStore` uses by default. Serialize/Deserialize the state in the `location-state` query parameter with `JSON.stringify`/`JSON.parse`.

```
// Example of saving `counter: 1`.
https://test.com?location-state=%7B%22counter%22%3A1%7D
```
