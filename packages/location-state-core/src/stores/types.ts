export type Listener = () => void;

type StateSerializer = (value: Record<string, unknown>) => string;
type StateDeserialize = (value: string) => Record<string, unknown>;

export type Serializer = {
  stateSerialize: StateSerializer;
  stateDeserialize: StateDeserialize;
};

export type Store = {
  subscribe(name: string, listener: Listener): () => void;

  get(name: string): unknown;

  set(name: string, value: unknown): void;

  load(key: string): void;

  save(): void;
};
