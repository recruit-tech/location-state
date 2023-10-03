# API

- [State hooks](#State-hooks)
  - [type `LocationStateDefinition`](#type-LocationStateDefinition)
  - [`useLocationState`](#uselocationstate)
  - [`useLocationStateValue`](#uselocationstatevalue)
  - [`useLocationStateSetter`](#uselocationstatesetter)
- [Provider](#provider)
  - [`<LocationStateProvider>`](#Locationstateprovider)
  - [`createDefaultStores`](#createdefaultstores)
- [Syncer](#syncer)
  - [`NavigationSyncer`](#navigationsyncer)
- [Store](#store)
  - [type `Stores`](#type-stores)
  - [`StorageStore`](#storagestore)
  - [`URLStore`](#urlstore)
  - [custom `Store`](#custom-store)
  - [`getHooksWith`](#gethookswith)

## State hooks

State hooks は [`<LocationStateProvider>`](#Locationstateprovider) の子孫コンポーネントでのみ利用可能です。

### type `LocationStateDefinition`

hooks の共通オプションは`LocationStateDefinition`として、以下のように定義されています。

```ts
type LocationStateDefinition<
  T,
  StoreName extends string = "session" | "url",
> = {
  name: string;
  defaultValue: T;
  storeName: StoreName;
  refine?: Refine<T>;
};
```

#### Parameters

- `name`: state を一意に判別する名前
- `defaultValue`: state のデフォルト値
- `storeName`: state の保存先。`session`と`url`の 2 つが利用可能（カスタマイズ可能）
- `refine?`: state 復元時に検証・変換する関数。[Refine](#type-refine)を参照

#### Example

```ts
const counter: LocationStateDefinition<number> = {
  name: "count",
  defaultValue: 0,
  storeName: "session",
};
const [count, setCount] = useLocationValue(counter);
```

### type `Refine`

値を復元する時に検証・変換を行う関数です。`undefined`を返すとデフォルト値となります。

```ts
type Refine<T> = (value: unknown) => T | undefined;
```

#### Parameters

- `value`: 復元を試みる値

#### Example

```ts
const zodRefine =
  <T extends unknown>(schema: ZodType<T>): Refine<T> =>
  (value) => {
    const result = schema.safeParse(value);
    return result.success ? result.data : undefined;
  };

const [counter, setCounter] = useLocationState({
  name: "counter",
  defaultValue: 0,
  storeName,
  refine: zodRefine(z.number()),
});
```

### `useLocationState`

オプションを指定して`useLocationState`を呼び出すことで、`useState`同様 state と setter を返します。

```ts
declare const useLocationState: <T>(
  definition: LocationStateDefinition<T, DefaultStoreName>,
) => [T, SetState<T>];
```

#### Parameters

- `definition`: [`LocationStateDefinition`](#type-locationstatedefinition)を参照

#### Returns

state と state の更新関数を返します。

#### Example

```ts
const [state, setState] = useLocationState(locationStateDefinition);
```

### `useLocationStateValue`

基本的な使い化方は`useLocationState`と同じですが、state のみを返す点が異なります。外側に`LocationStateDefinition`を定義して利用することが可能です。

```ts
declare const useLocationStateValue: <T>(
  definition: LocationStateDefinition<T, DefaultStoreName>,
) => T;
```

#### Parameters

- `definition`: [`LocationStateDefinition`](#type-locationstatedefinition)を参照

#### Returns

state を返します。

#### Example

```ts
const count = useLocationStateValue(locationStateDefinition);
```

### `useLocationStateSetter`

基本的な使い化方は`useLocationState`と同じですが、setter のみを返す点が異なります。外側に`LocationStateDefinition`を定義して利用することが可能です。

```ts
declare const useLocationSetState: <T>(
  definition: LocationStateDefinition<T, DefaultStoreName>,
) => SetState<T>;
```

#### Parameters

- `definition`: [`LocationStateDefinition`](#type-locationstatedefinition)を参照

#### Returns

state の更新関数を返します。

#### Example

```ts
const setCount = useLocationStateSetter(locationStateDefinition);
```

## Provider

### `<LocationStateProvider>`

`LocationStateProvider`は`location-state`が提供するデフォルトの Provider です。

```ts
declare function LocationStateProvider({
  children,
  ...props
}: {
  syncer?: Syncer;
  stores?: Stores | CreateStores;
  children: ReactNode;
}): JSX.Element;
```

#### Props

- `syncer?`: 履歴と同期する[`Syncer`](#syncer)です。
- `stores?`: state 永続先として指定できる[`Stores`](#type-stores)です。

#### Example

```tsx
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocationStateProvider syncer={syncer} stores={stores}>
      {children}
    </LocationStateProvider>
  );
}
```

### `createDefaultStores`

`<LocationStateProvider>`がデフォルトで利用する[`Stores`](#type-stores)を作成します。`session`と`url`の 2 つの[`Store`](#store)を持ち、`session`は SessionStorage、`url`は URL のクエリパラメータに state を永続化します。

```ts
export declare const createDefaultStores: (syncer: Syncer) => Stores;
```

#### Parameters

- `syncer?`: `location-state`が履歴と同期する方法を指定します。[`Syncer`](#syncer)を実装している必要があります。

#### Returns

`session`と`url`をプロパティに持った [`Stores`](#type-stores)を返します。

#### Example

```ts
const defaultStores = createDefaultStores(syncer);
```

## Syncer

`Syncer`は履歴と同期するためのインターフェースです。`Syncer`を実装することで、履歴と同期する方法をカスタマイズすることができます。

```ts
type Syncer = {
  key(): string | undefined;
  sync(arg: { listener: (key: string) => void; signal: AbortSignal }): void;
  updateURL(url: string): void;
};
```

### `NavigationSyncer`

`NavigationSyncer`は[Navigation API](https://github.com/WICG/navigation-api)を利用して履歴と同期する`Syncer`です。`NavigationSyncer`のコンストラクタには`window.navigation`相当の API を渡す必要があります。

```ts
export declare class NavigationSyncer implements Syncer {
  constructor(navigation?: Navigation | undefined);
}
```

#### Parameters

- `navigation?`: `window.navigation`、もしくは[Navigation API](https://github.com/WICG/navigation-api)の polyfill を渡してください。

#### Example

```tsx
const navigationSyncer = new NavigationSyncer(window?.navigation);
```

#### `unsafeNavigation`

Navigation API をサポートしていないブラウザのために、`unsafeNavigation`という API を提供しています。これは Navigation API の挙動を部分的にサポートした polyfill 的なものですが、実装範囲は必要最小限でライブラリとして**積極的なテスト・サポートをしているわけではありません**。

```tsx
import { unsafeNavigation } from "@location-state/core/unsafe-navigation";

const navigationSyncer = new NavigationSyncer(unsafeNavigation);
```

## Store

`Store`は`location-state`の state 保存先のインターフェースです。`Store`を実装することで、state 保存先をカスタマイズすることができます。

```ts
type Store = {
  subscribe(name: string, listener: Listener): () => void;
  get(name: string): unknown;
  set(name: string, value: unknown): void;
  load(key: string): void;
  save(): void;
};
```

### type `Stores`

`Stores`は`Store`の key-value object です。

```ts
export type Stores = Record<string, Store>;
```

### `StorageStore`

TBW

### `URLStore`

TBW

### `getHooksWith`

`useLocationState`の`storeName`を型引数で指定し、カスタムフックを作成することができます。任意の Store を実装したい場合に便利です。

```ts
export const { useLocationState, useLocationStateValue, useLocationSetState } =
  getHooksWith<"local" | "indexeddb">();
```
