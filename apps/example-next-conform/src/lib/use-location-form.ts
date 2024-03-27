import { getFormProps, useForm } from "@conform-to/react";
// todo: fix /context dependency
// @ts-ignore
import type { FormMetadata, FormOptions } from "@conform-to/react/context";
import {
  useLocationSetState,
  useLocationStateValue,
} from "@location-state/core";

type Pretty<T> = {
  [K in keyof T]: T[K];
} & {};

type UseFormOptionPartial = Pick<
  Parameters<typeof useForm>[0],
  "id" | "defaultNoValidate"
>;

function isEmpty(target: Record<string, unknown>) {
  return Object.keys(target).length === 0;
}

export function useLocationForm<
  Schema extends Record<string, unknown>,
  FormValue = Schema,
  FormError = string[],
>(
  options: Pretty<Omit<FormOptions<Schema, FormError, FormValue>, "formId">> &
    UseFormOptionPartial,
): [
  FormMetadata<Schema, FormError>,
  ReturnType<FormMetadata<Schema, FormError>["getFieldset"]>,
] {
  const locationState = useLocationStateValue({
    name: "__test__conform",
    defaultValue: {},
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
    defaultValue: locationState,
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
