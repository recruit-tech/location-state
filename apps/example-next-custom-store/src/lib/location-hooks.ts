import { getHooksWith } from "@location-state/core";

export const { useLocationState: useLocationStateInMemory } =
  getHooksWith<"in-memory">();
