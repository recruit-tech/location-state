# `@location-state/next`

[![npm version](https://badge.fury.io/js/@location-state%2Fnext.svg)](https://badge.fury.io/js/@location-state%2Fnext)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

State management library for React that synchronizes with history location supporting Next.js Pages Router and App Router.

## Features

- Manage the state to synchronize with the history location.
- By default, supports Session Storage and URL as persistent destinations.
- Supports both Next.js Pages Router and App Router.

## Packages

- [@location-state/core](/packages/location-state-core/README.md): Framework agnostic, but for Next.js App Router.
- [@location-state/next](/packages/location-state-next/README.md): For Next.js Pages Router and App Router.

## Quickstart for Next.js [App Router](https://nextjs.org/docs/app)

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
// src/app/Providers.tsx
"use client";

import { LocationStateProvider } from "@location-state/core";
import { useNextAppSyncer } from "@location-state/next";

export function Providers({ children }: { children: React.ReactNode }) {
  const syncer = useNextAppSyncer();
  return (
    <LocationStateProvider syncer={syncer}>
      {children}
    </LocationStateProvider>
  );
}
```

`useNextAppSyncer` strips `__NA` and `__N` from `history.state` before calling `replaceState()`, preventing Next.js from treating URL updates as internal navigation.

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
      <p>counter: <b>{counter}</b></p>
      <button onClick={() => setCounter(counter + 1)}>increment</button>
    </div>
  );
}
```

## Quickstart for Next.js [Pages Router](https://nextjs.org/docs/pages)

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
      <p>counter: <b>{counter}</b></p>
      <button onClick={() => setCounter(counter + 1)}>increment</button>
    </div>
  );
}
```

## API

View the API reference [here](./docs/API.md).
