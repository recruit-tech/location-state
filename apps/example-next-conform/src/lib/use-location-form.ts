import { type DefaultValue, useForm } from "@conform-to/react";
import { type DefaultStoreName, useLocationState } from "@location-state/core";
import type { ChangeEvent } from "react";

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

type LocationFormProps = {
  onChange: (e: ChangeEvent<HTMLFormElement>) => void;
};

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
>): [...UseFormReturnValue<Schema, FormValue, FormError>, LocationFormProps] {
  const [locationState, setLocationState] = useLocationState({
    ...location,
    defaultValue,
  });
  // fixme: impl `useSyncer()`
  let id: string | undefined;
  if (locationState && typeof window !== "undefined") {
    id = `useLocationForm-${window?.navigation?.currentEntry?.key}`;
  }
  const [form, fields] = useForm({
    ...options,
    id,
    defaultValue: locationState as DefaultValue<Schema>,
  });
  return [
    form,
    fields,
    {
      onChange: (e: React.ChangeEvent<HTMLFormElement>) => {
        setLocationState((prev) => ({
          ...prev,
          [e.target.name]: e.target.value,
        }));
      },
    },
  ];
}

export * from "@conform-to/react";
