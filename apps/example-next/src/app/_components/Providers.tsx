"use client";

import { LocationStateProvider, NavigationSyncer } from "@location-state/core";
import unsafeNavigation from "@location-state/unsafe-navigation";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocationStateProvider syncer={new NavigationSyncer(unsafeNavigation)}>
      {children}
    </LocationStateProvider>
  );
}
