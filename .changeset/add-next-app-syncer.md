---
"@location-state/next": minor
---

Add `NextAppSyncer` and `useNextAppSyncer()` for Next.js App Router.
This syncer strips `__NA` and `__N` from `history.state` before calling
`replaceState()` to prevent Next.js from treating it as internal navigation.
