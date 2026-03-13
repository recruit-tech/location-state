# API

- [Syncer hooks](#Syncer-hooks)
  - [function `useNextAppSyncer`](#function-useNextAppSyncer)
  - [function `useNextPagesSyncer`](#function-useNextPagesSyncer)

## Syncer hooks

Syncer hooks provide a [`Syncer`](/packages/location-state-core/docs/API.md#Syncer).

### function `useNextAppSyncer`

```ts
declare function useNextAppSyncer(options?: {
  navigation?: Navigation;
}): Syncer;
```

Provides a [`Syncer`](/packages/location-state-core/docs/API.md#Syncer) instance for Next.js App Router. This syncer uses the Navigation API for detecting navigation events and strips `__NA` and `__N` from `history.state` before calling `replaceState()` to prevent Next.js from treating URL updates as internal navigation.

#### Parameters

- `options.navigation` (optional): Custom `Navigation` instance to use. When omitted, uses `window.navigation` when available. Useful for passing `unsafeNavigation` from `@location-state/core/unsafe-navigation` in environments where the Navigation API is not natively supported.

#### Returns

Returns a `Syncer` instance.

#### Example

```tsx
// Default: uses window.navigation
const syncer = useNextAppSyncer();

// With custom navigation (e.g. unsafeNavigation for older browsers)
import { unsafeNavigation } from "@location-state/core/unsafe-navigation";

const syncer = useNextAppSyncer({ navigation: unsafeNavigation });
```

### function `useNextPagesSyncer`

```ts
declare function useNextPagesSyncer(): Syncer;
```

Provides a [`Syncer`](/packages/location-state-core/docs/API.md#Syncer) instance. This hook is used in Next.js Pages Router to sync the location state.

#### Returns

Returns a `Syncer` instance.

#### Example

```tsx
const syncer = useNextPagesSyncer();
```
