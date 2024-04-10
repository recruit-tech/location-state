/**
 * Returns an updated object with `object` paths.
 *
 * @param src The object you want to update.
 * @param path The path to the value you want to update. You can contain arrays.
 * @param value The value you want to update.
 */
export function updatedWithObjectPath<T extends Record<string, unknown>>(
  src: T,
  path: string,
  value: unknown,
): T {
  const paths = getPathSegments(path);
  const dest: Record<string, unknown> | unknown[] = { ...src };
  paths.reduce(
    ([currentSrc, currentDest], path, index) => {
      if (index === paths.length - 1) {
        currentDest[path] = value;
        return [currentSrc, currentDest];
      }
      // If the next path is number, then array.
      if (typeof paths[index + 1] === "number") {
        currentDest[path] = [...((currentSrc[path] ?? []) as unknown[])];
        return [currentSrc[path], currentDest[path]];
      }
      currentDest[path] = {
        ...(currentSrc[path] as Record<string, unknown>),
      };
      return [currentSrc[path], currentDest[path]];
    },
    [src, dest],
  );
  return dest as T;
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
