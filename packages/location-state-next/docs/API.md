# API

- [Syncer hooks](#Syncer-hooks)
  - [function `useNextPagesSyncer`](#function-useNextPagesSyncer)
- [Syncer](#Syncer)
  - [class `NextPagesSyncer`](#class-NextPagesSyncer)

## Syncer hooks

Syncer hooks are provided [`syncer`](/packages/location-state-core/docs/API.md#Syncer).

### function `useNextPagesSyncer`

```ts
declare function useNextPagesSyncer(): NextPagesSyncer;
```

Provides a [`NextPagesSyncer`](#class-NextPagesSyncer) instance. This hook is used in Next.js Pages Router to sync the location state.

#### Returns

Returns a `NextPagesSyncer` instance.

#### Example

```tsx
const syncer = useNextPagesSyncer();
```

## Syncer

### class `NextPagesSyncer`

```ts
declare class NextPagesSyncer implements Syncer {
  constructor(router: NextRouter);
  key(): string | undefined;
  sync({ listener, signal, }: {
    listener: (key: string) => void;
    signal: AbortSignal;
  }): void;
  notify(): void;
  updateURL(url: string): void;
}
```

`NextPagesSyncer` is a [`syncer`](/packages/location-state-core/docs/API.md#Syncer) for Next.js Pages Router.

### Parameters

- `router`: Next.js [router](https://nextjs.org/docs/pages/api-reference/functions/use-router#router-object) instance.

### Example

```tsx
function App() {
  const router = useRouter();
  // Create a NextPagesSyncer instance with same router instance.
  const [syncer] = useState(() => new NextPagesSyncer(router));

  // ...snip...
}
```
