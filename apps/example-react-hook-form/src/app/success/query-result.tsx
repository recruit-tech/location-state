"use client";

import { useSearchParams } from "next/navigation";

export function QueryResult() {
  const params = useSearchParams();

  return (
    <code>
      <pre>{JSON.stringify(Object.fromEntries(params.entries()), null, 2)}</pre>
    </code>
  );
}
