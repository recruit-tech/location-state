import { setTimeout } from "node:timers/promises";
import { describe, expect, test, vi } from "vitest";
import { createDebounce } from "./debounce";

describe("1debounce instance.", () => {
  const debounce = createDebounce();

  test("If 0 is specified, callback is immediately executed.", async () => {
    // Arrange
    const callback = vi.fn();
    // Act
    debounce(callback, 0);
    // Assert
    await setTimeout(1); // Wait for small delay to ensure callback is called
    expect(callback).toBeCalledTimes(1);
  });

  test("If 100 is specified, callback is not immediately executed.", async () => {
    // Arrange
    const callback = vi.fn();
    // Act
    debounce(callback, 100);
    // Assert
    expect(callback).not.toBeCalled();
  });

  test("If 100 is specified, callback is executed after 100ms.", async () => {
    // Arrange
    const callback = vi.fn();
    // Act
    debounce(callback, 100);
    // Assert
    await setTimeout(100);
    expect(callback).toBeCalledTimes(1);
  });

  test("If double execution is called within 100ms, callback is executed only once.", async () => {
    // Arrange
    const callback = vi.fn();
    debounce(callback, 100);
    // Act
    debounce(callback, 100);
    // Assert
    await setTimeout(100);
    expect(callback).toBeCalledTimes(1);
  });

  test("If double execution is called after 100ms, callback is executed twice.", async () => {
    // Arrange
    const callback = vi.fn();
    debounce(callback, 100);
    await setTimeout(100);
    // Act
    debounce(callback, 100);
    // Assert
    await setTimeout(100);
    expect(callback).toBeCalledTimes(2);
  });
});

describe("Use different debounce at the same time.", () => {
  const debounce1 = createDebounce();
  const debounce2 = createDebounce();

  test("If 100 is specified with each debounce, callback is executed after 100ms.", async () => {
    // Arrange
    const callback = vi.fn();
    debounce1(callback, 100);
    // Act
    debounce2(callback, 100);
    // Assert
    await setTimeout(100);
    expect(callback).toBeCalledTimes(2);
  });
});
