# API

- [Form hooks](#Form-hooks)
  - [function `useLocationForm`](#function-useLocationForm)
  - [type `GetLocationFormProps`](#type-GetLocationFormProps)

## Form hooks

Form hooks that are used to manage the state of a form implemented with conform.

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

Returns a conform options and function to get form props.

#### Type Parameters

- `Schema`: The schema of the form.

#### Parameters

- `location`: Partial options of `LocationStateDefinition` from `@location-state/core`. View the more detail in the [API docs](/packages/location-state-core/docs/API.md).
  - `name`: The name of the form.
  - `storeName`: The store name of the form. It can be `session` or `url`.
  - `refine`: The refine function of the form.
- `idPrefix`: The prefix of the [form id](https://conform.guide/api/react/useForm#options).

#### Returns

Returns an array that first element is the conform options and the second element is the function to get form props.

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

The function to get form props. It extends the [`getFormProps`](https://conform.guide/api/react/getFormProps) function from the `@conform-to/react` package.

#### Parameters

- `form`: The form object that is returned from the `useForm` hook.

#### Example

```tsx
<form {...getLocationFormProps(form)} action={action} noValidate>
  ...
</form>
```