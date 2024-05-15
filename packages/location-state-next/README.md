# `@location-state/next`

[![npm version](https://badge.fury.io/js/@location-state%2Fnext.svg)](https://badge.fury.io/js/@location-state%2Fnext)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

State management library for React that synchronizes with history location supporting Next.js Pages Router.

## Features

- Manage the state to synchronize with the history location.
- By default, supports Session Storage and URL as persistent destinations.

## Packages

- [@location-state/core](/packages/location-state-core/README.md): Framework agnostic, but for Next.js App Router.
- [@location-state/next](/packages/location-state-next/README.md): For Next.js Pages Router.

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
