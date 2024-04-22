import { describe } from "vitest";
import { insertedAt, removedAt, reorderedAt } from "./updated-array";

describe("`insertAt`", () => {
  test.each<{
    src: number[];
    index: number;
    value: number;
    expected: number[];
  }>([
    {
      src: [1, 2, 3, 4, 5],
      index: 0,
      value: 6,
      expected: [6, 1, 2, 3, 4, 5],
    },
    {
      src: [1, 2, 3, 4, 5],
      index: 2,
      value: 6,
      expected: [1, 2, 6, 3, 4, 5],
    },
    {
      src: [1, 2, 3, 4, 5],
      index: 5,
      value: 6,
      expected: [1, 2, 3, 4, 5, 6],
    },
    {
      src: [],
      index: 0,
      value: 1,
      expected: [1],
    },
    {
      src: [1],
      index: 0,
      value: 2,
      expected: [2, 1],
    },
    {
      src: [1],
      index: 1,
      value: 2,
      expected: [1, 2],
    },
  ])(
    "should insert an element at the specified index: $index value: $value .",
    ({ src, index, value, expected }) => {
      // Act
      const actual = insertedAt(src, index, value);
      // Assert
      expect(actual).toEqual(expected);
    },
  );
});

describe("`removedAt`", () => {
  test.each<{
    src: number[];
    index: number;
    value: number;
    expected: number[];
  }>([
    {
      src: [1, 2, 3, 4, 5],
      index: 2,
      value: 3,
      expected: [1, 2, 4, 5],
    },
    {
      src: [1, 2, 3, 4, 5],
      index: 0,
      value: 1,
      expected: [2, 3, 4, 5],
    },
    {
      src: [1, 2, 3, 4, 5],
      index: 4,
      value: 5,
      expected: [1, 2, 3, 4],
    },
    {
      src: [1],
      index: 0,
      value: 1,
      expected: [],
    },
    {
      src: [1, 2],
      index: 1,
      value: 2,
      expected: [1],
    },
    {
      src: [1, 2],
      index: 2,
      value: 3,
      expected: [1, 2],
    },
  ])(
    "should remove an element at the specified index: $index value: $value .",
    ({ src, index, value, expected }) => {
      // Act
      const actual = removedAt(src, index);
      // Assert
      expect(actual).toEqual(expected);
    },
  );
});

describe("`reorderedAt`", () => {
  test.each<{
    src: number[];
    from: number;
    to: number;
    expected: number[];
  }>([
    {
      src: [1, 2, 3, 4, 5],
      from: 0,
      to: 2,
      expected: [2, 3, 1, 4, 5],
    },
    {
      src: [1, 2, 3, 4, 5],
      from: 2,
      to: 0,
      expected: [3, 1, 2, 4, 5],
    },
    {
      src: [1, 2, 3, 4, 5],
      from: 4,
      to: 0,
      expected: [5, 1, 2, 3, 4],
    },
    {
      src: [1, 2, 3, 4, 5],
      from: 0,
      to: 4,
      expected: [2, 3, 4, 5, 1],
    },
    {
      src: [1, 2, 3, 4, 5],
      from: 4,
      to: 4,
      expected: [1, 2, 3, 4, 5],
    },
    {
      src: [1, 2, 3, 4, 5],
      from: 0,
      to: 0,
      expected: [1, 2, 3, 4, 5],
    },
    {
      src: [1],
      from: 0,
      to: 0,
      expected: [1],
    },
    {
      src: [1, 2],
      from: 0,
      to: 1,
      expected: [2, 1],
    },
    {
      src: [1, 2],
      from: 1,
      to: 0,
      expected: [2, 1],
    },
  ])(
    "should reorder an element from $from to $to.",
    ({ src, from, to, expected }) => {
      // Act
      const actual = reorderedAt(src, from, to);
      // Assert
      expect(actual).toEqual(expected);
    },
  );
});
