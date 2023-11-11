import {
  LocationStateDefinition,
  useLocationSetState,
  useLocationStateSnapshot,
} from "@location-state/core";
import { useEffect, useRef, useState } from "react";
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

export function useFromSync<TFieldValues extends FieldValues = FieldValues>(
  definition: LocationStateDefinition<TFieldValues>,
) {
  const resetCalled = useRef(false);
  const setState = useLocationSetState(definition);
  const snapshot = useLocationStateSnapshot(definition);
  const [defaultValues] = useState(() => snapshot.get());
  const { getValues, reset, ...form } = useForm({
    // fixme: remove type cast
    defaultValues: defaultValues as DefaultValues<TFieldValues>,
  });

  const currentState = snapshot.get();
  useEffect(() => {
    if (
      shallowEqual(currentState, definition.defaultValue) ||
      resetCalled.current
    ) {
      return;
    }
    // reset once
    reset(currentState);
    resetCalled.current = true;
  }, [definition, reset, currentState]);

  return {
    ...form,
    reset,
    onFormChange: () => {
      setState(getValues());
    },
  };
}
