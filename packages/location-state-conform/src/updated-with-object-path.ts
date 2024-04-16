type LeafNode = string | number | boolean;
type LeafNodeParent = Record<string, LeafNode> | Array<LeafNode>;
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
      if (index === pathSegments.length - 1) {
        if (Array.isArray(currentDest)) {
          assertNumber(pathSegment);
          currentDest[pathSegment] =
            typeof updaterOrValue === "function"
              ? updaterOrValue(currentSrc[pathSegment])
              : updaterOrValue;
          return [currentSrc, currentDest];
        }
        assertString(pathSegment);
        assertHasKey(currentDest, pathSegment);
        currentDest[pathSegment] =
          typeof updaterOrValue === "function"
            ? updaterOrValue(currentSrc[pathSegment])
            : updaterOrValue;
        return [currentSrc, currentDest];
      }
      const nextPath = pathSegments[index + 1];
      if (typeof nextPath === "number") {
        if (typeof pathSegment === "number") {
          const child = currentSrc[pathSegment] ?? [];
          assertArray(child);
          assertArray(currentDest);
          currentDest[pathSegment] = [...child];
          return [
            currentSrc[pathSegment] ??
              new Array<unknown>(nextPath + 1).fill({}),
            currentDest[pathSegment],
          ];
        }
        const child = currentSrc[pathSegment] ?? [];
        assertArray(child);
        assertHasKey(currentDest, pathSegment);
        currentDest[pathSegment] = [...child] as Array<Node>;
        return [
          currentSrc[pathSegment] ?? new Array<unknown>(nextPath + 1).fill({}),
          currentDest[pathSegment],
        ];
      }
      if (typeof pathSegment === "number") {
        const child = currentSrc[pathSegment] ?? {};
        assertRecord(child);
        assertArray(currentDest);
        currentDest[pathSegment] = {
          ...child,
        };
        return [child, currentDest[pathSegment]];
      }
      const child = currentSrc[pathSegment];
      assertRecord(currentDest);
      assertRecord(child);
      currentDest[pathSegment] = {
        ...child,
      };
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

function assertNumber(value: unknown): asserts value is number {
  if (typeof value !== "number") {
    throw new Error(`Expected number but got ${typeof value}`);
  }
}

function assertString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(`Expected string but got ${typeof value}`);
  }
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

function assertHasKey(
  value: unknown,
  key: string,
): asserts value is Record<typeof key, unknown> {
  if (typeof value !== "object" || value === null || !(key in value)) {
    throw new Error(`Expected object with key ${key}`);
  }
}
