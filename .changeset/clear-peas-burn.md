---
"@location-state/core": patch
---

Prevent React warnings when using `useLocationKey()` with the Next.js App Router. Resolve `useInsertionEffect` errors in `next dev` by applying a `queueMicrotask` workaround.
