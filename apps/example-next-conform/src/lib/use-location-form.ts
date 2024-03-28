import { getFormProps, useForm } from "@conform-to/react";
import { type DefaultStoreName, useLocationState } from "@location-state/core";
import { type ChangeEvent, useSyncExternalStore } from "react";

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
  return [
    form,
    fields,
    (option) => {
      const { onSubmit: onSubmitOriginal, ...formProps } = getFormProps(
        form,
        option,
      );
      return {
        ...formProps,
        onSubmit(e: React.FormEvent<HTMLFormElement>) {
          // todo?: onSubmitで動的formの追加を検知しようとするとbutton.valueを元に判断するしかない（formはProxy挟んでるので動作に影響が出る可能性あり）
          console.log("getLocationInputProps", e.nativeEvent);
          onSubmitOriginal(e);
        },
        onChange: (e: React.ChangeEvent<HTMLFormElement>) => {
          setLocationState((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
          }));
        },
      };
    },
  ];
}

export * from "@conform-to/react";
