class AssertsError extends Error {
  constructor(message: string) {
    super(`Assert Error: ${message}`);
    this.name = "AssertsError";
  }
}

export function assertRecord(
  value: unknown,
): asserts value is Record<string, unknown> {
  if (value === null) {
    throw new AssertsError("Expected object but got null");
  }
  if (Array.isArray(value)) {
    throw new AssertsError("Expected object but got array");
  }
  if (typeof value !== "object") {
    throw new AssertsError(`Expected object but got ${typeof value}`);
  }
}

export function assertArray(value: unknown): asserts value is Array<unknown> {
  if (!Array.isArray(value)) {
    throw new AssertsError(`Expected array but got ${typeof value}`);
  }
}
