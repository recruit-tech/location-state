import { assertArray, assertRecord } from "@repo/utils/asserts";

type PrimitiveValue = string | number | boolean;
type Node =
  | {
      [key: string]: Node | PrimitiveValue | undefined;
    }
  | Node[];

/**
 * Returns an updated object with `object` paths.
 *
 * @param src The object you want to update.
 * @param path The path to the value you want to update. You can contain arrays.
 * @param updaterOrValue The updater or value.
 */
export function updatedWithPath<T extends Record<string, unknown>>(
  src: T,
  path: string,
  updaterOrValue: unknown | ((currentValue: unknown) => unknown),
): T {
  const dest = { ...src };
  const pathSegments = getPathSegments(path);
  pathSegments.reduce<[Node, Node]>(
    ([currentSrc, currentDest], pathSegment, index) => {
      /**
       * When last segment is reached, update the value.
       */
      if (index === pathSegments.length - 1) {
        if (typeof pathSegment === "number") {
          assertArray(currentSrc);
          assertArray(currentDest);
          currentDest[pathSegment] =
            typeof updaterOrValue === "function"
              ? updaterOrValue(currentSrc[pathSegment])
              : updaterOrValue;
        } else {
          assertRecord(currentSrc);
          assertRecord(currentDest);
          currentDest[pathSegment] =
            typeof updaterOrValue === "function"
              ? updaterOrValue(currentSrc[pathSegment])
              : updaterOrValue;
        }

        // Not used, but return the last node for type checking.
        return [currentSrc, currentDest];
      }

      /**
       * current: Record, next: Array
       * Not supported: current: Array, next: Array
       */
      const nextPath = pathSegments[index + 1];
      if (typeof nextPath === "number") {
        if (typeof pathSegment === "number") {
          // e.g. a[0][0]
          throw new Error("Not Supported: Nested array in array");
        }

        assertRecord(currentSrc);
        assertRecord(currentDest);
        const nextSrc = currentSrc[pathSegment];
        assertArray(nextSrc);
        currentDest[pathSegment] = [...nextSrc];
        const nextDest = currentDest[pathSegment];
        assertArray(nextDest);

        return [nextSrc, nextDest];
      }

      /**
       * current: Array, next: Record
       */
      if (typeof pathSegment === "number") {
        assertArray(currentSrc);
        assertArray(currentDest);
        const nextSrc = currentSrc[pathSegment] ?? {};
        assertRecord(nextSrc);
        currentDest[pathSegment] = { ...nextSrc };
        const nextDest = currentDest[pathSegment];
        assertRecord(nextDest);

        return [nextSrc, nextDest];
      }

      /**
       * current: Record, next: Record
       */
      assertRecord(currentSrc);
      assertRecord(currentDest);
      const nextSrc = currentSrc[pathSegment] ?? {};
      assertRecord(nextSrc);
      currentDest[pathSegment] = { ...nextSrc };
      const nextDest = currentDest[pathSegment];
      assertRecord(nextDest);

      return [nextSrc, nextDest];
    },
    [src as Node, dest as Node],
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
