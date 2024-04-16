/**
 * Returns an updated object with `object` paths.
 *
 * @param src The object you want to update.
 * @param path The path to the value you want to update. You can contain arrays.
 * @param updaterOrValue The updater or value.
 */
export function updatedWithObjectPath<T extends Record<string, unknown>>(
  src: T,
  path: string,
  updaterOrValue: unknown | ((currentValue: unknown) => unknown),
): T {
  const dest = { ...src };
  const pathSegments = getPathSegments(path);
  pathSegments.reduce(
    ([currentSrc, currentDest], pathSegment, index) => {
      if (index === pathSegments.length - 1) {
        currentDest[pathSegment] =
          typeof updaterOrValue === "function"
            ? updaterOrValue(currentSrc[pathSegment])
            : updaterOrValue;
        return [currentSrc, currentDest];
      }
      const nextPath = pathSegments[index + 1];
      if (typeof nextPath === "number") {
        currentDest[pathSegment] = [...(currentSrc[pathSegment] ?? [])];
        return [
          currentSrc[pathSegment] ?? new Array<unknown>(nextPath + 1).fill({}),
          currentDest[pathSegment],
        ];
      }
      currentDest[pathSegment] = { ...currentSrc[pathSegment] };
      return [currentSrc[pathSegment] ?? {}, currentDest[pathSegment]];
    },
    [src ?? {}, dest],
  );
  return dest;
}

// Return path segments separated by `. ` or `[]`.
// https://github.com/edmundhung/conform/blob/28f453bb636b7881ba971c62cf961a84b7b65d51/packages/conform-dom/formdata.ts#L33-L52
export function getPathSegments(path: string): Array<string | number> {
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
