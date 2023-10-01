# API

- [State hooks](#State-hooks)
  - [type `LocationStateDefinition`](#type-LocationStateDefinition)
  - [`useLocationState`](#uselocationstate)
  - [`useLocationStateValue`](#uselocationstatevalue)
  - [`useLocationStateSetter`](#uselocationstatesetter)
  - [`getHooksWith`](#gethookswith)
- [Provider](#provider)
  - [`LocationStateProvider`](#locationstateprovider)
  - [`createDefaultStores`](#createdefaultstores)
- [Syncer](#syncer)
  - [`NavigationSyncer`](#navigationsyncer)
- [Store](#store)
  - [Store options](#store-options)
  - [`StorageStore`](#storagestore)
  - [`URLStore`](#urlstore)
  - [custom `Store`](#custom-store)

## State hooks

### type `LocationStateDefinition`

hooks の共通オプションは`LocationStateDefinition`として、以下のように定義されています。

```ts
type Refine<T> = (value: unknown) => T | undefined;
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

- `name`: state を一意に判別する名前
- `defaultValue`: state のデフォルト値
- `storeName`: state の保存先。`session`と`url`の 2 つが利用可能（カスタマイズ可能）
- `refine?`: state 復元時に検証・変換する関数。`undefined`を返すとデフォルト値となる

### `useLocationState`

オプションを指定して`useLocationState`を呼び出すことで、`useState`同様 state と setter を返します。

```ts
const [state, setState] = useLocationState(locationStateDefinition);
```

### `useLocationStateValue`

基本的な使い化方は`useLocationState`と同じですが、state のみを返す点が異なります。外側に`LocationStateDefinition`を定義して利用することが可能です。

```ts
const count = useLocationStateValue(locationStateDefinition);
```

### `useLocationStateSetter`

基本的な使い化方は`useLocationState`と同じですが、setter のみを返す点が異なります。外側に`LocationStateDefinition`を定義して利用することが可能です。

```ts
const setCount = useLocationStateSetter(locationStateDefinition);
```

## Provider

### `LocationStateProvider`

`LocationStateProvider`は`location-state`が提供するデフォルトの Provider です。`useLocationState`などの hooks を利用するためには必ず Provider でラップする必要があります。

```tsx
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocationStateProvider syncer={syncer} stores={stores}>
      {children}
    </LocationStateProvider>
  );
}
```

- `syncer?`: `location-state`が履歴と同期する方法を指定します。[`Syncer`](../src/types.ts)を実装している必要があります。
- `stores?`: `location-state`の state 保存先のレコードです。`storeName`で key を指定し、レコードの値は[`Store`](../src/stores/types.ts)を実装している必要があります。

### `createDefaultStores`

`location-state`がデフォルトで利用する`stores`を作成します。`session`と`url`の 2 つが作成されます。

```ts
const defaultStores = createDefaultStores(syncer);
```

## Syncer

`Syncer`は履歴と同期するためのインターフェースです。`Syncer`を実装することで、履歴と同期する方法をカスタマイズすることができます。

### `NavigationSyncer`

`NavigationSyncer`は[Navigation Api](https://github.com/WICG/navigation-api)を利用して履歴と同期する`Syncer`です。`NavigationSyncer`のコンストラクタには`window.navigation`相当の API を渡す必要があります。

```tsx
const navigationSyncer = new NavigationSyncer(window?.navigation);
```

## Store

`Store`は`location-state`の state 保存先のインターフェースです。`Store`を実装することで、state 保存先をカスタマイズすることができます。

### Store options

TBW: StateSerializer など

### `StorageStore`

TBW

### `URLStore`

TBW

### custom `Store`

TBW

### `getHooksWith`

`useLocationState`の`storeName`を型引数で指定し、カスタムフックを作成することができます。任意の Store を実装したい場合に便利です。

```ts
export const { useLocationState, useLocationStateValue, useLocationSetState } =
  getHooksWith<"local" | "indexeddb">();
```
