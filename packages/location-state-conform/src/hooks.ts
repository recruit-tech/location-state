import { getFormProps } from "@conform-to/react";
import type { FormMetadata } from "@conform-to/react";
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
import { insertedAt, removedAt, reorderedAt } from "./utils/updated-array";
import { updatedWithPath } from "./utils/updated-object";

type GetLocationFormProps = <Schema extends Record<string, unknown>, FormError>(
  metadata: FormMetadata<Schema, FormError>,
  options?: Parameters<typeof getFormProps>[1],
) => ReturnType<typeof getFormProps> & {
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
>) {
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

  const formRef = useRef<FormMetadata | null>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!locationKey) return;
    if (!formRef.current) {
      throw new Error(
        "`formRef.current` is null. You need to pass `form` to `getLocationFormProps`.",
      );
    }
    const values = getLocationState();
    if (values) {
      queueMicrotask(() => {
        Object.entries(values).forEach(([name, value]) =>
          formRef.current!.update({ name, value: value! }),
        );
      });
    }
  }, [locationKey, formId, getLocationState]);

  const getLocationFormProps = useCallback(
    (form, option?) => {
      formRef.current = form as FormMetadata;
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
            updatedWithPath(prevState, e.target.name, updateValue),
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
                const { name } = v.parse(ResetIntentValue, payload);
                const prevState =
                  getLocationState() ?? ({} as DeepPartial<Schema>);
                const nextState = name
                  ? updatedWithPath(prevState, name, undefined)
                  : undefined;
                setLocationState(nextState);
                break;
              }
              case "update": {
                const { name, value } = v.parse(UpdateIntentValue, payload);
                const prevState =
                  getLocationState() ?? ({} as DeepPartial<Schema>);
                const nextState = updatedWithPath(prevState, name, value);
                setLocationState(nextState);
                break;
              }
              case "insert": {
                const { name, index, defaultValue } = v.parse(
                  InsertIntentValue,
                  payload,
                );
                const prevState =
                  getLocationState() ?? ({} as DeepPartial<Schema>);
                const nextState = updatedWithPath(
                  prevState,
                  name,
                  (prevArray: unknown[] = new Array(index ?? 0).fill({})) => {
                    const insertionIndex = index ?? prevArray.length;
                    return insertedAt(
                      prevArray,
                      insertionIndex,
                      defaultValue ?? {},
                    );
                  },
                );
                setLocationState(nextState);
                break;
              }
              case "remove": {
                const { name, index } = v.parse(RemoveIntentValue, payload);
                const prevState =
                  getLocationState() ?? ({} as DeepPartial<Schema>);
                const nextState = updatedWithPath(
                  prevState,
                  name,
                  (prevArray: unknown[]) => removedAt(prevArray, index),
                );
                setLocationState(nextState);
                break;
              }
              case "reorder": {
                const { name, from, to } = v.parse(ReorderIntentValue, payload);
                const prevState =
                  getLocationState() ?? ({} as DeepPartial<Schema>);
                const nextState = updatedWithPath(
                  prevState,
                  name,
                  (prevArray: unknown[]) => reorderedAt(prevArray, from, to),
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
  ) satisfies GetLocationFormProps;

  return [{ id: formId }, getLocationFormProps] as const;
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
