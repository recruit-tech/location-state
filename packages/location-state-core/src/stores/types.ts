export type Listener = () => void;

type Serialize = (value: Record<string, unknown>) => string;
type Deserialize = (value: string) => Record<string, unknown>;

export type StateSerializer = {
  serialize: Serialize;
  deserialize: Deserialize;
};

type Unsubscribe = () => void;

export type Store = {
  subscribe(name: string, listener: Listener): Unsubscribe;

  get(name: string): unknown;

  set(name: string, value: unknown): void;

  load(key: string): void;

  onLoad(listener: Listener): Unsubscribe;

  save(): void;
};
