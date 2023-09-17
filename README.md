# location-state

A lightweight state management library that saves and restores state based on history.

## Features

- 履歴に基づいて状態を復元します。
  - 状態の保存先
    - 保存先に Session Storage/URL を指定できます。
    - 保存先をカスタム実装することができます。
  - 履歴変更のトリガー
    - Navigation API を利用した遷移イベントでの保存をサポートしています。
    - Next.js Pages Router の変更イベントを利用した遷移イベントでの保存をサポートしています。
    - 履歴変更のトリガーをカスタム実装することができます。
- 状態復元時に validation を実行できます。

## Packages

- [@location-state/core](./packages/location-state-core/README.md): Core library
- [@location-state/next](./packages/location-state-next/README.md): Next.js integration

## Quickstart on [Next.js](https://nextjs.org/docs)

ここでは、App Router と Pages Router で Next.js を使用する方法をそれぞれ簡単に説明します。

### Quickstart for [App Router](https://nextjs.org/docs/app)

#### Installation

```sh
npm install @location-state/core
# or
yarn add @location-state/core
# or
pnpm add @location-state/core
```

#### Configuration

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

#### Usage

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

### Quickstart for [Page Router](https://nextjs.org/docs/pages)

#### Installation

```sh
npm install @location-state/core @location-state/next
# or
yarn add @location-state/core @location-state/next
# or
pnpm add @location-state/core @location-state/next
```

#### Configuration

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

#### Usage

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
