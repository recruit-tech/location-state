import { describe } from "vitest";
import { insertedAt, removedAt, reorderedAt } from "./updated-array";

describe("`insertAt`", () => {
  test.each<{
    explain: string;
    src: number[];
    index: number;
    value: number;
    expected: number[];
  }>([
    {
      explain: "should insert an element at the beginning.",
      src: [1, 2, 3, 4, 5],
      index: 0,
      value: 6,
      expected: [6, 1, 2, 3, 4, 5],
    },
    {
      explain: "should insert an element in the middle.",
      src: [1, 2, 3, 4, 5],
      index: 2,
      value: 6,
      expected: [1, 2, 6, 3, 4, 5],
    },
    {
      explain: "should insert an element at the end.",
      src: [1, 2, 3, 4, 5],
      index: 5,
      value: 6,
      expected: [1, 2, 3, 4, 5, 6],
    },
    {
      explain: "should insert an element at the beginning of an empty array.",
      src: [],
      index: 0,
      value: 1,
      expected: [1],
    },
    {
      explain: "should insert an element at the end of an one-element array.",
      src: [1],
      index: 0,
      value: 2,
      expected: [2, 1],
    },
    {
      explain: "should insert an element at the end of an two-element array.",
      src: [1],
      index: 1,
      value: 2,
      expected: [1, 2],
    },
  ])("$explain", ({ src, index, value, expected }) => {
    // Act
    const actual = insertedAt(src, index, value);
    // Assert
    expect(actual).toEqual(expected);
  });
});

describe("`removedAt`", () => {
  test.each<{
    explain: string;
    src: number[];
    index: number;
    expected: number[];
  }>([
    {
      explain: "should remove an element at the middle.",
      src: [1, 2, 3, 4, 5],
      index: 2,
      expected: [1, 2, 4, 5],
    },
    {
      explain: "should remove an element at the beginning.",
      src: [1, 2, 3, 4, 5],
      index: 0,
      expected: [2, 3, 4, 5],
    },
    {
      explain: "should remove an element at the end.",
      src: [1, 2, 3, 4, 5],
      index: 4,
      expected: [1, 2, 3, 4],
    },
    {
      explain: "should remove an element from an one-element array.",
      src: [1],
      index: 0,
      expected: [],
    },
    {
      explain: "should remove an element from a two-element array.",
      src: [1, 2],
      index: 1,
      expected: [1],
    },
    {
      explain: "should remove an element from a two-element array.",
      src: [1, 2],
      index: 2,
      expected: [1, 2],
    },
  ])("$explain", ({ src, index, expected }) => {
    // Act
    const actual = removedAt(src, index);
    // Assert
    expect(actual).toEqual(expected);
  });
});

describe("`reorderedAt`", () => {
  test.each<{
    explain: string;
    src: number[];
    from: number;
    to: number;
    expected: number[];
  }>([
    {
      explain: "should reorder an element from the beginning to the middle.",
      src: [1, 2, 3, 4, 5],
      from: 0,
      to: 2,
      expected: [2, 3, 1, 4, 5],
    },
    {
      explain: "should reorder an element from the middle to the beginning.",
      src: [1, 2, 3, 4, 5],
      from: 2,
      to: 0,
      expected: [3, 1, 2, 4, 5],
    },
    {
      explain: "should reorder an element from the end to the middle.",
      src: [1, 2, 3, 4, 5],
      from: 4,
      to: 0,
      expected: [5, 1, 2, 3, 4],
    },
    {
      explain: "should reorder an element from the beginning to the end.",
      src: [1, 2, 3, 4, 5],
      from: 0,
      to: 4,
      expected: [2, 3, 4, 5, 1],
    },
    {
      explain: "should reorder an element from the end to the end.",
      src: [1, 2, 3, 4, 5],
      from: 4,
      to: 4,
      expected: [1, 2, 3, 4, 5],
    },
    {
      explain: "should reorder an element from the beginning to the beginning.",
      src: [1, 2, 3, 4, 5],
      from: 0,
      to: 0,
      expected: [1, 2, 3, 4, 5],
    },
    {
      explain:
        "should reorder an element from the beginning to the beginning of an one-element array.",
      src: [1],
      from: 0,
      to: 0,
      expected: [1],
    },
    {
      explain:
        "should reorder an element from the beginning to the end of an one-element array.",
      src: [1, 2],
      from: 0,
      to: 1,
      expected: [2, 1],
    },
    {
      explain:
        "should reorder an element from the end to the beginning of an one-element array.",
      src: [1, 2],
      from: 1,
      to: 0,
      expected: [2, 1],
    },
  ])("$explain", ({ src, from, to, expected }) => {
    // Act
    const actual = reorderedAt(src, from, to);
    // Assert
    expect(actual).toEqual(expected);
  });
});
