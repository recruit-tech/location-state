# API

- [Syncer hooks](#Syncer-hooks)
  - [function `useNextPagesSyncer`](#function-useNextPagesSyncer)

## Syncer hooks

Syncer hooks are provided [`syncer`](/packages/location-state-core/docs/API.md#Syncer).

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
