"use client";

import {
  type DefaultStoreName,
  type Refine,
  useLocationState,
} from "@location-state/core";
import { useId } from "react";
import { type ZodType, z } from "zod";

const zodRefine =
  <T,>(schema: ZodType<T>): Refine<T> =>
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
      <button type="button" onClick={() => setCounter(counter + 1)}>
        increment
      </button>
    </section>
  );
}
