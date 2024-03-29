import { type DefaultValue, getFormProps, useForm } from "@conform-to/react";
import { type DefaultStoreName, useLocationState } from "@location-state/core";
import {
  type ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

const noop = () => () => {};

type Pretty<T> = {
  [K in keyof T]: T[K];
} & {};

type UseFormOption<
  Schema extends Record<string, unknown>,
  FormValue = Schema,
  FormError = string[],
> = Omit<Parameters<typeof useForm<Schema, FormValue, FormError>>[0], "id">;

type UseFormReturnValue<
  Schema extends Record<string, unknown>,
  FormValue = Schema,
  FormError = string[],
> = ReturnType<typeof useForm<Schema, FormValue, FormError>>;

type GetFormPropsArgs = Parameters<typeof getFormProps>;
type GetLocationFormPropsReturnWith = ReturnType<typeof getFormProps> & {
  onChange: (e: ChangeEvent<HTMLFormElement>) => void;
};
type GetLocationFormProps = (
  option?: GetFormPropsArgs[1],
) => GetLocationFormPropsReturnWith;

export function useLocationForm<
  Schema extends Record<string, unknown>,
  FormValue = Schema,
  FormError = string[],
>({
  location,
  defaultValue,
  ...options
}: Pretty<
  UseFormOption<Schema, FormValue, FormError> & {
    location: {
      name: string;
      storeName: DefaultStoreName;
    };
  }
>): [
  ...UseFormReturnValue<Schema, FormValue, FormError>,
  GetLocationFormProps,
] {
  const [locationState, setLocationState] = useLocationState({
    ...location,
    defaultValue,
  });

  // https://tkdodo.eu/blog/avoiding-hydration-mismatches-with-use-sync-external-store
  const keyFromStore = useSyncExternalStore(
    noop,
    () => {
      // fixme: impl `useSyncer()`
      const locationKey = window?.navigation?.currentEntry?.key;
      if (locationKey) return `useLocationForm-${locationKey}`;
      return undefined; // not support navigation api
    },
    () => "useLocationForm-server",
  );

  const [form, fields] = useForm({
    ...options,
    // Need to change id when there are restored values from history
    id: locationState ? keyFromStore : undefined,
    defaultValue: locationState,
  });

  const shouldUpdateLocationState = useRef(false);
  const filteredFormValue = useMemo(
    () => filterFormValueWithoutAction(form.value),
    [form.value],
  );
  useEffect(() => {
    if (shouldUpdateLocationState.current) {
      setLocationState(filteredFormValue as DefaultValue<Schema>);
      shouldUpdateLocationState.current = false;
    }
  }, [filteredFormValue, setLocationState]);

  const getLocationFormProps: GetLocationFormProps = (option) => {
    const { onSubmit: onSubmitOriginal, ...formProps } = getFormProps(
      form,
      option,
    );
    return {
      ...formProps,
      onSubmit(e: React.FormEvent<HTMLFormElement>) {
        shouldUpdateLocationState.current = true;
        onSubmitOriginal(e);
      },
      onChange: (e: React.ChangeEvent<HTMLFormElement>) => {
        shouldUpdateLocationState.current = true;
      },
    };
  };

  return [form, fields, getLocationFormProps];
}

type FormValue = Pretty<ReturnType<typeof useForm>[0]>["value"];

function filterFormValueWithoutAction(formValue: FormValue | undefined) {
  if (formValue === undefined) return formValue;
  return Object.fromEntries(
    Object.entries(formValue).filter(([key]) => !key.includes("$ACTION")),
  );
}

export * from "@conform-to/react";
