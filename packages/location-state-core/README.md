# @location-state/core

`@location-state/core` provides the features to save and restore state based on a specified `syncer`.

## Installation

```bash
npm install @location-state/core
# or
yarn add @location-state/core
# or
pnpm add @location-state/core
```

## Usage

Specify the syncer props in Provider that based on the navigation API.

```tsx
import { LocationStateProvider, NavigationSyncer } from "@location-state/core";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocationStateProvider syncer={new NavigationSyncer(window.navigation)}>
      {children}
    </LocationStateProvider>
  );
}
```

> [!WARNING]
> Please note that the navigation API is not yet supported by some browsers as of 2023.
> If you want, you can use `import { unsafeNavigation } from "@location-state/core/unsafe-navigation";` at your own risk.
> However, this is not a perfect complement to the Navigation API.

If you are using Next.js pages router, use [@location-state/next](../location-state-next/README.md).

### Session storage persistence

You can store history-based information in session storage by specifying `store: 'session'`, name, and default value in hooks.

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

### URL persistence

You can store history-based information in session storage by specifying `store: 'url'`, name, and default value in hooks.

```tsx
import { useLocationState, StoreName } from "@location-state/core";

export function Counter({ storeName }: { storeName: StoreName }) {
  const [counter, setCounter] = useLocationState({
    name: "counter",
    defaultValue: 0,
    storeName: "url",
  });

  return <>...</>;
}
```

## API

### <LocationStateProvider>

Provider to store the state based on the history. synchronization implementation with the history can be specified in the [syncer](#syncer).

```ts
function LocationStateProvider(props: {
  syncer?: Syncer;
  children: ReactNode;
}): ReactNode;
```

### Syncer

Synchronization interface with history.

```ts
type Syncer = {
  key(): string | undefined;
  sync(arg: { listener: (key: string) => void; signal: AbortSignal }): void;
  updateURL(url: string): void;
};
```

#### NavigationSyncer

Syncer to synchronize with history using NavigationAPI.

```ts
class NavigationSyncer implements Syncer {
  constructor(navigation: Navigation);
  key(): string | undefined;
  sync(arg: { listener: (key: string) => void; signal: AbortSignal }): void;
  updateURL(url: string): void;
}
```

### useLocationState

State hooks to synchronize with history through Syncer.

```ts
type StoreName = "session" | "url";

const useLocationState = <T>(props: {
  name: string;
  defaultValue: T;
  storeName: StoreName | string;
}): [T, (value: T) => void];
```
