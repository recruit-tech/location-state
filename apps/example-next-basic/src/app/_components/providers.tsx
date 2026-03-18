"use client";

import { LocationStateProvider } from "@location-state/core";
import { useNextAppSyncer } from "@location-state/next";

export function Providers({ children }: { children: React.ReactNode }) {
  const syncer = useNextAppSyncer();
  return (
    <LocationStateProvider syncer={syncer}>{children}</LocationStateProvider>
  );
}
