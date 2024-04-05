import {
  type DefaultValue,
  getFormProps,
  type useForm,
} from "@conform-to/react";
import {
  type LocationStateDefinition,
  useLocationGetState,
  useLocationSetState,
} from "@location-state/core";
import set from "lodash.set";
import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { type ZodRawShape, z } from "zod";

const emptySubscribe = () => () => {};

type Pretty<T> = {
  [K in keyof T]: T[K];
} & {};

type GetFormPropsArgs = Parameters<typeof getFormProps>;
type GetLocationFormPropsReturnWith = ReturnType<typeof getFormProps>;
type GetLocationFormProps = (
  ...args: GetFormPropsArgs
) => GetLocationFormPropsReturnWith & {
  onChange: (e: React.ChangeEvent<HTMLFormElement>) => void;
};

export function useLocationForm<Schema extends Record<string, unknown>>({
  location,
  filterFormValue,
  idPrefix,
}: Pretty<
  Pretty<{
    location: Pretty<
      Omit<LocationStateDefinition<DefaultValue<Schema>>, "defaultValue">
    >;
    filterFormValue: (form: Record<string, unknown>) => DefaultValue<Schema>;
    idPrefix?: string;
  }>
>): [
  {
    id: string;
  },
  GetLocationFormProps,
];
export function useLocationForm<Schema extends Record<string, unknown>>({
  location,
  filterFormValue,
  defaultValue,
  idPrefix,
}: Pretty<
  Pretty<{
    location: Pretty<
      Omit<LocationStateDefinition<DefaultValue<Schema>>, "defaultValue">
    >;
    filterFormValue: (form: Record<string, unknown>) => DefaultValue<Schema>;
    defaultValue: DefaultValue<Schema>;
    idPrefix?: string;
  }>
>): [
  {
    id: string;
    defaultValue: DefaultValue<Schema>;
  },
  GetLocationFormProps,
];
export function useLocationForm<Schema extends Record<string, unknown>>({
  location,
  filterFormValue,
  defaultValue,
  idPrefix,
}: Pretty<
  Pretty<{
    location: Pretty<
      Omit<LocationStateDefinition<DefaultValue<Schema>>, "defaultValue">
    >;
    filterFormValue: (form: Record<string, unknown>) => DefaultValue<Schema>;
    defaultValue?: DefaultValue<Schema>;
    idPrefix?: string;
  }>
>): [
  {
    id: string;
    defaultValue?: DefaultValue<Schema>;
  },
  GetLocationFormProps,
] {
  const locationDefinition: LocationStateDefinition<DefaultValue<Schema>> = {
    ...location,
    defaultValue,
  };
  const setLocationState = useLocationSetState(locationDefinition);
  const getLocationState = useLocationGetState(locationDefinition);

  // https://tkdodo.eu/blog/avoiding-hydration-mismatches-with-use-sync-external-store
  const idSuffix = useSyncExternalStore(
    emptySubscribe,
    () => {
      // fixme: impl `useSyncer()`
      const locationKey = window?.navigation?.currentEntry?.key;
      if (locationKey) return `useLocationForm-${locationKey}`;
      return undefined; // not support navigation api
    },
    () => "useLocationForm-server",
  );
  const formId = idPrefix ? `${idPrefix}-${idSuffix}` : idSuffix;

  const [formOption, setFormOption] = useState<{
    id?: string;
    defaultValue?: DefaultValue<Schema>;
  }>({
    // Change `id` on `useEffect`
    defaultValue,
  });

  useEffect(() => {
    setFormOption({
      id: formId,
      defaultValue: getLocationState(),
    });
  }, [formId, getLocationState]);

  const formRef = useRef(null);
  const [shouldUpdateLocationState, incrementShouldUpdateLocationState] =
    useReducer((prev) => prev + 1, 0);
  useEffect(() => {
    if (!formRef.current) {
      throw new Error(
        "`formRef.current` is null. You need to pass `form` to `getLocationFormProps`.",
      );
    }
    // ignore initial call to avoid overwriting with undefined
    if (shouldUpdateLocationState) {
      setLocationState(
        filterFormValueWithoutAction(
          formRef.current.value,
        ) as DefaultValue<Schema>,
      );
    }
  }, [shouldUpdateLocationState, setLocationState]);

  const getLocationFormProps: GetLocationFormProps = useCallback(
    (form, option) => {
      formRef.current = form;
      const { onSubmit: onSubmitOriginal, ...formProps } = getFormProps(
        form,
        option,
      );

      return {
        ...formProps,
        onSubmit(e: React.FormEvent<HTMLFormElement>) {
          // Updated only intent button is submitted
          if (
            ((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement)
              .name === "__intent__" // https://github.com/edmundhung/conform/blob/ec101a2fb579e5438d443417a582c896bff050df/packages/conform-dom/submission.ts#L62
          ) {
            incrementShouldUpdateLocationState();
          }
          onSubmitOriginal(e);
        },
        onChange(e) {
          const locationState =
            getLocationState() ?? ({} as DefaultValue<Schema>);
          if (e.target.type === "checkbox") {
            set(locationState, e.target.name, e.target.checked);
          } else {
            set(locationState, e.target.name, e.target.value);
          }
          setLocationState(locationState);
        },
      };
    },
    [setLocationState, getLocationState],
  );

  return [formOption, getLocationFormProps];
}

type FormValue = Pretty<ReturnType<typeof useForm>[0]>["value"];

function filterFormValueWithoutAction(formValue: FormValue | undefined) {
  if (formValue === undefined) return formValue;
  // Ignore ServerActions specific values
  return Object.fromEntries(
    Object.entries(formValue).filter(([key]) => !key.includes("$ACTION")),
  );
}

export function filterFormValueWihZodShape(shape: ZodRawShape) {
  // Ignore framework-derived form elements(e.g. Server Actions) by shallowly converting to z.any()
  const partialSchema = z
    .object(Object.fromEntries(Object.keys(shape).map((key) => [key, z.any()])))
    .optional();
  return (data: unknown) => partialSchema.parse(data);
}
