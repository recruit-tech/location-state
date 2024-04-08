import { createContext } from "react";
import type { Store } from "./stores";
import type { Syncer } from "./types";

export const LocationStateContext = createContext<{
  stores: Record<string, Store>;
  syncer?: Syncer;
}>({
  stores: {},
});
