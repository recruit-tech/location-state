import type { UseFormReturn } from "react-hook-form";

type LocationForm = {
  handleChange: (
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void,
  ) => () => void;
};

export function useLocationForm<T extends Record<string, unknown>>({
  name,
  reset,
  getValues,
}: Pick<UseFormReturn<T>, "reset" | "getValues"> & {
  name: string;
}): LocationForm {
  return {
    handleChange: (onChange) => () => {
      // todo: implement
      console.log("handleChange", {
        name,
        onChange,
        reset,
        getValues,
      });
    },
  };
}
