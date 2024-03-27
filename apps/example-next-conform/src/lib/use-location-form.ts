import { type DefaultValue, getFormProps, useForm } from "@conform-to/react";
import {
  useLocationSetState,
  useLocationStateValue,
} from "@location-state/core";

type Pretty<T> = {
  [K in keyof T]: T[K];
} & {};

type UseFormOption<
  Schema extends Record<string, unknown>,
  FormValue = Schema,
  FormError = string[],
> = Parameters<typeof useForm<Schema, FormValue, FormError>>[0];

type UseFormReturnValue<
  Schema extends Record<string, unknown>,
  FormValue = Schema,
  FormError = string[],
> = ReturnType<typeof useForm<Schema, FormValue, FormError>>;

function isEmpty(target: Record<string, unknown>) {
  return Object.keys(target).length === 0;
}

export function useLocationForm<
  Schema extends Record<string, unknown>,
  FormValue = Schema,
  FormError = string[],
>(
  options: Pretty<UseFormOption<Schema, FormValue, FormError>>,
): UseFormReturnValue<Schema, FormValue, FormError> {
  const locationState = useLocationStateValue<Schema>({
    name: "__test__conform",
    defaultValue: {} as Schema, // todo: fix default value and type
    storeName: "session",
  });
  // fixme: impl `useSyncer()`
  let id: string | undefined;
  if (!isEmpty(locationState) && typeof window !== "undefined") {
    id = `useLocationForm-${window?.navigation?.currentEntry?.key}`;
  }
  return useForm({
    ...options,
    id,
    defaultValue: locationState as DefaultValue<Schema>,
  });
}

type GetFormPropsArgs = Parameters<typeof getFormProps>;

export function getLocationFormProps(...args: GetFormPropsArgs) {
  const formProps = getFormProps(...args);
  const setLocationState = useLocationSetState({
    name: "__test__conform",
    defaultValue: {},
    storeName: "session",
  });
  return {
    ...formProps,
    onChange: (e: React.ChangeEvent<HTMLFormElement>) => {
      setLocationState((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    },
  };
}

export * from "@conform-to/react";
