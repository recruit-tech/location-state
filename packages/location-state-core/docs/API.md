# API

- [State hooks](#State-hooks)
  - [type `LocationStateDefinition`](#type-LocationStateDefinition)
  - [type `Refine`](#type-Refine)

## State hooks

State hooks can only be used in [`<LocationStateProvider>`](#LocationStateProvider) below components.

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

Common options for state hooks are defined `LocationStateDefinition`.

> **Warning**
> State hooks evaluates this option only once at the first rendering.**Be careful to pass different values when re-rendering, as they will not be reflected.**

#### Type Parameters

- `T`: Type of state.
- `StoreName`: The type of the `Store` name that can be specified.

#### Parameters

- `name`: A name that uniquely identifies the state at the current historical location in the `Store` specified by `storeName`.
- `defaultValue`: Default value returned by state hooks if there is no state in `Store`.
- `storeName`: The name of the `Store` where the state will be stored. By default, `"session"` and `"url"` are available. You can be changed with the type parameter `StoreName`.
- `refine?`: Function to validate and convert a state obtained from `Store`. See [Refine](#type-refine).

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

The type of the function that validate and convert the state obtained from the `Store`. You should not throw error if validation fails.

#### Type Parameters

- `T`: Type of state.

#### Parameters

- `state`: The value obtained from store.

#### Returns

Returns the validated and converted value, or `undefined`. If `undefined` is returned, state hooks will return the value specified by `defaultValue` of `LocationStateDefinition` as state.

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
