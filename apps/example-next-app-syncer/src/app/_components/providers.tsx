"use client";

import { LocationStateProvider } from "@location-state/core";
import { unsafeNavigation } from "@location-state/core/unsafe-navigation";
import { useNextAppSyncer } from "@location-state/next";

export function Providers({ children }: { children: React.ReactNode }) {
  const syncer = useNextAppSyncer({ navigation: unsafeNavigation });
  return (
    <LocationStateProvider syncer={syncer}>{children}</LocationStateProvider>
  );
}
