/// <reference types="navigation-api-types" />
import type { Syncer } from "@location-state/core";
import { Router, useRouter } from "next/router.js";
import React from "react";
import { NextAppSyncer } from "./next-app-syncer";
import { NextPagesSyncer } from "./next-pages-syncer";

export function useNextAppSyncer(options?: {
  navigation?: Navigation;
}): Syncer {
  const [syncer] = React.useState(
    () =>
      new NextAppSyncer(
        options?.navigation ??
          (typeof window !== "undefined" ? window.navigation : undefined),
      ),
  );
  return syncer;
}

export function useNextPagesSyncer(): Syncer {
  const router = useRouter();
  const [syncer] = React.useState(() => new NextPagesSyncer(router));
  const needNotify = React.useRef(false);
  if (needNotify.current) {
    syncer.notify();
    needNotify.current = false;
  }

  React.useEffect(() => {
    const routeChangeHandler = () => {
      needNotify.current = true;
    };
    Router.events.on("routeChangeStart", routeChangeHandler);
    return () => Router.events.off("routeChangeStart", routeChangeHandler);
  }, []);

  return syncer;
}
