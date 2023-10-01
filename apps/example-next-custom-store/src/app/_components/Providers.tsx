"use client";

import { InMemoryStore } from "@/lib/in-memory-store";
import { LocationStateProvider } from "@location-state/core";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocationStateProvider
      stores={() => ({
        "in-memory": new InMemoryStore(),
      })}
    >
      {children}
    </LocationStateProvider>
  );
}
