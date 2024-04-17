type LeafNode = string | number | boolean;
type LeafNodeParent = Record<string, LeafNode>;
type Node = {
  [key: string]: Node | Array<Node> | LeafNodeParent | LeafNode;
};

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
  pathSegments.reduce<[Node, Node | LeafNode]>(
    // @ts-ignore
    ([currentSrc, currentDest], pathSegment, index) => {
      // When last segment is reached, update the value.
      if (index === pathSegments.length - 1) {
        const value =
          typeof updaterOrValue === "function"
            ? updaterOrValue(currentSrc[pathSegment])
            : updaterOrValue;

        if (typeof pathSegment === "number") {
          assertArray(currentDest);
          currentDest[pathSegment] = value;
          return [currentSrc, currentDest];
        }

        assertRecord(currentDest);
        currentDest[pathSegment] = value;
        return [currentSrc, currentDest];
      }

      const currentNodeFromSrc = currentSrc[pathSegment];

      if (typeof pathSegments[index + 1] === "number") {
        // When next `pathSegment` is number, current node is array.
        assertArray(currentNodeFromSrc);

        if (typeof pathSegment === "number") {
          assertArray(currentDest);
          currentDest[pathSegment] = [...currentNodeFromSrc];
          return [currentNodeFromSrc, currentDest[pathSegment]];
        }

        assertRecord(currentDest);
        currentDest[pathSegment] = [...currentNodeFromSrc];
        return [currentNodeFromSrc, currentDest[pathSegment]];
      }

      // When next `pathSegment` is string, current node is object.
      assertRecord(currentNodeFromSrc);

      if (typeof pathSegment === "number") {
        assertArray(currentDest);
        currentDest[pathSegment] = { ...currentNodeFromSrc };
        return [currentNodeFromSrc, currentDest[pathSegment]];
      }

      assertRecord(currentDest);
      currentDest[pathSegment] = { ...currentNodeFromSrc };
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

function assertRecord(
  value: unknown,
): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`Expected object but got ${typeof value}`);
  }
}

function assertArray(value: unknown): asserts value is Array<unknown> {
  if (!Array.isArray(value)) {
    throw new Error(`Expected array but got ${typeof value}`);
  }
}
