# @location-state/next

`@location-state/next` provides a syncer that synchronizes with the pages router in next.js.

## Installation

```bash
npm install @location-state/core @location-state/next
# or
yarn add @location-state/core @location-state/next
# or
pnpm add @location-state/core @location-state/next
```

## Usage

Specify provider's syncer that can be obtained with `useNextPagesSyncer()`.

```tsx
// _app.tsx
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

Same as normal usage.Read [@location-state/core](../location-state-core/README.md).

```tsx
import { useLocationState, StoreName } from "@location-state/core";

export function Counter({ storeName }: { storeName: StoreName }) {
  const [counter, setCounter] = useLocationState({
    name: "counter",
    defaultValue: 0,
    storeName: "session",
  });

  return <>...</>;
}
```

## API

### useNextPagesSyncer

Can get Syncer to sync with Next.js pages router.

```tsx
function useNextPagesSyncer(): NextPagesSyncer;
```
