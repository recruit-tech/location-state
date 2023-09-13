"use client";

import {
  useLocationState,
  DefaultStoreName,
  Refine,
} from "@location-state/core";
import { z, ZodType } from "zod";

const zodRefine =
  <T extends unknown>(schema: ZodType<T>): Refine<T> =>
  (value) => {
    const result = schema.safeParse(value);
    return result.success ? result.data : undefined;
  };

export function Counter({ storeName }: { storeName: DefaultStoreName }) {
  const [counter, setCounter] = useLocationState({
    name: "counter",
    defaultValue: 0,
    storeName,
    refine: zodRefine(z.number()),
  });
  console.debug("rendered Counter", { storeName, counter });

  return (
    <div>
      <p>
        storeName: <b>{storeName}</b>, counter: <b>{counter}</b>
      </p>
      <button onClick={() => setCounter(counter + 1)}>increment</button>
    </div>
  );
}
