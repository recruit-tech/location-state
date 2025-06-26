---
"@location-state/core": minor
---

Add constructor overloads to `StorageStore`.

The constructor now supports two formats:

- Recommended format:
  - `new StorageStore()` - uses `sessionStorage` by default
  - `new StorageStore({ storage?, stateSerializer? })` - options object pattern

- Legacy format (maintained for backward compatibility):
  - `new StorageStore(storage, stateSerializer?)`

Existing code will continue to work without any changes.
