/**
 * Update values for `object` paths.
 *
 * @param object The object you want to update.
 * @param path The path to the value you want to update. You can contain arrays.
 * @param value The value you want to update.
 */
export function setWithObjectPath<T extends Record<string, unknown>>(
  object: T,
  path: string,
  value: unknown,
): T {
  const copied = structuredClone(object);
  const paths = getPathSegments(path);
  let target: Record<string, unknown> | Record<string, unknown>[] = copied;
  paths.forEach((segment, index) => {
    if (index === paths.length - 1) {
      target[segment.key] = value;
    } else {
      if (segment.type === "array") {
        target = target[segment.key] as Record<string, unknown>[];
      } else {
        target = (target[segment.key] as Record<string, unknown>) || {};
      }
    }
  });
  return copied;
}

type Path =
  | {
      type: "object";
      key: string;
    }
  | {
      type: "array";
      key: number;
    };

// Return path segments separated by `. ` or `[]`.
function getPathSegments(path: string): Path[] {
  return path.split(/\.|\[|]\./).map((segment) => {
    const key = segment.replace(/]$/, "");
    if (Number.isNaN(Number(key))) {
      return {
        key,
        type: "object",
      };
    }
    return {
      key: Number(key),
      type: "array",
    };
  });
}
