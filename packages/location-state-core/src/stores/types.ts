export type Listener = () => void;

type Serialize = (value: Record<string, unknown>) => string;
type Deserialize = (value: string) => Record<string, unknown>;

export type StateSerializer = {
  serialize: Serialize;
  deserialize: Deserialize;
};

export type Store = {
  subscribe(name: string, listener: Listener): () => void;

  get(name: string): unknown;

  set(name: string, value: unknown): void;

  load(key: string): void;

  save(): void;
};
