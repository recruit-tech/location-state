"use client";

import { LocationStateProvider } from "@location-state/core";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <LocationStateProvider>{children}</LocationStateProvider>;
}
