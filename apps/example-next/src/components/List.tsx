"use client";

import { useLocationState, StoreName } from "@location-state/core";

export function List({ storeName }: { storeName: StoreName }) {
  const [displayList, setDisplayList] = useLocationState({
    name: "display-list",
    defaultValue: false,
    storeName,
  });
  const list = Array(displayList ? 100 : 0).fill(0);
  console.debug("rendered List", { storeName, displayList });

  return (
    <div>
      <p>
        storeName: <b>{storeName}</b> List
      </p>
      <label>
        <input
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
    </div>
  );
}
