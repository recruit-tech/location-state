# API

- [Form hooks](#Form-hooks)
  - [function `useLocationForm`](#function-useLocationForm)
  - [type `GetLocationFormProps`](#type-GetLocationFormProps)

## Form hooks

Form hooks that are used to manage the state of a form implemented with Conform.

### function `useLocationForm`

```ts
declare function useLocationForm<Schema extends Record<string, unknown>>({ location, idPrefix, }: {
  location: {
    name: string;
    storeName: "session" | "url";
    refine?: Refine<DeepPartial<Schema>>;
  };
  idPrefix?: string;
}): [
  {
    id: string;
  },
  GetLocationFormProps
];
```

Returns a Conform options and function to get form props.

#### Type Parameters

- `Schema`: The schema of the form.

#### Parameters

- `location`: Partial options of `LocationStateDefinition` from `@location-state/core`. View the more detail in the [API docs](/packages/location-state-core/docs/API.md).
  - `name`: The name of the form.
  - `storeName`: The store name of the form. It can be `session` or `url`.
  - `refine`: The refine function of the form.
- `idPrefix`: The prefix of the [form id](https://conform.guide/api/react/useForm#options).

#### Returns

Returns an array that first element is the Conform options for passing to the `useForm` argument and the second element is the function to get form props.

#### Example

```tsx
const [formOptions, getLocationFormProps] = useLocationForm({
  location: {
    name: "your-form",
    storeName: "session",
  },
});

const [form, fields] = useForm({
  lastResult,
  onValidate({ formData }) {
    return parseWithZod(formData, { schema: User });
  },
  ...formOptions,
});

return (
  <form {...getLocationFormProps(form)} action={action} noValidate>
    ...
  </form>
);
```

### type `GetLocationFormProps`

```ts
// import { getFormProps } from "@conform-to/react";
type GetFormPropsArgs = Parameters<typeof getFormProps>;
type GetLocationFormPropsReturnWith = ReturnType<typeof getFormProps>;
type GetLocationFormProps = (
  form: GetFormPropsArgs[0]
) => GetLocationFormPropsReturnWith & {
  onChange: (e: React.ChangeEvent<HTMLFormElement>) => void;
};
```

Returns the form props. This function extends [`getFormProps`](https://conform.guide/api/react/getFormProps) from the `@conform-to/react` package.

#### Parameters

- `form`: The form object that is returned from the `useForm` hook.

#### Returns

Conform options to pass as argument to `useForm`.

#### Example

```tsx
<form {...getLocationFormProps(form)} action={action} noValidate>
  ...
</form>
```