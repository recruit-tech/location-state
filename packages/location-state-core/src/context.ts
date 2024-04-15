import { createContext } from "react";
import type { Store } from "./stores";
import type { Syncer } from "./types";

export const LocationStateContext = createContext<{
  syncer?: Syncer;
  stores: Record<string, Store>;
}>({
  stores: {},
});
