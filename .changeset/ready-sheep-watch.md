---
"@location-state/core": minor
---

Adjusted it so that location-state's `useEffect` is executed before children's `useEffect`. This resolves race condition issues and achieves more stable state synchronization.
