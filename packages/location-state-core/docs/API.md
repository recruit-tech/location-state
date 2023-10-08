# API

- [State hooks](#State-hooks)
  - [type `LocationStateDefinition`](#type-LocationStateDefinition)
  - [type `Refine`](#type-Refine)

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

#### Type Parameters

- `T`: state の型
- `StoreName`: `Store`の名前として指定できる型

#### Parameters

- `name`: `storeName`で指定された`Store`内における現在の履歴位置で state を一意に識別する名前
- `defaultValue`: `Store`に state がない場合に State hooks が返すデフォルト値
- `storeName`: state の保存先となる`Store`の名前。デフォルトでは`"session"`と`"url"`の 2 つが利用可能（型引数`StoreName`で変更可能）
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

`Store`から取り出された state を検証・変換する関数の型です。バリデーションに失敗しても、例外は throw しないでください。

#### Type Parameters

- `T`: state の型

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
