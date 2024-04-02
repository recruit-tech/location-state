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

const emptySubscribe = () => () => {};

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
  id: idPrefix,
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

  const [formOption, setFormOption] = useState<{
    id: string;
    defaultValue: DefaultValue<Schema>;
  }>();

  useEffect(() => {
    setFormOption({
      id: idPrefix ? `${idPrefix}${idSuffix}` : idSuffix,
      defaultValue: getLocationState(),
    });
  }, [idPrefix, idSuffix, getLocationState]);

  const [form, fields] = useForm({
    ...options,
    // Need to change id when there are restored values from history
    ...formOption,
  });

  const formRef = useRef(form);
  // Update formRef when form is updated
  formRef.current = form;
  const [shouldUpdateLocationState, setShouldUpdateLocationState] = useState(0);
  useEffect(() => {
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
    (option) => {
      const { onSubmit: onSubmitOriginal, ...formProps } = getFormProps(
        formRef.current,
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
            setShouldUpdateLocationState((prev) => prev + 1);
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

  return [form, fields, getLocationFormProps];
}

type FormValue = Pretty<ReturnType<typeof useForm>[0]>["value"];

function filterFormValueWithoutAction(formValue: FormValue | undefined) {
  if (formValue === undefined) return formValue;
  // Ignore ServerActions specific values
  return Object.fromEntries(
    Object.entries(formValue).filter(([key]) => !key.includes("$ACTION")),
  );
}
