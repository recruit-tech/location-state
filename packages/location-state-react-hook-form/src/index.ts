import {
  useLocationState,
  LocationStateDefinition,
} from "@location-state/core";
import { useEffect, useRef } from "react";
import { DefaultValues, useForm } from "react-hook-form";
import { FieldValues } from "react-hook-form";

function shallowEqual<T extends Record<string, unknown>>(a: T, b: T) {
  if (a === b) {
    return true;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return false;
  }
  return keysA.every((key) => a[key] === b[key]);
}

export function useFromSync<TFieldValues extends FieldValues = FieldValues>({
  ...definition
}: LocationStateDefinition<TFieldValues>) {
  const resetCalled = useRef(false);
  // fixme: change rendering
  const [state, setState] = useLocationState({
    ...definition,
  });
  const { getValues, reset, ...form } = useForm({
    // fixme: remove type cast
    defaultValues: state as DefaultValues<TFieldValues>,
  });

  useEffect(() => {
    if (shallowEqual(state, definition.defaultValue) || resetCalled.current) {
      return;
    }
    reset(state);
    resetCalled.current = true;
  }, [state, definition, reset]);

  return {
    ...form,
    reset,
    onFormChange: () => {
      setState(getValues());
    },
  };
}
