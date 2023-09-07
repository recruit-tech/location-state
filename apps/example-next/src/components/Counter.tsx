"use client";

import { useLocationState, StoreName } from "@location-state/core";
import { z } from "zod";

const schema = z.number();

export function Counter({ storeName }: { storeName: StoreName }) {
  const [counter, setCounter] = useLocationState({
    name: "counter",
    defaultValue: 0,
    storeName,
    refine: (value) => {
      const result = schema.safeParse(value);
      if (result.success) {
        return result.data;
      }
      return undefined;
    },
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
