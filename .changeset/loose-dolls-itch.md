---
"@location-state/core": minor
---

Add `maxSize` option to StorageStore constructor to limit stored location keys. When the limit is exceeded, oldest keys are automatically removed using LRU strategy. Use the options format for configuration.

```ts
// Legacy format (still supported)
const store = new StorageStore(sessionStorage, customSerializer);

// Recommended options format
const store = new StorageStore(sessionStorage, { maxSize: 10 });
```
