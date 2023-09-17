"use client";

import { useLocationState, DefaultStoreName } from "@location-state/core";
import { useId } from "react";

export function List({ storeName }: { storeName: DefaultStoreName }) {
  const [displayList, setDisplayList] = useLocationState({
    name: "display-list",
    defaultValue: false,
    storeName,
  });
  const list = Array(displayList ? 100 : 0).fill(0);
  console.debug("rendered List", { storeName, displayList });

  const sectionId = useId();

  return (
    <section aria-labelledby={sectionId}>
      <h2 id={sectionId}>{storeName} store list</h2>
      <label>
        <input
          aria-label={`${storeName} display list`}
          type="checkbox"
          checked={displayList}
          onChange={(event) => setDisplayList(event.currentTarget.checked)}
        />
        Display List
      </label>
      <ul>
        {list.map((_, index) => (
          <li key={index}>{index}</li>
        ))}
      </ul>
    </section>
  );
}
