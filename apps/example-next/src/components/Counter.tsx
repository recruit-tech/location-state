"use client";

import {
  useLocationState,
  DefaultStoreName,
  Refine,
} from "@location-state/core";
import { useId } from "react";
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

  const sectionId = useId();

  return (
    <section aria-labelledby={sectionId}>
      <h2 id={sectionId}>{storeName} store counter</h2>
      <p>
        counter: <b>{counter}</b>
      </p>
      <button onClick={() => setCounter(counter + 1)}>increment</button>
    </section>
  );
}
