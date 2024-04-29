# `@location-state/core`

[![npm version](https://badge.fury.io/js/@location-state%2Fcore.svg)](https://badge.fury.io/js/@location-state%2Fcore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

State management library for React that synchronizes with history location supporting Next.js App Router.

## Features

- Manage the state to synchronize with the history location.
- By default, supports Session Storage and URL as persistent destinations.

## Packages

- [@location-state/core](/packages/location-state-core/README.md): Framework agnostic, but for Next.js App Router.
- [@location-state/next](/packages/location-state-next/README.md): For Next.js Pages Router.

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
```

```tsx
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

## API

View the API reference [here](./docs/API.md).
