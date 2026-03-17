"use client";

import { LocationStateProvider } from "@location-state/core";
import { unsafeNavigation } from "@location-state/core/unsafe-navigation";
import { useNextAppSyncer } from "@location-state/next";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const syncer = useNextAppSyncer({ navigation: unsafeNavigation });
  return (
    <LocationStateProvider syncer={syncer}>{children}</LocationStateProvider>
  );
}
