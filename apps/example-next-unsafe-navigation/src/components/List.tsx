"use client";

import { type DefaultStoreName, useLocationState } from "@location-state/core";
import { useId } from "react";

export function List({ storeName }: { storeName: DefaultStoreName }) {
  const [displayList, setDisplayList] = useLocationState({
    name: "display-list",
    defaultValue: false,
    storeName,
  });
  const list = Array(100).fill(0);
  console.debug("rendered List", { storeName, displayList });

  const sectionId = useId();
  const accordionId = useId();

  return (
    <section aria-labelledby={sectionId}>
      <h2 id={sectionId}>{storeName} store list</h2>
      <label>
        <input
          type="checkbox"
          checked={displayList}
          onChange={(event) => setDisplayList(event.currentTarget.checked)}
          aria-expanded={displayList}
          aria-controls={accordionId}
        />
        Display List
      </label>
      <ul
        id={accordionId}
        style={{
          display: displayList ? "block" : "none",
        }}
      >
        {list.map((_, index) => (
          // biome-ignore lint: noArrayIndexKey
          <li key={index}>{index}</li>
        ))}
      </ul>
    </section>
  );
}
