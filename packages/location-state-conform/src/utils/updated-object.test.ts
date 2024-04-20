import { describe, expect, test } from "vitest";
import { updatedWithPath } from "./updated-object";

describe("object path setter", () => {
  test.each<{
    explain: string;
    src: Record<string, unknown>;
    path: string;
    value: unknown;
    expected: Record<string, unknown>;
  }>([
    {
      explain: "update a string value",
      src: { a: "a default value" },
      path: "a",
      value: "updated value",
      expected: { a: "updated value" },
    },
    {
      explain: "update a string value to empty object",
      src: {},
      path: "a",
      value: "updated value",
      expected: { a: "updated value" },
    },
    {
      explain: "update a number value",
      src: { a: 1 },
      path: "a",
      value: 2,
      expected: { a: 2 },
    },
    {
      explain: "update a nested value and keep other values",
      src: {
        a: { b: "b default value", c: "c default value" },
        d: { e: "d default value" },
      },
      path: "a.b",
      value: "updated value",
      expected: {
        a: { b: "updated value", c: "c default value" },
        d: { e: "d default value" },
      },
    },
    {
      explain: "update a nested value in an array and keep other values",
      src: {
        a: { b: [{ c: "c default value" }] },
        d: { e: "d default value" },
      },
      path: "a.b[0].c",
      value: "updated value",
      expected: {
        a: { b: [{ c: "updated value" }] },
        d: { e: "d default value" },
      },
    },
    {
      explain: "update a nested value in an empty array and keep other values",
      src: {
        a: { b: [] },
        d: { e: "d default value" },
      },
      path: "a.b[0].c",
      value: "updated value",
      expected: {
        a: { b: [{ c: "updated value" }] },
        d: { e: "d default value" },
      },
    },
    {
      explain: "update a nested value in a nested array and keep other values",
      src: {
        a: { b: [{ c: [{ d: "d default value" }] }] },
        d: { e: "d default value" },
      },
      path: "a.b[0].c[0].d",
      value: "updated value",
      expected: {
        a: { b: [{ c: [{ d: "updated value" }] }] },
        d: { e: "d default value" },
      },
    },
    {
      explain: "update a nested value in an empty object and keep other values",
      src: {
        a: {},
        d: { e: "d default value" },
      },
      path: "a.b.c",
      value: "updated value",
      expected: {
        a: { b: { c: "updated value" } },
        d: { e: "d default value" },
      },
    },
  ])("update with $explain .", ({ src, path, value, expected }) => {
    // Act
    const result = updatedWithPath(src, path, value);
    // Assert
    expect(result).toEqual(expected);
  });

  test("src is not changed, and return value's some member are same reference.", () => {
    // Arrange
    const target = {
      a: { b: "b default value" },
      c: { d: "c.d default value" },
    };
    // Act
    const result = updatedWithPath(target, "a.b", "updated value");
    // Assert
    expect(target).toEqual({
      a: { b: "b default value" },
      c: { d: "c.d default value" },
    });
    expect(result).toEqual({
      a: { b: "updated value" },
      c: { d: "c.d default value" },
    });
    expect(result.c).toBe(target.c);
  });
});
