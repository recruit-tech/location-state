---
"@location-state/core": minor
---

Split `<LocationStateProvider>` into two components and adjusted it so that location-state's `useEffect` is executed before children's `useEffect`. This resolves race condition issues and achieves more stable state synchronization.
