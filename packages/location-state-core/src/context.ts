import { createContext } from "react";
import type { Store } from "./stores";

export const LocationStateContext = createContext<{
  stores: Record<string, Store>;
}>({ stores: {} });
