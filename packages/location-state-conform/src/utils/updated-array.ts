export function insertedAt<T>(array: T[], index: number, value: T): T[] {
  return [...array.slice(0, index), value, ...array.slice(index)];
}

export function removedAt<T>(array: T[], index: number): T[] {
  return [...array.slice(0, index), ...array.slice(index + 1)];
}

export function reorderedAt<T>(array: T[], from: number, to: number): T[] {
  const nextArray = [...array];
  const removed = nextArray.splice(from, 1);
  nextArray.splice(to, 0, ...removed);
  return nextArray;
}
