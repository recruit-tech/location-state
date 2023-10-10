# API

- [State hooks](#State-hooks)
  - [type `LocationStateDefinition`](#type-LocationStateDefinition)
  - [type `Refine`](#type-Refine)

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
