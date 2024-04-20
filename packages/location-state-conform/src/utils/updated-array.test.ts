import { describe } from "vitest";
import { insertedAt, removedAt, reorderedAt } from "./updated-array";

describe("`insertAt`", () => {
  test("should insert an element at the specified index.", () => {
    // Act
    const actual = insertedAt([1, 2, 3, 4, 5], 2, 6);
    // Assert
    expect(actual).toEqual([1, 2, 6, 3, 4, 5]);
  });
});

describe("`removedAt`", () => {
  test("should remove an element at the specified index.", () => {
    // Act
    const actual = removedAt([1, 2, 3, 4, 5], 2);
    // Assert
    expect(actual).toEqual([1, 2, 4, 5]);
  });
});

describe("`reorderedAt`", () => {
  test("should reorder an element from one index to another.", () => {
    // Act
    const actual = reorderedAt([1, 2, 3, 4, 5], 2, 4);
    // Assert
    expect(actual).toEqual([1, 2, 4, 5, 3]);
  });
});
