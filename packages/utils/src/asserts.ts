export function assertRecord(
  value: unknown,
): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`Assert Error: Expected object but got ${typeof value}`);
  }
}

export function assertArray(value: unknown): asserts value is Array<unknown> {
  if (!Array.isArray(value)) {
    throw new Error(`Assert Error: Expected array but got ${typeof value}`);
  }
}
