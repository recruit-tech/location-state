# @location-state/core

## 1.3.0

### Minor Changes

- 9e87052: Add constructor overloads to `StorageStore`.

  The constructor now supports two formats:

  - Recommended format:

    - `new StorageStore()` - uses `sessionStorage` by default
    - `new StorageStore({ storage?, stateSerializer? })` - options object pattern

  - Legacy format (maintained for backward compatibility):
    - `new StorageStore(storage, stateSerializer?)`

  Existing code will continue to work without any changes.

- 196698d: Fixed an issue where state was being discarded even when the user attempted to save it using `useEffect` on initial render.
- 12faec0: Add `maxKeys` option to StorageStore constructor to limit stored location keys. When the limit is exceeded, oldest keys are automatically removed using LRU strategy. Use the options format for configuration.

  // Note: The `maxKeys` option is only supported in the recommended options format, not in the legacy constructor format.

  ```ts
  // Recommended format only support
  const store = new StorageStore({ maxKeys: 10 });
  ```

- bb35a14: Added `useLocationGetKey()` hook for getting the current location key without re-rendering.

  Deprecated arguments for `useLocationKey()` hook.

- 07e545e: Add `storeName` in StorageStore's parameter to customize the name used for storage keys.
- 9e605ad: Adjusted it so that location-state's `useEffect` is executed before children's `useEffect`. This resolves race condition issues and achieves more stable state synchronization.

### Patch Changes

- 5c6edfe: Prevent React warnings when using `useLocationKey()` with the Next.js App Router. Resolve `useInsertionEffect` errors in `next dev` by applying a `queueMicrotask` workaround.

## 1.2.2

### Patch Changes

- b6cd496: Fix @location-state/conform types: strict check.

## 1.2.1

## 1.2.0

### Minor Changes

- 518d0ae: Throttle URL updates in `URLStore`.

## 1.1.0

### Minor Changes

- b69c437: Add support `InMemoryStore`.
- 0bad20c: Added `useLocationGetState`/`useLocationKey` to `@location-state/core`.

## 1.0.1

### Patch Changes

- 7e061fc: Initial release.
