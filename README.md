# location-state

[![npm version](https://badge.fury.io/js/@location-state%2Fcore.svg)](https://badge.fury.io/js/@location-state%2Fcore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight state management library that saves and restores state based on history.

## Features

- 履歴位置に連動する状態管理を行うことができます。
- デフォルトでは、保存先に Session Storage/URL を指定できます。

## Packages

- [@location-state/core](./packages/location-state-core/README.md): Framework agnostic, but for Next.js App Router.
- [@location-state/next](./packages/location-state-next/README.md): For Next.js Pages Router.

## Quickstart for Next.js [App Router](https://nextjs.org/docs/app)

### Installation

```sh
npm install @location-state/core
# or
yarn add @location-state/core
# or
pnpm add @location-state/core
```

### Configuration

```tsx
// src/app/Providers.tsx
"use client";

import { LocationStateProvider } from "@location-state/core";

export function Providers({ children }: { children: React.ReactNode }) {
  return <LocationStateProvider>{children}</LocationStateProvider>;
}

// src/app/layout.tsx
import { Providers } from "./Providers";

// ...snip...

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Working with state

```tsx
"use client";

import { useLocationState } from "@location-state/core";

export function Counter() {
  const [counter, setCounter] = useLocationState({
    name: "counter",
    defaultValue: 0,
    storeName: "session",
  });

  return (
    <div>
      <p>
        storeName: <b>{storeName}</b>, counter: <b>{counter}</b>
      </p>
      <button onClick={() => setCounter(counter + 1)}>increment</button>
    </div>
  );
}
```

## Quickstart for [Page Router](https://nextjs.org/docs/pages)

### Installation

```sh
npm install @location-state/core @location-state/next
# or
yarn add @location-state/core @location-state/next
# or
pnpm add @location-state/core @location-state/next
```

### Configuration

```tsx
// src/pages/_app.tsx
import { LocationStateProvider } from "@location-state/core";
import { useNextPagesSyncer } from "@location-state/next";
import type { AppProps } from "next/app";

export default function MyApp({ Component, pageProps }: AppProps) {
  const syncer = useNextPagesSyncer();
  return (
    <LocationStateProvider syncer={syncer}>
      <Component {...pageProps} />
    </LocationStateProvider>
  );
}
```

### Working with state

```tsx
import { useLocationState } from "@location-state/core";

export function Counter() {
  const [counter, setCounter] = useLocationState({
    name: "counter",
    defaultValue: 0,
    storeName: "session",
  });

  return (
    <div>
      <p>
        storeName: <b>{storeName}</b>, counter: <b>{counter}</b>
      </p>
      <button onClick={() => setCounter(counter + 1)}>increment</button>
    </div>
  );
}
```
