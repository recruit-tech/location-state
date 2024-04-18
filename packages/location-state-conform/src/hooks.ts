import { getFormProps } from "@conform-to/react";
import {
  type LocationStateDefinition,
  useLocationGetState,
  useLocationKey,
  useLocationSetState,
} from "@location-state/core";
import type { DeepPartial, Pretty } from "@repo/utils/type";
import { useCallback, useEffect, useId, useRef } from "react";
import * as v from "valibot";
import {
  InsertIntentValue,
  RemoveIntentValue,
  ReorderIntentValue,
  ResetIntentValue,
  SubmitEventValue,
  UpdateIntentValue,
} from "./schema";
import { updatedWithObjectPath } from "./updated-with-object-path";

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
          const updateValue =
            e.target.type === "checkbox" ? e.target.checked : e.target.value;
          setLocationState(
            updatedWithObjectPath(prevState, e.target.name, updateValue),
          );
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
                const { name } = v.parse(ResetIntentValue, payload);
                const prevState =
                  getLocationState() ?? ({} as DeepPartial<Schema>);
                const nextState = name
                  ? updatedWithObjectPath(prevState, name, undefined)
                  : undefined;
                setLocationState(nextState);
                break;
              }
              case "update": {
                // https://github.com/edmundhung/conform/blob/f955e1c5ba1fd1014c83bc3a1ba4fb215941a108/packages/conform-dom/submission.ts#L323
                const { name, value } = v.parse(UpdateIntentValue, payload);
                const prevState =
                  getLocationState() ?? ({} as DeepPartial<Schema>);
                const nextState = updatedWithObjectPath(prevState, name, value);
                setLocationState(nextState);
                break;
              }
              case "insert": {
                // https://github.com/edmundhung/conform/blob/1964a3981f0a18703744e3a80ad1487073d97e11/packages/conform-dom/submission.ts#L350-L359
                const { name, index, defaultValue } = v.parse(
                  InsertIntentValue,
                  payload,
                );
                const prevState =
                  getLocationState() ?? ({} as DeepPartial<Schema>);
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
                const { name, index } = v.parse(RemoveIntentValue, payload);
                const prevState =
                  getLocationState() ?? ({} as DeepPartial<Schema>);
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
                const { name, from, to } = v.parse(ReorderIntentValue, payload);
                const prevState =
                  getLocationState() ?? ({} as DeepPartial<Schema>);
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
    const jsonParsed = JSON.parse(json);
    return v.parse(SubmitEventValue, jsonParsed);
  } catch (ignore) {
    console.warn("parseSafe failed: ", ignore);
    return { type: "", payload: {} };
  }
}