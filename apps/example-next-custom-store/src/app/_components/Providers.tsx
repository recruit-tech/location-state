"use client";

import {
  createDefaultStores,
  LocationStateProvider,
  StorageStore,
  URLStore,
} from "@location-state/core";
import qs from "qs";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocationStateProvider
      stores={(syncer) => ({
        ...createDefaultStores(syncer),
        // override the url store
        url: new URLStore(syncer, {
          encode: encodeUrlState,
          decode: decodeUrlState,
        }),
        // add a session store with maxKeys limit of 3 (using new options format)
        session: new StorageStore({
          maxKeys: 3,
        }),
      })}
    >
      {children}
    </LocationStateProvider>
  );
}

function encodeUrlState(url: string, state?: Record<string, unknown>) {
  const prevURL = new URL(url);
  if (state) {
    const href = prevURL.href.replace(/\?.*/, "");
    const newUrl = new URL(`${href}?${qs.stringify(state)}`);
    return newUrl.toString();
  }
  return prevURL.toString();
}

function decodeUrlState(url: string): Record<string, unknown> {
  const currentURL = new URL(url);
  return qs.parse(currentURL.search.replace(/^\?/, ""), {
    // see: https://github.com/ljharb/qs/issues/91#issuecomment-348481496
    decoder(value) {
      if (/^(\d+|\d*\.\d+)$/.test(value)) {
        return Number.parseFloat(value);
      }

      const keywords = {
        true: true,
        false: false,
        null: null,
        undefined: undefined,
      };
      if (value in keywords) {
        // @ts-ignore
        return keywords[value];
      }

      return value;
    },
  });
}
