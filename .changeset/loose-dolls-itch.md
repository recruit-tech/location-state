---
"@location-state/core": minor
---

Add `maxSize` option to StorageStore constructor to limit stored location keys. When the limit is exceeded, oldest keys are automatically removed using LRU strategy.

```ts
// Limit to 10 most recently used location keys
const store = new StorageStore(sessionStorage, undefined, 10);
```
