---
"@location-state/core": minor
---

Add `maxKeys` option to StorageStore constructor to limit stored location keys. When the limit is exceeded, oldest keys are automatically removed using LRU strategy. Use the options format for configuration.

// Note: The `maxKeys` option is only supported in the recommended options format, not in the legacy constructor format.


```ts
// Recommended format only support
const store = new StorageStore({ maxKeys: 10 });
```
