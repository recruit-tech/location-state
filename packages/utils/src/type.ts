export type Pretty<T> = {
  [K in keyof T]: T[K];
} & {};

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
