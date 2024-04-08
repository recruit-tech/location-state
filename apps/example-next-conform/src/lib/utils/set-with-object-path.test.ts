import { describe, expect, test } from "vitest";
import { setWithObjectPath } from "./set-with-object-path";

describe("object path setter", () => {
  test("shallow member set 1 to 2", () => {
    // Arrange
    const target = { a: 1 };
    // Act
    const result = setWithObjectPath(target, "a", 2);
    // Assert
    expect(target).toEqual({ a: 1 });
    expect(result).toEqual({ a: 2 });
  });

  test("deep member set 1 to 2", () => {
    // Arrange
    const target = { a: { b: 1 } };
    // Act
    const result = setWithObjectPath(target, "a.b", 2);
    // Assert
    expect(target).toEqual({ a: { b: 1 } });
    expect(result).toEqual({ a: { b: 2 } });
  });

  test("deep member with array set 1 to 2", () => {
    // Arrange
    const target = { a: { b: [1] } };
    // Act
    const result = setWithObjectPath(target, "a.b[0]", 2);
    // Assert
    expect(target).toEqual({ a: { b: [1] } });
    expect(result).toEqual({ a: { b: [2] } });
  });

  test("deep member include array path set 1 to 2", () => {
    // Arrange
    const target = { a: [{ b: [1] }] };
    // Act
    const result = setWithObjectPath(target, "a[0].b[0]", 2);
    // Assert
    expect(target).toEqual({ a: [{ b: [1] }] });
    expect(result).toEqual({ a: [{ b: [2] }] });
  });
});
