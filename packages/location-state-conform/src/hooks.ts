import { getFormProps } from "@conform-to/react";
import {
  type LocationStateDefinition,
  useLocationGetState,
  useLocationKey,
  useLocationSetState,
} from "@location-state/core";
import { useCallback, useEffect, useId, useRef } from "react";
import { updatedWithObjectPath } from "./updated-with-object-path";

// todo: move to utils package
type Pretty<T> = {
  [K in keyof T]: T[K];
} & {};

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

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
      Omit<LocationStateDefinition<DeepPartial<Schema>>, "defaultValue">
    >;
    idPrefix?: string;
  }>
>): [
  {
    id: string;
  },
  GetLocationFormProps,
] {
  const locationDefinition: LocationStateDefinition<
    DeepPartial<Schema> | undefined
  > = {
    ...location,
    defaultValue: undefined,
  };
  const getLocationState = useLocationGetState(locationDefinition);
  const setLocationState = useLocationSetState(locationDefinition);

  const randomId = useId();
  const formIdPrefix = idPrefix ?? randomId;
  const locationKey = useLocationKey();
  const formIdSuffix = `location-form-${locationKey}`;
  const formId = `${formIdPrefix}-${formIdSuffix}`;

  const formRef = useRef<GetFormPropsArgs[0] | null>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!formRef.current) {
      throw new Error(
        "`formRef.current` is null. You need to pass `form` to `getLocationFormProps`.",
      );
    }
    const values = getLocationState();
    if (values) {
      Object.entries(values).forEach(([name, value]) =>
        formRef.current!.update({ name, value: value! }),
      );
    }
  }, [formId, getLocationState]);

  const getLocationFormProps: GetLocationFormProps = useCallback(
    (form, option) => {
      formRef.current = form;
      const { onSubmit: onSubmitOriginal, ...formProps } = getFormProps(
        form,
        option,
      );

      return {
        ...formProps,
        onChange(e) {
          const prevState = getLocationState() ?? ({} as DeepPartial<Schema>);
          if (e.target.type === "checkbox") {
            setLocationState(
              updatedWithObjectPath(prevState, e.target.name, e.target.checked),
            );
          } else {
            setLocationState(
              updatedWithObjectPath(prevState, e.target.name, e.target.value),
            );
          }
        },
        onSubmit(e: React.FormEvent<HTMLFormElement>) {
          const { name, value } = (e.nativeEvent as SubmitEvent)
            .submitter as HTMLButtonElement;
          // Updating only intent button is submitted
          if (
            // https://github.com/edmundhung/conform/blob/ec101a2fb579e5438d443417a582c896bff050df/packages/conform-dom/submission.ts#L62
            name === "__intent__"
          ) {
            const { type, payload } = parseSafe(value);
            switch (type) {
              case "reset": {
                // https://github.com/edmundhung/conform/blob/f955e1c5ba1fd1014c83bc3a1ba4fb215941a108/packages/conform-dom/submission.ts#L310-L321
                const { name } = payload as {
                  name?: string;
                };
                // `prevState` always exists at the intent.
                const prevState = getLocationState() as DeepPartial<Schema>;
                const nextState = name
                  ? updatedWithObjectPath(prevState, name, undefined)
                  : undefined;
                setLocationState(nextState);
                break;
              }
              case "update": {
                // https://github.com/edmundhung/conform/blob/f955e1c5ba1fd1014c83bc3a1ba4fb215941a108/packages/conform-dom/submission.ts#L323
                const { name, value } = payload as {
                  name: string;
                  value: unknown;
                };
                // `prevState` always exists at the intent.
                const prevState = getLocationState() as DeepPartial<Schema>;
                const nextState = updatedWithObjectPath(prevState, name, value);
                setLocationState(nextState);
                break;
              }
              case "insert": {
                // https://github.com/edmundhung/conform/blob/1964a3981f0a18703744e3a80ad1487073d97e11/packages/conform-dom/submission.ts#L350-L359
                const { name, index, defaultValue } = payload as {
                  name: string;
                  index?: number;
                  defaultValue?: unknown;
                };
                // `prevState` always exists at the intent.
                const prevState = getLocationState() as DeepPartial<Schema>;
                const nextState = updatedWithObjectPath(
                  prevState,
                  name,
                  (prevArray: unknown[] = new Array(index ?? 0).fill({})) => {
                    const insertionIndex = index ?? prevArray.length;
                    return [
                      ...prevArray.slice(0, insertionIndex),
                      defaultValue ?? {},
                      ...prevArray.slice(insertionIndex, prevArray.length),
                    ];
                  },
                );
                setLocationState(nextState);
                break;
              }
              case "remove": {
                // https://github.com/edmundhung/conform/blob/1964a3981f0a18703744e3a80ad1487073d97e11/packages/conform-dom/submission.ts#L342-L349
                const { name, index } = payload as {
                  name: string;
                  index: number;
                };
                // `prevState` always exists at the intent.
                const prevState = getLocationState() as DeepPartial<Schema>;
                const nextState = updatedWithObjectPath(
                  prevState,
                  name,
                  (prevArray: unknown[]) => [
                    ...prevArray.slice(0, index),
                    ...prevArray.slice(index + 1),
                  ],
                );
                setLocationState(nextState);
                break;
              }
              case "reorder": {
                // https://github.com/edmundhung/conform/blob/1964a3981f0a18703744e3a80ad1487073d97e11/packages/conform-dom/submission.ts#L361-L368
                const { name, from, to } = payload as {
                  name: string;
                  from: number;
                  to: number;
                };
                // `prevState` always exists at the intent.
                const prevState = getLocationState() as DeepPartial<Schema>;
                const nextState = updatedWithObjectPath(
                  prevState,
                  name,
                  (prevArray: unknown[]) => {
                    const nextArray = [...prevArray];
                    const removed = nextArray.splice(from, 1);
                    nextArray.splice(to, 0, ...removed);
                    return nextArray;
                  },
                );
                setLocationState(nextState);
                break;
              }
            }
          }
          onSubmitOriginal(e);
        },
      };
    },
    [getLocationState, setLocationState],
  );

  return [{ id: formId }, getLocationFormProps];
}

function parseSafe(json: string): { type: string; payload: unknown } {
  try {
    return JSON.parse(json);
  } catch (ignore) {
    return { type: "", payload: {} };
  }
}
