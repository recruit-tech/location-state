import { Store } from "./stores";
import { createContext } from "react";

export const LocationStateContext = createContext<{
  stores: Record<string, Store>;
}>({ stores: {} });
