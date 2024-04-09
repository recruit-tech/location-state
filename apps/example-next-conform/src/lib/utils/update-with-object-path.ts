/**
 * Update values for `object` paths.
 *
 * @param object The object you want to update.
 * @param path The path to the value you want to update. You can contain arrays.
 * @param value The value you want to update.
 */
export function updateWithObjectPath<T extends Record<string, unknown>>(
  object: T,
  path: string,
  value: unknown,
): T {
  const paths = getPathSegments(path);
  const target: Record<string, unknown> | unknown[] = { ...object };
  paths.reduce(
    ([currentSrc, currentTarget], path, index) => {
      if (index === paths.length - 1) {
        currentTarget[path] = value;
        return [currentSrc, currentTarget];
      }
      // If the next path is number, then array.
      if (typeof paths[index + 1] === "number") {
        currentTarget[path] = [...((currentSrc[path] ?? []) as unknown[])];
        return [currentSrc[path], currentTarget[path]];
      }
      currentTarget[path] = {
        ...(currentSrc[path] as Record<string, unknown>),
      };
      return [currentSrc[path], currentTarget[path]];
    },
    [object, target],
  );
  return target as T;
}

// Return path segments separated by `. ` or `[]`.
function getPathSegments(path: string): (string | number)[] {
  return path.split(/\.|\[|]\./).map((segment) => {
    const key = segment.replace(/]$/, "");
    if (Number.isNaN(Number(key))) {
      return key;
    }
    return Number(key);
  });
}
