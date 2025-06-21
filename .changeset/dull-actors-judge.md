---
"@location-state/core": minor
---

Add constructor overload to `StorageStore`.

`StorageStore` constructor now supports both traditional parameters and options object pattern:

- `new StorageStore(storage?, stateSerializer?)`
- `new StorageStore({ storage?, stateSerializer? })`

Backward compatible with existing code.
