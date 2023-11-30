"use client";

import { LocationStateProvider, NavigationSyncer } from "@location-state/core";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocationStateProvider
      syncer={
        new NavigationSyncer(
          typeof window !== "undefined" ? window.navigation : undefined,
        )
      }
    >
      {children}
    </LocationStateProvider>
  );
}
