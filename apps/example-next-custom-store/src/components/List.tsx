"use client";

import { useLocationStateInMemory } from "@/lib/location-hooks";
import { useId } from "react";

export function List() {
  const [displayList, setDisplayList] = useLocationStateInMemory({
    name: "display-list",
    defaultValue: false,
    storeName: "in-memory",
  });
  const list = Array(100).fill(0);
  console.debug("rendered List", { displayList });

  const sectionId = useId();
  const accordionId = useId();

  return (
    <section aria-labelledby={sectionId}>
      <h2 id={sectionId}>in memory store list</h2>
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
          <li key={index}>{index}</li>
        ))}
      </ul>
    </section>
  );
}
