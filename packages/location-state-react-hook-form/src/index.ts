import { useLocationGetState, useLocationSetState } from "@location-state/core";
import { LocationStateDefinition } from "@location-state/core";
import { DefaultStoreName } from "@location-state/core";
import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";

type LocationForm = {
  handleChange: (
    onChange?: (event: React.ChangeEvent<HTMLFormElement>) => void,
  ) => (event: React.ChangeEvent<HTMLFormElement>) => void;
};

export function useLocationForm<T extends Record<string, unknown>>({
  name,
  reset,
  getValues,
  storeName = "session",
}: Pick<UseFormReturn<T>, "reset" | "getValues"> & {
  name: string;
  storeName?: DefaultStoreName;
}): LocationForm {
  const definition: LocationStateDefinition<T> = {
    name,
    defaultValue: getValues(),
    storeName,
  };
  const getState = useLocationGetState(definition);
  const setState = useLocationSetState(definition);

  useEffect(() => {
    queueMicrotask(() => {
      reset(getState());
    });
  }, [reset, getState]);

  const handleChange =
    (onChange?: (event: React.ChangeEvent<HTMLFormElement>) => void) =>
    (event: React.ChangeEvent<HTMLFormElement>) => {
      onChange?.(event);
      setState(getValues());
    };

  return { handleChange };
}
