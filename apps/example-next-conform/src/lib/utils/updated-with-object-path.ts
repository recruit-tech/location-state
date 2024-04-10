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
  const paths = getPaths(path);
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
// https://github.com/edmundhung/conform/blob/28f453bb636b7881ba971c62cf961a84b7b65d51/packages/conform-dom/formdata.ts#L33-L52
export function getPaths(path: string): Array<string | number> {
  if (!path) {
    return [];
  }

  return path
    .split(/\.|(\[\d*\])/)
    .reduce<Array<string | number>>((result, segment) => {
      if (typeof segment !== "undefined" && segment !== "") {
        if (segment.startsWith("[") && segment.endsWith("]")) {
          const index = segment.slice(1, -1);

          result.push(Number(index));
        } else {
          result.push(segment);
        }
      }
      return result;
    }, []);
}
