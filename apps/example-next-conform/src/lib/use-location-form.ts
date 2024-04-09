import { type DefaultValue, getFormProps } from "@conform-to/react";
import {
  type LocationStateDefinition,
  useLocationGetState,
  useLocationKey,
  useLocationSetState,
} from "@location-state/core";
import {
  useCallback,
  useEffect,
  useId,
  useReducer,
  useRef,
  useState,
} from "react";
import { updateWithObjectPath } from "./utils/update-with-object-path";

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
  idPrefix,
}: Pretty<
  Pretty<{
    location: Pretty<
      Omit<LocationStateDefinition<DefaultValue<Schema>>, "defaultValue">
    >;
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
  defaultValue,
  idPrefix,
}: Pretty<
  Pretty<{
    location: Pretty<
      Omit<LocationStateDefinition<DefaultValue<Schema>>, "defaultValue">
    >;
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
  defaultValue,
  idPrefix,
}: Pretty<
  Pretty<{
    location: Pretty<
      Omit<LocationStateDefinition<DefaultValue<Schema>>, "defaultValue">
    >;
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
  const getLocationState = useLocationGetState(locationDefinition);
  const setLocationState = useLocationSetState(locationDefinition);

  const randomId = useId();
  const formIdPrefix = idPrefix ?? randomId;
  const locationKey = useLocationKey();
  const formIdSuffix = `location-form-${locationKey}`;

  const [formOption, setFormOption] = useState<{
    id: string;
    defaultValue?: DefaultValue<Schema>;
  }>({
    // https://conform.guide/api/react/useForm#tips
    // We can pass a different id to the useForm hook to reset the form.
    // Change id on useEffect.
    id: formIdPrefix,
    defaultValue,
  });

  useEffect(() => {
    setFormOption({
      id: `${formIdPrefix}-${formIdSuffix}`,
      defaultValue: getLocationState(),
    });
  }, [formIdPrefix, formIdSuffix, getLocationState]);

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
      setLocationState(formRef.current.value);
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
            setLocationState(
              updateWithObjectPath(
                locationState,
                e.target.name,
                e.target.checked,
              ),
            );
          } else {
            setLocationState(
              updateWithObjectPath(
                locationState,
                e.target.name,
                e.target.value,
              ),
            );
          }
        },
      };
    },
    [setLocationState, getLocationState],
  );

  return [formOption, getLocationFormProps];
}
