# API

- [State hooks](#State-hooks)
  - [type `LocationStateDefinition`](#type-LocationStateDefinition)
  - [function `useLocationState`](#function-useLocationState)
  - [function `useLocationStateValue`](#function-uselocationstatevalue)
  - [function `useLocationSetState`](#function-useLocationSetState)
- [Provider](#provider)
  - [component `<LocationStateProvider>`](#component-Locationstateprovider)
  - [function `createDefaultStores`](#function-createDefaultStores)
- [Syncer](#syncer)
  - [class `NavigationSyncer`](#class-NavigationSyncer)
- [Store](#store)
  - [type `Stores`](#type-stores)
  - [class `StorageStore`](#class-StorageStore)
  - [class `URLStore`](#class-URLStore)
  - [function`getHooksWith`](#function-gethookswith)

## State hooks

State hooks は [`<LocationStateProvider>`](#Locationstateprovider) の子孫コンポーネントでのみ利用可能です。

### type `LocationStateDefinition`

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

State hooks の共通オプションは`LocationStateDefinition`として上記のように定義されています。

> **Warning**
> State hooks はこのオプションを最初のレンダリング時に 1 度だけ評価します。**再レンダリング時に異なる値を渡しても反映されません**。

#### Parameters

- `name`: `storeName`で指定された`Store`内における現在の履歴位置で state を一意に識別する名前
- `defaultValue`: `Store`に state がない場合に State hooks が返すデフォルト値
- `storeName`: state の保存先となる`Store`の名前。デフォルトでは`"session"`と`"url"`の 2 つが利用可能（[カスタマイズ可能](#function-gethookswith)）
- `refine?`: `Store`から取り出された state を検証・変換する関数。[Refine](#type-refine)を参照

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

```ts
type Refine<T> = (state: unknown) => T | undefined;
```

`Store`から取り出された state を検証・変換する関数の型です。復元値のバリデーションに失敗しても、例外は throw せず`undefined`を返すなどしてください。

#### Parameters

- `state`: 永続先から取得された値

#### Returns

検証した state の値か変換した値、または`undefined`を返します。`undefined`を返すと State hooks は`LocationStateDefinition`の`defaultValue`で指定された値を state として返します。

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
  refine: zodRefine(
    // Migration of state that were previously type `string`, but are now type `number`.
    z.union([
      z.number(),
      z
        .string()
        .regex(/\d+/)
        .transform((v) => Number(v)),
    ]),
  ),
});
```

### function `useLocationState`

```ts
declare const useLocationState: <T>(
  definition: LocationStateDefinition<T, DefaultStoreName>,
) => [T, SetState<T>];
```

指定の`Store`から現在の履歴位置に関連付けられた状態のアクセスを可能にします。このフックは指定された状態に変更があった場合に、コンポーネントを再レンダリングするようにサブスクライブします。

#### Parameters

- `definition`: [`LocationStateDefinition`](#type-locationstatedefinition)を参照

#### Returns

1 つ目は state、2 つ目の要素は state 更新関数の配列を返します。

#### Example

```ts
const [count, setCount] = useLocationState({
  name: "count",
  defaultValue: 0,
  storeName: "session",
});
```

### function `useLocationStateValue`

```ts
declare const useLocationStateValue: <T>(
  definition: LocationStateDefinition<T, DefaultStoreName>,
) => T;
```

指定の`Store`から現在の履歴位置に関連付けられた状態の参照を可能にします。このフックは指定された状態に変更があった場合に、コンポーネントを再レンダリングするようにサブスクライブします。

#### Parameters

- `definition`: [`LocationStateDefinition`](#type-locationstatedefinition)を参照

#### Returns

state を返します。

#### Example

```ts
const count = useLocationStateValue({
  name: "count",
  defaultValue: 0,
  storeName: "session",
});
```

### function `useLocationSetState`

```ts
declare const useLocationSetState: <T>(
  definition: LocationStateDefinition<T, DefaultStoreName>,
) => SetState<T>;
```

指定の`Store`から現在の履歴位置に関連付けられた状態の更新を可能にします。

#### Parameters

- `definition`: [`LocationStateDefinition`](#type-locationstatedefinition)を参照

#### Returns

state の更新関数を返します。

#### Example

```ts
const setCount = useLocationSetState({
  name: "count",
  defaultValue: 0,
  storeName: "session",
});
```

## Provider

### component `<LocationStateProvider>`

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

`location-state`の Context を提供します。

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

### function `createDefaultStores`

```ts
export declare const createDefaultStores: (syncer: Syncer) => Stores;
```

`<LocationStateProvider>`がデフォルトで利用する[`Stores`](#type-stores)を作成します。

#### Parameters

- `syncer?`: `location-state`が履歴と同期する方法を指定します。[`Syncer`](#syncer)を実装している必要があります。

#### Returns

`session`と`url`をプロパティに持った [`Stores`](#type-stores)を返します。

| ストア名    | ストア         | 説明                                             |
| ----------- | -------------- | ------------------------------------------------ |
| `"session"` | `StorageStore` | 状態をセッションストレージに永続化するストアです |
| `"url"`     | `URLStore`     | 状態を URL のクエリ文字列に永続化するストアです  |

#### Example

```ts
const defaultStores = createDefaultStores(syncer);
```

## Syncer

```ts
type Syncer = {
  key(): string | undefined;
  sync(arg: { listener: (key: string) => void; signal: AbortSignal }): void;
  updateURL(url: string): void;
};
```

`Syncer`は履歴と同期するためのインターフェースです。`Syncer`を実装することで、履歴と同期する方法をカスタマイズすることができます。

### class `NavigationSyncer`

```ts
export declare class NavigationSyncer implements Syncer {
  constructor(navigation?: Navigation | undefined);
}
```

`NavigationSyncer`は[Navigation API](https://github.com/WICG/navigation-api)を利用して履歴と同期する`Syncer`です。`NavigationSyncer`のコンストラクタには`window.navigation`相当の Object を渡す必要があります。

#### Parameters

- `navigation?`: `window.navigation`、もしくは[Navigation API](https://github.com/WICG/navigation-api)の polyfill を渡してください。

#### Example

```tsx
const navigationSyncer = new NavigationSyncer(
  typeof window !== "undefined" ? window.navigation : undefined,
);
```

#### `unsafeNavigation`

Navigation API をサポートしていないブラウザのために、`unsafeNavigation`という API を提供しています。これは Navigation API の挙動を部分的にサポートした polyfill 的なものですが、実装範囲は必要最小限でライブラリとして**積極的なテスト・サポートをしているわけではありません**。

```tsx
import { unsafeNavigation } from "@location-state/core/unsafe-navigation";

const navigationSyncer = new NavigationSyncer(unsafeNavigation);
```

## Store

```ts
type Store = {
  subscribe(name: string, listener: Listener): () => void;
  get(name: string): unknown;
  set(name: string, value: unknown): void;
  load(key: string): void;
  save(): void;
};
```

`Store`は`location-state`の state 保存先のインターフェースです。`Store`を実装することで、state 保存先をカスタマイズすることができます。

### type `Stores`

```ts
export type Stores = Record<string, Store>;
```

`Stores`は`Store`の key-value object です。

### class `StorageStore`

TBW

### class `URLStore`

TBW

### function `getHooksWith`

```ts
export const { useLocationState, useLocationStateValue, useLocationSetState } =
  getHooksWith<"local" | "indexeddb">();
```

`useLocationState`の`storeName`を型引数で指定し、型引数のストア名に束縛された State hooks を返します。任意の Store を実装したい場合に便利です。
