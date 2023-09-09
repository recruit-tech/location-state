export type Listener = () => void;

type Deserialize = (value: string) => Record<string, unknown>;
type Serialize = (value: Record<string, unknown>) => string;

export type Serializer = {
  deserialize: Deserialize;
  serialize: Serialize;
};

export type Store = {
  subscribe(name: string, listener: Listener): () => void;

  get(name: string): unknown;

  set(name: string, value: unknown): void;

  load(key: string): void;

  save(): void;
};
