# API

- [State hooks](#State-hooks)
  - [type `LocationStateDefinition`](#type-LocationStateDefinition)
  - [type `Refine`](#type-Refine)
  - [function `useLocationState`](#function-useLocationState)
  - [function `useLocationStateValue`](#function-useLocationStateValue)
  - [function `useLocationSetState`](#function-useLocationSetState)
- [Provider](#provider)
  - [component `<LocationStateProvider>`](#component-LocationStateProvider)
  - [function `createDefaultStores`](#function-createDefaultStores)
  - [function`getHooksWith`](#function-getHooksWith)

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
> State hooks evaluates this option only once at the first rendering.**Passing different values at re-rendering is not applied.**

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

### function `useLocationSetState`

```ts
type SetState<T> = (valueOrUpdater: T | ((prev: T) => T)) => void;

declare const useLocationSetState: <T>(
  definition: LocationStateDefinition<T, DefaultStoreName>,
) => SetState<T>;
```

Allows updating of the state associated with the current history location from a specified `Store`.

#### Type Parameters

- `T`: state の型

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

Create default [`Stores`](#type-stores) to be used by `<LocationStateProvider>`.

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
