import { getFormProps, useForm } from "@conform-to/react";
// todo: fix /context dependency
// @ts-ignore
import type { FormMetadata, FormOptions } from "@conform-to/react/context";

type Pretty<T> = {
  [K in keyof T]: T[K];
} & {};

type UseFormOptionPartial = Pick<
  Parameters<typeof useForm>[0],
  "id" | "defaultNoValidate"
>;

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
  // todo: lastResult from location state?
  return useForm(options);
}

type GetFormPropsArgs = Parameters<typeof getFormProps>;

export function getLocationFormProps(...args: GetFormPropsArgs) {
  const formProps = getFormProps(...args);
  return {
    ...formProps,
    onChange: (e: React.ChangeEvent<HTMLFormElement>) => {
      console.log(e.target.name, e.target.value);
      // todo: save location state
    },
  };
}

export * from "@conform-to/react";
