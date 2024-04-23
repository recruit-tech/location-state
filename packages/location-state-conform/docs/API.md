# API

- [Form hooks](#Form-hooks)
  - [function `useLocationForm`](#function-useLocationForm)

## Form hooks

Form hooks that are used to manage the state of a form created with conform.

### function `useLocationForm`

```ts
export declare function useLocationForm<Schema extends Record<string, unknown>>({ location, idPrefix, }: Pretty<{
  location: {
    name: string;
    storeName: "session" | "url";
    refine?: Refine<T>;
  };
  idPrefix?: string;
}>): [
  {
    id: string;
  },
  GetLocationFormProps
];
```
