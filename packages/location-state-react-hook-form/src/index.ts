import {
  useLocationState,
  LocationStateDefinition,
} from "@location-state/core";
import { DefaultValues, useForm } from "react-hook-form";
import { FieldValues } from "react-hook-form";

export function useFromSync<TFieldValues extends FieldValues = FieldValues>({
  ...definition
}: LocationStateDefinition<TFieldValues>) {
  // fixme: change rendering
  const [state, setState] = useLocationState({
    ...definition,
  });
  const { getValues, ...form } = useForm({
    // fixme: remove type cast
    defaultValues: state as DefaultValues<TFieldValues>,
  });
  console.log(">>> state", state);

  return {
    ...form,
    onFormChange: () => {
      setState(getValues());
    },
  };
}
