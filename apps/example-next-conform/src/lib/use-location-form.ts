import { type DefaultValue, getFormProps, useForm } from "@conform-to/react";
import {
  type LocationStateDefinition,
  useLocationGetState,
  useLocationSetState,
} from "@location-state/core";
import set from "lodash.set";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
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
> = Parameters<typeof useForm<Schema, FormValue, FormError>>[0];

type UseFormReturnValue<
  Schema extends Record<string, unknown>,
  FormValue = Schema,
  FormError = string[],
> = ReturnType<typeof useForm<Schema, FormValue, FormError>>;

type GetFormPropsArgs = Parameters<typeof getFormProps>;
type GetLocationFormPropsReturnWith = ReturnType<typeof getFormProps>;
type GetLocationFormProps = (
  option?: GetFormPropsArgs[1], // exclude 1st args: `form`
) => GetLocationFormPropsReturnWith & {
  onChange: (e: React.ChangeEvent<HTMLFormElement>) => void;
};

export function useLocationForm<
  Schema extends Record<string, unknown>,
  FormValue = Schema,
  FormError = string[],
>({
  location,
  defaultValue,
  id: idFromOptions,
  ...options
}: Pretty<
  UseFormOption<Schema, FormValue, FormError> & {
    location: Pretty<
      Omit<LocationStateDefinition<DefaultValue<Schema>>, "defaultValue">
    >;
  }
>): [
  ...UseFormReturnValue<Schema, FormValue, FormError>,
  GetLocationFormProps,
] {
  const locationDefinition: LocationStateDefinition<DefaultValue<Schema>> = {
    ...location,
    defaultValue,
  };
  const setLocationState = useLocationSetState(locationDefinition);
  const getLocationState = useLocationGetState(locationDefinition);
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

  const [formOption, setFormOption] = useState<{
    id: string;
    defaultValue: DefaultValue<Schema>;
  }>();

  useEffect(() => {
    setFormOption({
      id: idFromOptions ? `${idFromOptions}${keyFromStore}` : keyFromStore,
      defaultValue: getLocationState(),
    });
  }, [idFromOptions, keyFromStore, getLocationState]);

  const [form, fields] = useForm({
    ...options,
    // Need to change id when there are restored values from history
    id: formOption?.id,
    defaultValue: formOption?.defaultValue,
  });

  const shouldUpdateLocationState = useRef(false);
  useEffect(() => {
    if (shouldUpdateLocationState.current) {
      setLocationState(
        filterFormValueWithoutAction(form.value) as DefaultValue<Schema>,
      );
      shouldUpdateLocationState.current = false;
    }
  }, [form, setLocationState]);

  const getLocationFormProps: GetLocationFormProps = useCallback(
    (option) => {
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
        onChange(e) {
          const locationState = getLocationState();
          if (e.target.type === "checkbox") {
            set(locationState, e.target.name, e.target.checked);
          } else {
            set(locationState, e.target.name, e.target.value);
          }
          setLocationState(locationState);
        },
      };
    },
    [form, setLocationState, getLocationState],
  );

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
