"use client";

import { LocationStateProvider } from "@location-state/core";
import { useNextAppSyncer } from "@location-state/next";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const syncer = useNextAppSyncer();
  return (
    <LocationStateProvider syncer={syncer}>{children}</LocationStateProvider>
  );
}
