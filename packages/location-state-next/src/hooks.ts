import type { Syncer } from "@location-state/core";
import { Router, useRouter } from "next/router.js";
import React from "react";
import { NextPagesSyncer } from "./next-pages-syncer";

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
